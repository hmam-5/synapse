import { describe, it, expect } from 'vitest'
import type {
  AppRole,
  TaskStatus,
  TaskPriority,
  Organization,
  User,
  Project,
  Task,
  CreateProjectPayload,
  CreateTaskPayload,
  UpdateProjectPayload,
  UpdateTaskPayload,
} from '@/lib/types'

describe('TypeScript types', () => {
  it('AppRole enum values are valid', () => {
    const roles: AppRole[] = ['super_admin', 'org_admin', 'manager', 'team_member', 'guest']
    expect(roles).toHaveLength(5)
    roles.forEach((r) => expect(typeof r).toBe('string'))
  })

  it('TaskStatus enum values are valid', () => {
    const statuses: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done', 'canceled']
    expect(statuses).toHaveLength(5)
  })

  it('TaskPriority enum values are valid', () => {
    const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']
    expect(priorities).toHaveLength(4)
  })

  it('Organization interface shapes correctly', () => {
    const org: Organization = {
      id: 'uuid-1',
      name: 'Acme Corp',
      slug: 'acme-corp',
      logo_url: null,
      billing_plan: 'free',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    expect(org.id).toBe('uuid-1')
    expect(org.slug).toBe('acme-corp')
    expect(org.logo_url).toBeNull()
  })

  it('User interface shapes correctly', () => {
    const user: User = {
      id: 'uuid-2',
      email: 'user@acme.com',
      full_name: 'Test User',
      avatar_url: null,
      global_role: 'guest',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    expect(user.email).toBe('user@acme.com')
    expect(user.is_active).toBe(true)
  })

  it('Project interface shapes correctly with optional fields', () => {
    const project: Project = {
      id: 'uuid-3',
      organization_id: 'uuid-1',
      team_id: null,
      name: 'Test Project',
      identifier: 'TST',
      description: null,
      is_private: false,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    expect(project.identifier).toBe('TST')
    expect(project.team_id).toBeNull()
    expect(project.task_count).toBeUndefined()
  })

  it('Task interface shapes correctly with relations', () => {
    const task: Task = {
      id: 'uuid-4',
      organization_id: 'uuid-1',
      project_id: 'uuid-3',
      title: 'Fix bug',
      description: 'Fix the critical bug',
      status: 'in_progress',
      priority: 'high',
      assignee_id: 'uuid-2',
      reporter_id: 'uuid-2',
      due_date: '2026-02-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    expect(task.status).toBe('in_progress')
    expect(task.priority).toBe('high')
    expect(task.assignee).toBeUndefined()
  })

  it('CreateProjectPayload requires mandatory fields', () => {
    const payload: CreateProjectPayload = {
      name: 'New Project',
      identifier: 'NP',
      organization_id: 'uuid-1',
    }
    expect(payload.name).toBe('New Project')
    expect(payload.description).toBeUndefined()
    expect(payload.is_private).toBeUndefined()
  })

  it('CreateTaskPayload requires mandatory fields', () => {
    const payload: CreateTaskPayload = {
      title: 'New Task',
      project_id: 'uuid-3',
      organization_id: 'uuid-1',
    }
    expect(payload.title).toBe('New Task')
    expect(payload.status).toBeUndefined()
    expect(payload.priority).toBeUndefined()
  })

  it('UpdateProjectPayload only requires id', () => {
    const payload: UpdateProjectPayload = {
      id: 'uuid-3',
      name: 'Updated Name',
    }
    expect(payload.id).toBe('uuid-3')
    expect(payload.description).toBeUndefined()
  })

  it('UpdateTaskPayload handles nullable fields', () => {
    const payload: UpdateTaskPayload = {
      id: 'uuid-4',
      assignee_id: null,
      due_date: null,
    }
    expect(payload.assignee_id).toBeNull()
    expect(payload.due_date).toBeNull()
  })
})
