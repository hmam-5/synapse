'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ---- Profile ----

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const updates: Record<string, unknown> = {}
  const fullName = formData.get('full_name') as string
  if (fullName) updates.full_name = fullName

  const avatarUrl = formData.get('avatar_url') as string
  if (avatarUrl) updates.avatar_url = avatarUrl

  if (Object.keys(updates).length === 0) {
    redirect('/dashboard/settings?error=No+fields+to+update')
  }

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    redirect('/dashboard/settings?error=' + encodeURIComponent(error.message))
  }

  // Also update auth.users metadata
  await supabase.auth.updateUser({
    data: { full_name: fullName },
  })

  revalidatePath('/dashboard/settings')
  redirect('/dashboard/settings')
}

// ---- Organization Settings ----

export async function getOrganization(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateOrganization(formData: FormData) {
  const supabase = await createClient()
  const orgId = formData.get('organization_id') as string
  if (!orgId) {
    redirect('/dashboard/settings/organization?error=Missing+organization')
  }

  const updates: Record<string, unknown> = {}
  const name = formData.get('name') as string
  if (name) updates.name = name

  const slug = formData.get('slug') as string
  if (slug) updates.slug = slug

  const logoUrl = formData.get('logo_url') as string
  if (logoUrl) updates.logo_url = logoUrl

  if (Object.keys(updates).length === 0) {
    redirect('/dashboard/settings/organization?error=No+fields+to+update')
  }

  const { error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', orgId)

  if (error) {
    redirect('/dashboard/settings/organization?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/settings')
  redirect('/dashboard/settings/organization')
}

// ---- Password ----

import { z } from 'zod'

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(64),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  
  const parsed = passwordSchema.safeParse({
    newPassword: formData.get('new_password'),
    confirmPassword: formData.get('confirm_password'),
  })

  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0].message
    redirect('/dashboard/settings/security?error=' + encodeURIComponent(errorMsg))
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  })

  if (error) {
    redirect('/dashboard/settings/security?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/settings/security')
  redirect('/dashboard/settings/security?success=Password updated successfully')
}

// ---- Audit Logs ----

export async function getAuditLogs(orgId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('audit_logs')
    .select('*, actor:users(id, full_name, email, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (orgId) {
    query = query.eq('organization_id', orgId)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}
