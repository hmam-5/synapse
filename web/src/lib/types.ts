// ============================================================
// SYNAPSE: Core TypeScript Types
// Mirrors the database schema for full type safety
// ============================================================

export type AppRole = 'super_admin' | 'org_admin' | 'manager' | 'team_member' | 'guest';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'canceled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  billing_plan: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  global_role: AppRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: User;
}

export interface Team {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  team_id: string | null;
  name: string;
  identifier: string;
  description: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  // Computed / joined
  task_count?: number;
  team?: Team;
}

export interface Task {
  id: string;
  organization_id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  reporter_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  assignee?: User;
  reporter?: User;
  project?: Project;
}

// ---- Form / Action payloads ----

export interface CreateProjectPayload {
  name: string;
  identifier: string;
  description?: string;
  organization_id: string;
  team_id?: string;
  is_private?: boolean;
}

export interface UpdateProjectPayload {
  id: string;
  name?: string;
  description?: string;
  is_private?: boolean;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  project_id: string;
  organization_id: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  due_date?: string;
}

export interface UpdateTaskPayload {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
}
