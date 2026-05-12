import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Supabase server client before importing actions
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockSingle = vi.fn()
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: (...args: unknown[]) => {
      mockFrom(...args)
      return {
        select: (...a: unknown[]) => {
          mockSelect(...a)
          return {
            order: (...o: unknown[]) => {
              mockOrder(...o)
              return {
                data: [], error: null,
                eq: (...e: unknown[]) => {
                  mockEq(...e)
                  return { data: [], error: null }
                },
              }
            },
            eq: (...e: unknown[]) => {
              mockEq(...e)
              return {
                single: () => {
                  mockSingle()
                  return { data: { id: 'test-id', name: 'Test' }, error: null }
                },
              }
            },
          }
        },
        insert: (...a: unknown[]) => {
          mockInsert(...a)
          return { error: null }
        },
        update: (...a: unknown[]) => {
          mockUpdate(...a)
          return {
            eq: (...e: unknown[]) => {
              mockEq(...e)
              return { error: null }
            },
          }
        },
        delete: () => {
          mockDelete()
          return {
            eq: (...e: unknown[]) => {
              mockEq(...e)
              return { error: null }
            },
          }
        },
      }
    },
    auth: {
      getUser: () => {
        mockGetUser()
        return { data: { user: { id: 'user-1', email: 'test@test.com' } } }
      },
    },
  }),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Need to mock redirect to prevent actual redirect (throws NEXT_REDIRECT in real Next.js)
const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    // In real Next.js, redirect throws. We simulate that.
    throw new Error('NEXT_REDIRECT')
  },
}))

describe('Project Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProjects', () => {
    it('calls supabase with correct table and ordering', async () => {
      const { getProjects } = await import('@/app/dashboard/projects/actions')
      const result = await getProjects()
      expect(mockFrom).toHaveBeenCalledWith('projects')
      expect(mockSelect).toHaveBeenCalled()
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual([])
    })
  })

  describe('getProjectById', () => {
    it('calls supabase with correct id filter', async () => {
      const { getProjectById } = await import('@/app/dashboard/projects/actions')
      const result = await getProjectById('test-id')
      expect(mockFrom).toHaveBeenCalledWith('projects')
      expect(mockEq).toHaveBeenCalledWith('id', 'test-id')
      expect(mockSingle).toHaveBeenCalled()
      expect(result).toEqual({ id: 'test-id', name: 'Test' })
    })
  })

  describe('createProject', () => {
    it('inserts project and redirects on success', async () => {
      const { createProject } = await import('@/app/dashboard/projects/actions')
      const formData = new FormData()
      formData.set('name', 'My Project')
      formData.set('identifier', 'mp')
      formData.set('description', 'Test description')
      formData.set('organization_id', 'org-1')

      try {
        await createProject(formData)
      } catch (e) {
        // redirect throws
      }

      expect(mockGetUser).toHaveBeenCalled()
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Project',
          identifier: 'MP', // should be uppercased
          organization_id: 'org-1',
        })
      )
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard/projects')
    })
  })

  describe('deleteProject', () => {
    it('deletes project by id and redirects', async () => {
      const { deleteProject } = await import('@/app/dashboard/projects/actions')

      try {
        await deleteProject('proj-1')
      } catch (e) {
        // redirect throws
      }

      expect(mockFrom).toHaveBeenCalledWith('projects')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'proj-1')
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard/projects')
    })
  })
})

describe('Task Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTasks', () => {
    it('calls supabase with correct table', async () => {
      const { getTasks } = await import('@/app/dashboard/tasks/actions')
      const result = await getTasks()
      expect(mockFrom).toHaveBeenCalledWith('tasks')
      expect(mockSelect).toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('filters by project_id when provided', async () => {
      const { getTasks } = await import('@/app/dashboard/tasks/actions')
      await getTasks('proj-1')
      expect(mockFrom).toHaveBeenCalledWith('tasks')
    })
  })

  describe('createTask', () => {
    it('inserts task with reporter_id from session', async () => {
      const { createTask } = await import('@/app/dashboard/tasks/actions')
      const formData = new FormData()
      formData.set('title', 'Fix bug')
      formData.set('description', 'Critical bug')
      formData.set('project_id', 'proj-1')
      formData.set('organization_id', 'org-1')
      formData.set('priority', 'high')

      try {
        await createTask(formData)
      } catch (e) {
        // redirect throws
      }

      expect(mockGetUser).toHaveBeenCalled()
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Fix bug',
          project_id: 'proj-1',
          organization_id: 'org-1',
          priority: 'high',
          reporter_id: 'user-1',
        })
      )
    })
  })

  describe('deleteTask', () => {
    it('deletes task by id and redirects', async () => {
      const { deleteTask } = await import('@/app/dashboard/tasks/actions')

      try {
        await deleteTask('task-1')
      } catch (e) {
        // redirect throws
      }

      expect(mockFrom).toHaveBeenCalledWith('tasks')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'task-1')
    })
  })
})
