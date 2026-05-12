import { Users, Mail, Shield, Plus, AlertCircle, Clock, UserMinus } from 'lucide-react'
import Link from 'next/link'
import { getTeamMembers, getInvitations, inviteMember } from './actions'
import type { AppRole } from '@/lib/types'
import { MemberActions } from './member-actions'

const roleConfig: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-500/20 text-purple-400' },
  org_admin: { label: 'Admin', color: 'bg-blue-500/20 text-blue-400' },
  manager: { label: 'Manager', color: 'bg-cyan-500/20 text-cyan-400' },
  team_member: { label: 'Member', color: 'bg-green-500/20 text-green-400' },
  guest: { label: 'Guest', color: 'bg-slate-500/20 text-slate-400' },
}

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const error = (await searchParams)?.error
  let members: Awaited<ReturnType<typeof getTeamMembers>> = []
  let invitations: Awaited<ReturnType<typeof getInvitations>> = []

  try {
    members = await getTeamMembers()
    invitations = await getInvitations()
  } catch {
    // Supabase might not be configured yet
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage members, roles, and invitations</p>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      {/* Invite Form */}
      <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Invite a Team Member
        </h3>
        <form action={inviteMember} className="flex flex-col sm:flex-row gap-4">
          <input type="hidden" name="organization_id" value="" />
          <input
            name="email"
            type="email"
            required
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            placeholder="colleague@enterprise.com"
          />
          <select
            name="role"
            className="px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
          >
            <option value="team_member">Team Member</option>
            <option value="manager">Manager</option>
            <option value="org_admin">Admin</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Send Invite
          </button>
        </form>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="border border-border bg-card rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending Invitations
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full ml-2">{invitations.length}</span>
            </h3>
          </div>
          <div className="divide-y divide-border">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4 px-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited by {inv.inviter?.full_name || inv.inviter?.email || 'Unknown'} • Expires {new Date(inv.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleConfig[inv.role]?.color || ''}`}>
                  {roleConfig[inv.role]?.label || inv.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Members */}
      <div className="border border-border bg-card rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Members
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">{members.length}</span>
          </h3>
        </div>

        {members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No team members found. Invite someone to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 px-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-medium">
                    {member.user?.full_name?.charAt(0) || member.user?.email?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.user?.full_name || 'Unnamed User'}</p>
                    <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                  </div>
                </div>
                <MemberActions memberId={member.id} currentRole={member.role} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
