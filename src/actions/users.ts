'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/database'

export async function updateUserRole(userId: string, newRole: UserRole) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if current user is owner
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'owner') {
    return { error: 'Only owners can change user roles' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/team')
  return { success: true }
}

export async function inviteUser(email: string, role: UserRole) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if current user is owner
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'owner') {
    return { error: 'Only owners can invite team members' }
  }

  const adminClient = await createAdminClient()
  
  // Invite the user
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
    data: {
      role: role // This will be used by the handle_new_user trigger
    }
  })

  if (inviteError) {
    return { error: inviteError.message }
  }

  revalidatePath('/team')
  return { success: true }
}
