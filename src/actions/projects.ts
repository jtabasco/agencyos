'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ProjectStatus } from '@/types/database'

export async function createProject(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const clientId = formData.get('client_id') as string | null

  // Get current user's profile to set as manager
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Only owner and pm can create projects
  if (!profile || (profile.role !== 'owner' && profile.role !== 'pm')) {
    redirect('/projects?error=not_authorized')
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name,
      description: description || null,
      client_id: clientId || null,
      manager_id: user.id,
      status: 'onboarding',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error.message)
    redirect('/projects?error=project_creation_failed')
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  redirect(`/projects/${project.id}?toast=success&message=Proyecto+creado+exitosamente`)
}

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check authorization
  const { data: project } = await supabase
    .from('projects')
    .select('manager_id')
    .eq('id', projectId)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const canEdit = profile?.role === 'owner' || (profile?.role === 'pm' && project?.manager_id === user.id)

  if (!canEdit) {
    redirect(`/projects/${projectId}`)
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const status = formData.get('status') as ProjectStatus | null
  const clientId = formData.get('client_id') as string | null
  const progressPercent = formData.get('progress_percent') as string | null

  const updateData: Record<string, unknown> = {
    name,
    description: description || null,
    client_id: clientId || null,
  }

  if (status) {
    updateData.status = status
  }

  if (progressPercent !== null) {
    updateData.progress_percent = parseInt(progressPercent, 10)
  }

  const { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId)

  if (error) {
    console.error('Error updating project:', error.message)
    redirect(`/projects/${projectId}?error=update_failed`)
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}?toast=success&message=Proyecto+actualizado+exitosamente`)
}

export async function updateProjectProgress(projectId: string, progress: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('projects')
    .update({ progress_percent: progress })
    .eq('id', projectId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Only owner can delete projects
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'owner') {
    return { error: 'Only owner can delete projects' }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function addProjectMember(projectId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('project_members')
    .insert({
      project_id: projectId,
      user_id: userId,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  return { success: true }
}

export async function removeProjectMember(projectId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  return { success: true }
}

export async function cancelProject(projectId: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check authorization (owner or pm who manages the project)
  const { data: project } = await supabase
    .from('projects')
    .select('manager_id')
    .eq('id', projectId)
    .single()

  if (!project) {
    return { error: 'Project not found' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const canEdit = profile?.role === 'owner' || (profile?.role === 'pm' && project.manager_id === user.id)

  if (!canEdit) {
    return { error: 'Not authorized to cancel this project' }
  }

  // Update project status to cancelled
  const { error: projectError } = await supabase
    .from('projects')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
    })
    .eq('id', projectId)

  if (projectError) {
    console.error('Error cancelling project:', projectError.message)
    return { error: `Failed to cancel project: ${projectError.message}` }
  }

  // Cancel all tasks in the project
  const { error: tasksError } = await supabase
    .from('tasks')
    .update({ status: 'cancelled' })
    .eq('project_id', projectId)
    .neq('status', 'done') // Don't cancel already done tasks

  if (tasksError) {
    console.error('Error cancelling tasks:', tasksError.message)
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  revalidatePath(`/projects/${projectId}`)

  return { success: true }
}

export async function reactivateProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Only owner can reactivate
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'owner') {
    return { error: 'Only owners can reactivate projects' }
  }

  // Update project status to paused and clear cancellation reason
  const { error: projectError } = await supabase
    .from('projects')
    .update({
      status: 'paused',
      cancellation_reason: null,
    })
    .eq('id', projectId)

  if (projectError) {
    console.error('Error reactivating project:', projectError.message)
    return { error: `Failed to reactivate project: ${projectError.message}` }
  }

  // Reactivate cancelled tasks
  const { error: tasksError } = await supabase
    .from('tasks')
    .update({ status: 'todo' })
    .eq('project_id', projectId)
    .eq('status', 'cancelled')

  if (tasksError) {
    console.error('Error reactivating tasks:', tasksError.message)
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  revalidatePath(`/projects/${projectId}`)

  return { success: true }
}
