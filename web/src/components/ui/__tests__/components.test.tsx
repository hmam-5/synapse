import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    expect(container.firstChild).toHaveClass('bg-destructive')
  })

  it('shows loading spinner', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByText('Loading').closest('button')).toBeDisabled()
    expect(screen.getByText('Loading').closest('button')?.querySelector('svg')).toBeInTheDocument()
  })

  it('handles click', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled').closest('button')).toBeDisabled()
  })
})

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<Input label="Email" error="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows hint text', () => {
    render(<Input label="Name" hint="Your full name" />)
    expect(screen.getByText('Your full name')).toBeInTheDocument()
  })
})

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders dot indicator', () => {
    const { container } = render(<Badge dot variant="success">Live</Badge>)
    // Dot should be a span inside the badge
    const dots = container.querySelectorAll('span.rounded-full')
    expect(dots.length).toBeGreaterThan(0)
  })
})

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders composed cards', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardDescription>Description</CardDescription>
      </Card>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })
})

describe('Avatar', () => {
  it('shows initials from name', () => {
    render(<Avatar name="Jane Doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('shows initials from email fallback', () => {
    render(<Avatar email="test@example.com" />)
    expect(screen.getByText('TE')).toBeInTheDocument()
  })

  it('shows ?? for unknown', () => {
    render(<Avatar />)
    expect(screen.getByText('??')).toBeInTheDocument()
  })
})

describe('Select', () => {
  it('renders options', () => {
    render(
      <Select
        label="Priority"
        options={[
          { value: 'low', label: 'Low' },
          { value: 'high', label: 'High' },
        ]}
      />
    )
    expect(screen.getByLabelText('Priority')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
  })
})

describe('Textarea', () => {
  it('renders with label', () => {
    render(<Textarea label="Description" />)
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('shows error', () => {
    render(<Textarea label="Notes" error="Too short" />)
    expect(screen.getByText('Too short')).toBeInTheDocument()
  })
})
