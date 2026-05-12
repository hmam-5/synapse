'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTaskStatus(taskId: string, newStatus: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/tasks')
  return { success: true }
}
