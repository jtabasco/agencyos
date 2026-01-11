'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { UpdateType } from '@/types/database'

export async function createUpdate(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const projectId = formData.get('project_id') as string
  const content = formData.get('content') as string
  const type = formData.get('type') as UpdateType

  const { error } = await supabase
    .from('updates')
    .insert({
      project_id: projectId,
      author_id: user.id,
      content,
      type,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function getProjectUpdates(projectId: string) {
  const supabase = await createClient()

  const { data: updates, error } = await supabase
    .from('updates')
    .select(`
      *,
      author:profiles!author_id(id, full_name, email, avatar_url)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, updates: [] }
  }

  return { updates }
}
