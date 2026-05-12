'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type OnlineUser = {
  userId: string
  name: string
  avatarInitial: string
  online_at: string
}

/**
 * Hook to track online users in a workspace using Supabase Realtime Presence.
 */
export function useOnlinePresence(
  channelName: string,
  currentUser: { id: string; name: string }
) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(channelName, {
      config: { presence: { key: currentUser.id } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users: OnlineUser[] = []

        for (const [userId, presences] of Object.entries(state)) {
          const latest = presences[presences.length - 1] as { name?: string; online_at?: string }
          users.push({
            userId,
            name: (latest.name as string) || 'Unknown',
            avatarInitial: ((latest.name as string) || 'U').charAt(0).toUpperCase(),
            online_at: (latest.online_at as string) || new Date().toISOString(),
          })
        }

        setOnlineUsers(users)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            name: currentUser.name,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, currentUser.id, currentUser.name])

  return onlineUsers
}

/**
 * Online presence indicator - shows who is currently online in the workspace.
 */
export function OnlinePresenceBar({ users }: { users: OnlineUser[] }) {
  if (users.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((user) => (
          <div
            key={user.userId}
            className="w-7 h-7 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium text-primary relative"
            title={user.name}
          >
            {user.avatarInitial}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
          </div>
        ))}
        {users.length > 5 && (
          <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
            +{users.length - 5}
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {users.length} online
      </span>
    </div>
  )
}
