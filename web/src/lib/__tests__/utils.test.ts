import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn() utility', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'end')).toBe('base end')
  })

  it('merges conflicting Tailwind classes (last wins)', () => {
    const result = cn('px-4 py-2', 'px-8')
    expect(result).toBe('py-2 px-8')
  })

  it('handles undefined and null gracefully', () => {
    expect(cn('a', undefined, null, 'b')).toBe('a b')
  })

  it('handles empty string', () => {
    expect(cn('')).toBe('')
  })

  it('handles array inputs', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })

  it('handles object inputs', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
  })
})
