-- ==============================================================================
-- SYNAPSE: AUDIT LOG & TEAM INVITATION SYSTEM
-- Phase 2: Compliance Audit Trail & Invitation Workflow
-- ==============================================================================

-- ==========================================
-- 1. AUDIT LOG TABLE
-- ==========================================
-- Immutable append-only log for compliance. Records every significant action.

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,               -- e.g., 'project.created', 'task.updated', 'member.invited'
    resource_type TEXT NOT NULL,         -- e.g., 'project', 'task', 'organization_member'
    resource_id UUID,                    -- ID of the affected resource
    metadata JSONB DEFAULT '{}',        -- Additional context (old values, new values, etc.)
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_audit_logs_org_id ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- RLS: Only org_admins and super_admins can view audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View Audit Logs" ON public.audit_logs
    FOR SELECT USING (
        public.get_jwt_global_role() = 'super_admin' OR
        public.get_jwt_org_role(organization_id) = 'org_admin'
    );

-- Audit logs are insert-only from server functions (SECURITY DEFINER)
-- No direct INSERT/UPDATE/DELETE policies for regular users

-- ==========================================
-- 2. AUDIT TRIGGER FUNCTION
-- ==========================================
-- Automatically logs INSERT/UPDATE/DELETE on critical tables

CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    _action TEXT;
    _resource_id UUID;
    _org_id UUID;
    _actor_id UUID;
    _metadata JSONB;
BEGIN
    -- Determine action
    _action := TG_TABLE_NAME || '.' || LOWER(TG_OP);

    -- Get actor from JWT
    _actor_id := (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::UUID;

    IF TG_OP = 'DELETE' THEN
        _resource_id := OLD.id;
        _org_id := OLD.organization_id;
        _metadata := to_jsonb(OLD);
    ELSIF TG_OP = 'UPDATE' THEN
        _resource_id := NEW.id;
        _org_id := NEW.organization_id;
        _metadata := jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        );
    ELSE -- INSERT
        _resource_id := NEW.id;
        _org_id := NEW.organization_id;
        _metadata := to_jsonb(NEW);
    END IF;

    INSERT INTO public.audit_logs (organization_id, actor_id, action, resource_type, resource_id, metadata)
    VALUES (_org_id, _actor_id, _action, TG_TABLE_NAME, _resource_id, _metadata);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit triggers to critical tables
CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_tasks AFTER INSERT OR UPDATE OR DELETE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_org_members AFTER INSERT OR UPDATE OR DELETE ON public.organization_members
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- ==========================================
-- 3. TEAM INVITATIONS TABLE
-- ==========================================

CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

CREATE TABLE public.invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role app_role NOT NULL DEFAULT 'team_member'::app_role,
    status invitation_status DEFAULT 'pending'::invitation_status,
    invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, email) -- Only one pending invite per email per org
);

CREATE INDEX idx_invitations_org_id ON public.invitations(organization_id);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_token ON public.invitations(token);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View Invitations" ON public.invitations
    FOR SELECT USING (
        public.get_jwt_global_role() = 'super_admin' OR
        public.get_jwt_org_role(organization_id) IN ('org_admin', 'manager')
    );

CREATE POLICY "Manage Invitations" ON public.invitations
    FOR ALL USING (
        public.get_jwt_global_role() = 'super_admin' OR
        public.get_jwt_org_role(organization_id) IN ('org_admin', 'manager')
    );

-- Trigger for updated_at
CREATE TRIGGER update_invitations_modtime BEFORE UPDATE ON public.invitations
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- 4. ACCEPT INVITATION FUNCTION
-- ==========================================
-- Called when a user clicks the invitation link

CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token TEXT)
RETURNS JSONB AS $$
DECLARE
    _invitation RECORD;
    _user_id UUID;
BEGIN
    _user_id := auth.uid();
    IF _user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'Not authenticated');
    END IF;

    -- Find the invitation
    SELECT * INTO _invitation
    FROM public.invitations
    WHERE token = invitation_token
      AND status = 'pending'
      AND expires_at > NOW();

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Invitation not found, expired, or already used');
    END IF;

    -- Verify the authenticated user's email matches the invitation
    IF (SELECT email FROM auth.users WHERE id = _user_id) != _invitation.email THEN
        RETURN jsonb_build_object('error', 'Email mismatch');
    END IF;

    -- Create the organization membership
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (_invitation.organization_id, _user_id, _invitation.role)
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role;

    -- Mark invitation as accepted
    UPDATE public.invitations
    SET status = 'accepted', accepted_at = NOW()
    WHERE id = _invitation.id;

    RETURN jsonb_build_object(
        'success', true,
        'organization_id', _invitation.organization_id,
        'role', _invitation.role::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
