'use client'

import { useTransition } from 'react'
import { UserMinus, Check, Shield } from 'lucide-react'
import { updateMemberRole, removeMember } from './actions'

const roleConfig: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-500/20 text-purple-400' },
  org_admin: { label: 'Admin', color: 'bg-blue-500/20 text-blue-400' },
  manager: { label: 'Manager', color: 'bg-cyan-500/20 text-cyan-400' },
  team_member: { label: 'Member', color: 'bg-green-500/20 text-green-400' },
  guest: { label: 'Guest', color: 'bg-slate-500/20 text-slate-400' },
}

export function MemberActions({ memberId, currentRole }: { memberId: string, currentRole: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-3">
      <form
        action={(formData) => {
          startTransition(() => {
            updateMemberRole(formData)
          })
        }}
        className="flex items-center gap-2"
      >
        <input type="hidden" name="member_id" value={memberId} />
        <select
          name="role"
          defaultValue={currentRole}
          onChange={(e) => e.target.form?.requestSubmit()}
          disabled={isPending}
          className={`text-xs font-medium px-2.5 py-1 rounded-full border-none outline-none cursor-pointer ${roleConfig[currentRole]?.color || 'bg-secondary'} disabled:opacity-50`}
        >
          {Object.entries(roleConfig).map(([val, { label }]) => (
            <option key={val} value={val} className="text-foreground bg-background">
              {label}
            </option>
          ))}
        </select>
      </form>

      <form
        action={() => {
          if (confirm('Are you sure you want to remove this member?')) {
            startTransition(() => {
              removeMember(memberId)
            })
          }
        }}
      >
        <button
          type="submit"
          disabled={isPending}
          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all disabled:opacity-50"
          title="Remove member"
        >
          <UserMinus className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
