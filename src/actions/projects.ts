'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ProjectStatus } from '@/types/database'

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: 'Not authorized to create projects' }
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
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return { success: true, project }
}

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return { success: true }
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
