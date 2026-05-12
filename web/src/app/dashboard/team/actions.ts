'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getTeamMembers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organization_members')
    .select('*, user:users(id, email, full_name, avatar_url)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getInvitations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invitations')
    .select('*, inviter:users!invitations_invited_by_fkey(id, full_name, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function inviteMember(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const email = formData.get('email') as string
  const role = formData.get('role') as string || 'team_member'
  let orgId = formData.get('organization_id') as string

  // If no org ID is provided, fetch their default organization
  if (!orgId) {
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()
    
    if (orgMember) {
      orgId = orgMember.organization_id
    }
  }

  const { error } = await supabase.from('invitations').insert({
    email,
    role,
    organization_id: orgId,
    invited_by: user.id,
  })

  if (error) {
    redirect('/dashboard/team?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/team')
  redirect('/dashboard/team')
}

export async function revokeInvitation(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'expired' })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/team')
}

export async function removeMember(memberId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('id', memberId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/team')
}

export async function updateMemberRole(formData: FormData) {
  const supabase = await createClient()
  const memberId = formData.get('member_id') as string
  const role = formData.get('role') as string

  const { error } = await supabase
    .from('organization_members')
    .update({ role })
    .eq('id', memberId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/team')
}
