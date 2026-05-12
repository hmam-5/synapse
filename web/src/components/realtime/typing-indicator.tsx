'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type TypingUser = {
  userId: string
  name: string
  timestamp: number
}

/**
 * Hook for broadcasting and receiving typing indicators via Supabase Realtime Presence.
 * 
 * @param channelName - Unique channel name (e.g., `project:${projectId}`)
 * @param currentUser - The current user's info
 */
export function useTypingIndicator(
  channelName: string,
  currentUser: { id: string; name: string }
) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(channelName, {
      config: { presence: { key: currentUser.id } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const now = Date.now()
        const typing: TypingUser[] = []

        for (const [userId, presences] of Object.entries(state)) {
          if (userId === currentUser.id) continue
          const latest = presences[presences.length - 1] as { typing?: boolean; name?: string; timestamp?: number }
          if (latest?.typing && latest.timestamp && now - latest.timestamp < 5000) {
            typing.push({
              userId,
              name: (latest.name as string) || 'Someone',
              timestamp: latest.timestamp as number,
            })
          }
        }

        setTypingUsers(typing)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            typing: false,
            name: currentUser.name,
            timestamp: Date.now(),
          })
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, currentUser.id, currentUser.name])

  const sendTyping = useCallback(() => {
    if (!channelRef.current) return

    channelRef.current.track({
      typing: true,
      name: currentUser.name,
      timestamp: Date.now(),
    })

    // Auto-stop typing after 3 seconds of inactivity
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      channelRef.current?.track({
        typing: false,
        name: currentUser.name,
        timestamp: Date.now(),
      })
    }, 3000)
  }, [currentUser.name])

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    channelRef.current?.track({
      typing: false,
      name: currentUser.name,
      timestamp: Date.now(),
    })
  }, [currentUser.name])

  return { typingUsers, sendTyping, stopTyping }
}

/**
 * Typing indicator display component.
 * Shows animated dots and user names.
 */
export function TypingIndicator({ users }: { users: TypingUser[] }) {
  if (users.length === 0) return null

  const names = users.map(u => u.name.split(' ')[0])
  let text: string

  if (names.length === 1) {
    text = `${names[0]} is typing`
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing`
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground py-1 px-2 animate-in fade-in duration-200">
      <div className="flex gap-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{text}</span>
    </div>
  )
}
