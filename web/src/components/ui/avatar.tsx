import { cn } from '@/lib/utils'

export interface AvatarProps {
  src?: string | null
  name?: string | null
  email?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

// Deterministic color from string
function hashColor(str: string): string {
  const colors = [
    'bg-blue-500/20 text-blue-400',
    'bg-purple-500/20 text-purple-400',
    'bg-emerald-500/20 text-emerald-400',
    'bg-amber-500/20 text-amber-400',
    'bg-rose-500/20 text-rose-400',
    'bg-cyan-500/20 text-cyan-400',
    'bg-indigo-500/20 text-indigo-400',
    'bg-pink-500/20 text-pink-400',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase()
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return '??'
}

export function Avatar({ src, name, email, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name, email)
  const identifier = name || email || 'unknown'

  if (src) {
    return (
      <img
        src={src}
        alt={name || email || 'Avatar'}
        className={cn(
          'rounded-full object-cover border border-border',
          sizeMap[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold border border-border',
        sizeMap[size],
        hashColor(identifier),
        className
      )}
      title={name || email || undefined}
    >
      {initials}
    </div>
  )
}

export function AvatarGroup({ children, max = 4, className }: { children: React.ReactNode; max?: number; className?: string }) {
  const childArray = Array.isArray(children) ? children : [children]
  const visible = childArray.slice(0, max)
  const remaining = childArray.length - max

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
          +{remaining}
        </div>
      )}
    </div>
  )
}
