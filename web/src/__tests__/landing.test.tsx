import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock the Supabase browser client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(),
  })),
}))

describe('Landing Page', () => {
  it('renders the hero heading', async () => {
    // Dynamic import to ensure mocks are set up first
    const { default: LandingPage } = await import('@/app/page')
    render(<LandingPage />)

    expect(screen.getByText(/Enterprise Collaboration,/i)).toBeInTheDocument()
    expect(screen.getByText(/Uncompromised./i)).toBeInTheDocument()
  })

  it('renders feature cards', async () => {
    const { default: LandingPage } = await import('@/app/page')
    render(<LandingPage />)

    expect(screen.getByText('Enterprise Security')).toBeInTheDocument()
    expect(screen.getByText('True Multi-Tenancy')).toBeInTheDocument()
    expect(screen.getByText('Lightning Fast')).toBeInTheDocument()
  })

  it('renders call-to-action links', async () => {
    const { default: LandingPage } = await import('@/app/page')
    render(<LandingPage />)

    const trialLink = screen.getByText(/Start Free Trial/i).closest('a')
    expect(trialLink).toHaveAttribute('href', '/auth/login')

    const docsLink = screen.getByText(/Read Documentation/i).closest('a')
    expect(docsLink).toHaveAttribute('href', '/docs')
  })

  it('renders the status badge', async () => {
    const { default: LandingPage } = await import('@/app/page')
    render(<LandingPage />)

    expect(screen.getByText('Synapse Platform v1.0 Live')).toBeInTheDocument()
  })
})
