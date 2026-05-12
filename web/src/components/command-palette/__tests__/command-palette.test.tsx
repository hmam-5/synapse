import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CommandPalette } from '@/components/command-palette/command-palette'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('CommandPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders closed by default', () => {
    render(<CommandPalette />)
    expect(screen.getByText('Search...')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Search pages, actions...')).not.toBeInTheDocument()
  })

  it('opens when button is clicked', () => {
    render(<CommandPalette />)
    fireEvent.click(screen.getByText('Search...'))
    expect(screen.getByPlaceholderText('Search pages, actions...')).toBeInTheDocument()
  })

  it('filters results based on query', async () => {
    render(<CommandPalette />)
    fireEvent.click(screen.getByText('Search...'))
    
    const input = screen.getByPlaceholderText('Search pages, actions...')
    fireEvent.change(input, { target: { value: 'Overview' } })
    
    expect(screen.getByText('Dashboard home')).toBeInTheDocument()
    expect(screen.queryByText('Manage projects')).not.toBeInTheDocument()
  })

  it('navigates when an item is clicked', async () => {
    render(<CommandPalette />)
    fireEvent.click(screen.getByText('Search...'))
    
    const overviewButton = screen.getByText('Overview').closest('button')
    if (overviewButton) fireEvent.click(overviewButton)
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })
})
