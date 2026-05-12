'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { CreateTaskPayload, UpdateTaskPayload } from '@/lib/types'

// ---- READ ----

export async function getTasks(projectId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('tasks')
    .select('*, assignee:users!tasks_assignee_id_fkey(id, full_name, email, avatar_url), project:projects(id, name, identifier)')
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function getTaskById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:users!tasks_assignee_id_fkey(id, full_name, email, avatar_url), reporter:users!tasks_reporter_id_fkey(id, full_name, email), project:projects(id, name, identifier)')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ---- CREATE ----

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const payload: CreateTaskPayload = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
    project_id: formData.get('project_id') as string,
    organization_id: formData.get('organization_id') as string,
    priority: (formData.get('priority') as CreateTaskPayload['priority']) || 'medium',
    status: (formData.get('status') as CreateTaskPayload['status']) || 'todo',
    assignee_id: (formData.get('assignee_id') as string) || undefined,
    due_date: (formData.get('due_date') as string) || undefined,
  }

  const { error } = await supabase.from('tasks').insert({
    ...payload,
    reporter_id: user.id,
  })

  if (error) {
    redirect('/dashboard/tasks?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/tasks')
  redirect('/dashboard/tasks')
}

// ---- UPDATE ----

export async function updateTask(formData: FormData) {
  const supabase = await createClient()

  const payload: UpdateTaskPayload = {
    id: formData.get('id') as string,
    title: (formData.get('title') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    status: (formData.get('status') as UpdateTaskPayload['status']) || undefined,
    priority: (formData.get('priority') as UpdateTaskPayload['priority']) || undefined,
    assignee_id: (formData.get('assignee_id') as string) || null,
    due_date: (formData.get('due_date') as string) || null,
  }

  const { id, ...updates } = payload
  // Remove undefined values so we don't unintentionally nullify fields
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  )

  const { error } = await supabase.from('tasks').update(cleanUpdates).eq('id', id!)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/tasks')
}

// ---- DELETE ----

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/tasks')
  redirect('/dashboard/tasks')
}
