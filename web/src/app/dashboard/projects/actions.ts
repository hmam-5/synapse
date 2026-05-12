'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { CreateProjectPayload, UpdateProjectPayload } from '@/lib/types'

// ---- READ ----

export async function getProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, team:teams(id, name)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getProjectById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, team:teams(id, name)')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ---- CREATE ----

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

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

  const payload: CreateProjectPayload = {
    name: formData.get('name') as string,
    identifier: (formData.get('identifier') as string).toUpperCase(),
    description: (formData.get('description') as string) || undefined,
    organization_id: orgId,
    is_private: formData.get('is_private') === 'on',
  }

  const { error } = await supabase.from('projects').insert(payload)

  if (error) {
    redirect('/dashboard/projects?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/projects')
  redirect('/dashboard/projects')
}

// ---- UPDATE ----

export async function updateProject(formData: FormData) {
  const supabase = await createClient()

  const payload: UpdateProjectPayload = {
    id: formData.get('id') as string,
    name: (formData.get('name') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    is_private: formData.get('is_private') === 'on',
  }

  const { id, ...updates } = payload
  const { error } = await supabase.from('projects').update(updates).eq('id', id)

  if (error) {
    redirect('/dashboard/projects?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/projects')
  redirect('/dashboard/projects')
}

// ---- DELETE ----

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/projects')
  redirect('/dashboard/projects')
}
