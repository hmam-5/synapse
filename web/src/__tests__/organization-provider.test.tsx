import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { OrganizationProvider, useOrganization } from '@/lib/providers/organization-provider'

// Mock Supabase client
const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: () => ({
      select: (...args: unknown[]) => {
        mockSelect(...args)
        return {
          eq: (...eqArgs: unknown[]) => {
            mockEq(...eqArgs)
            return {
              data: [
                {
                  organization_id: 'org-1',
                  role: 'org_admin',
                  organization: {
                    id: 'org-1',
                    name: 'Acme Corp',
                    slug: 'acme',
                    logo_url: null,
                    billing_plan: 'pro',
                    created_at: '2026-01-01',
                    updated_at: '2026-01-01',
                  },
                },
              ],
              error: null,
              single: () => {
                mockSingle()
                return { data: { role: 'org_admin' }, error: null }
              },
            }
          },
        }
      },
    }),
  }),
}))

// Test consumer component
function TestConsumer() {
  const { activeOrg, organizations, activeRole, isLoading } = useOrganization()
  if (isLoading) return <div>Loading...</div>
  return (
    <div>
      <span data-testid="org-count">{organizations.length}</span>
      <span data-testid="active-org">{activeOrg?.name ?? 'none'}</span>
      <span data-testid="active-role">{activeRole ?? 'none'}</span>
    </div>
  )
}

describe('OrganizationProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    })
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
  })

  it('renders children', () => {
    render(
      <OrganizationProvider>
        <div data-testid="child">Hello</div>
      </OrganizationProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(
      <OrganizationProvider>
        <TestConsumer />
      </OrganizationProvider>
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('fetches and sets organizations', async () => {
    render(
      <OrganizationProvider>
        <TestConsumer />
      </OrganizationProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('org-count').textContent).toBe('1')
    })

    expect(screen.getByTestId('active-org').textContent).toBe('Acme Corp')
    expect(screen.getByTestId('active-role').textContent).toBe('org_admin')
  })

  it('handles unauthenticated user gracefully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    render(
      <OrganizationProvider>
        <TestConsumer />
      </OrganizationProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('org-count').textContent).toBe('0')
    })
    expect(screen.getByTestId('active-org').textContent).toBe('none')
  })
})
