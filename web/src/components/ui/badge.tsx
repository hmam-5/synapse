import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'
  size?: 'sm' | 'md'
  dot?: boolean
}

export function Badge({
  className,
  variant = 'default',
  size = 'sm',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        // Variants
        variant === 'default' && 'bg-secondary text-secondary-foreground',
        variant === 'success' && 'bg-emerald-500/15 text-emerald-400',
        variant === 'warning' && 'bg-amber-500/15 text-amber-400',
        variant === 'error' && 'bg-red-500/15 text-red-400',
        variant === 'info' && 'bg-blue-500/15 text-blue-400',
        variant === 'outline' && 'border border-border text-muted-foreground',
        // Sizes
        size === 'sm' && 'px-2 py-0.5 text-xs gap-1',
        size === 'md' && 'px-2.5 py-1 text-xs gap-1.5',
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            variant === 'default' && 'bg-foreground/50',
            variant === 'success' && 'bg-emerald-400',
            variant === 'warning' && 'bg-amber-400',
            variant === 'error' && 'bg-red-400',
            variant === 'info' && 'bg-blue-400',
            variant === 'outline' && 'bg-muted-foreground'
          )}
        />
      )}
      {children}
    </span>
  )
}
