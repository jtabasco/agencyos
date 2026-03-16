'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { TaskStatus } from '@/types/database'

export async function createTask(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const projectId = formData.get('project_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const assignedTo = formData.get('assigned_to') as string | null
  const dueDate = formData.get('due_date') as string | null

  const { error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      title,
      description: description || null,
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
      status: 'todo',
    })

  if (error) {
    console.error('Error creating task:', error.message)
    redirect(`/projects/${projectId}?error=task_creation_failed`)
  }

  revalidatePath('/projects')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}?toast=success&message=Tarea+creada+exitosamente`)
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/tasks')
  return { success: true }
}

export async function updateTask(taskId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const assignedTo = formData.get('assigned_to') as string | null
  const dueDate = formData.get('due_date') as string | null
  const status = formData.get('status') as TaskStatus | null

  const updateData: Record<string, unknown> = {
    title,
    description: description || null,
    assigned_to: assignedTo || null,
    due_date: dueDate || null,
  }

  if (status) {
    updateData.status = status
  }

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/tasks')
  return { success: true }
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/tasks')
  return { success: true }
}
