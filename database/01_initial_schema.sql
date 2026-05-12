-- ==============================================================================
-- SYNAPSE: ENTERPRISE MULTI-TENANT SAAS DATABASE SCHEMA
-- Phase 1: Database Architecture & Advanced RBAC
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. ENUMS & DOMAINS
-- ==========================================
-- Using ENUMs for strict type safety on roles and status fields
CREATE TYPE public.app_role AS ENUM ('super_admin', 'org_admin', 'manager', 'team_member', 'guest');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'canceled');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- ==========================================
-- 2. CORE TABLES
-- ==========================================

-- Organizations (Tenants)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    billing_plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (Extending Supabase auth.users)
-- Stores application-level user data, decoupled but linked to Auth
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    global_role app_role DEFAULT 'guest'::app_role, -- For system-wide admins (e.g., Synapse staff)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Members (The junction table linking Users <-> Orgs with roles)
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'team_member'::app_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id) -- A user can only have one membership record per org
);

-- Teams
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
CREATE TABLE public.team_members (
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

-- Projects
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    identifier TEXT NOT NULL, -- e.g., 'SYN' for task prefixes like SYN-101
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, identifier)
);

-- Tasks
-- Denormalizing organization_id here is an architectural decision to optimize RLS policies 
-- and prevent deep nested JOINs on every read query.
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status task_status DEFAULT 'todo',
    priority task_priority DEFAULT 'medium',
    assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. ADVANCED RBAC & CUSTOM JWT CLAIMS
-- ==========================================
-- To prevent expensive database JOINS in our Row Level Security (RLS) policies,
-- we inject the user's organization roles directly into their Supabase JWT `app_metadata`.

-- Function to aggregate roles and update the auth.users JWT
CREATE OR REPLACE FUNCTION public.update_user_jwt_claims()
RETURNS TRIGGER AS $$
DECLARE
    _org_roles JSONB;
    _global_role TEXT;
    _target_user_id UUID;
BEGIN
    -- Determine the target user ID based on trigger operation
    _target_user_id := COALESCE(NEW.user_id, OLD.user_id);

    -- Aggregate all organization roles for this user into a JSON object: {"org_uuid": "role"}
    SELECT jsonb_object_agg(organization_id::text, role::text)
    INTO _org_roles
    FROM public.organization_members
    WHERE user_id = _target_user_id;

    -- Fetch global role
    SELECT global_role::text INTO _global_role
    FROM public.users
    WHERE id = _target_user_id;

    -- Update the app_metadata in Supabase's auth.users table
    UPDATE auth.users
    SET app_metadata = jsonb_build_object(
        'provider', app_metadata->'provider',
        'providers', app_metadata->'providers',
        'global_role', COALESCE(_global_role, 'guest'),
        'org_roles', COALESCE(_org_roles, '{}'::jsonb)
    )
    WHERE id = _target_user_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recalculate claims whenever an organization membership changes
CREATE TRIGGER on_org_member_change
    AFTER INSERT OR UPDATE OR DELETE ON public.organization_members
    FOR EACH ROW EXECUTE FUNCTION public.update_user_jwt_claims();

-- Helper function to extract user's role for a specific org directly from the session JWT
CREATE OR REPLACE FUNCTION public.get_jwt_org_role(org_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' -> 'org_roles' ->> org_id::text);
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper function to extract the global role from the session JWT
CREATE OR REPLACE FUNCTION public.get_jwt_global_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'global_role');
END;
$$ LANGUAGE plpgsql STABLE;

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Users Policy: Users can view themselves and other users in the same organization
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- Organizations Policy: Accessible if user is Super Admin OR has a role in the org's JWT claim
CREATE POLICY "View Organizations" ON public.organizations
    FOR SELECT USING (
        public.get_jwt_global_role() = 'super_admin' OR 
        public.get_jwt_org_role(id) IS NOT NULL
    );

CREATE POLICY "Manage Organizations" ON public.organizations
    FOR UPDATE USING (
        public.get_jwt_global_role() = 'super_admin' OR 
        public.get_jwt_org_role(id) = 'org_admin'
    );

-- Organization Members Policy
CREATE POLICY "View Org Members" ON public.organization_members
    FOR SELECT USING (
        public.get_jwt_global_role() = 'super_admin' OR 
        public.get_jwt_org_role(organization_id) IS NOT NULL
    );

CREATE POLICY "Manage Org Members" ON public.organization_members
    FOR ALL USING (
        public.get_jwt_global_role() = 'super_admin' OR 
        public.get_jwt_org_role(organization_id) IN ('org_admin', 'manager')
    );

-- Projects Policy
CREATE POLICY "View Projects" ON public.projects
    FOR SELECT USING (
        public.get_jwt_global_role() = 'super_admin' OR 
        public.get_jwt_org_role(organization_id) IS NOT NULL
    );

CREATE POLICY "Manage Projects" ON public.projects
    FOR ALL USING (
        public.get_jwt_global_role() = 'super_admin' OR 
        public.get_jwt_org_role(organization_id) IN ('org_admin', 'manager')
    );

-- Tasks Policy (Benefiting from denormalized organization_id)
CREATE POLICY "View Tasks" ON public.tasks
    FOR SELECT USING (
        public.get_jwt_global_role() = 'super_admin' OR 
        public.get_jwt_org_role(organization_id) IS NOT NULL
    );

CREATE POLICY "Manage Tasks" ON public.tasks
    FOR ALL USING (
        public.get_jwt_global_role() = 'super_admin' OR 
        public.get_jwt_org_role(organization_id) IN ('org_admin', 'manager', 'team_member')
    );

-- ==========================================
-- 5. PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX idx_teams_org_id ON public.teams(organization_id);
CREATE INDEX idx_projects_org_id ON public.projects(organization_id);
CREATE INDEX idx_projects_team_id ON public.projects(team_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_org_id ON public.tasks(organization_id);
CREATE INDEX idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);

-- ==========================================
-- 6. AUTOMATED TIMESTAMP UPDATES
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_org_modtime BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_modified_column();
