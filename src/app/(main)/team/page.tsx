'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/contexts/ToastContext'
import { updateUserRole } from '@/actions/users'
import { Profile, UserRole } from '@/types/database'

const roleColors: Record<UserRole, string> = {
  owner: 'bg-gradient-to-r from-amber-500 to-orange-500',
  pm: 'bg-gradient-to-r from-cosmic-500 to-nebula-500',
  dev: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  client: 'bg-gradient-to-r from-blue-500 to-cyan-500',
}

const roleLabels: Record<UserRole, string> = {
  owner: 'Owner',
  pm: 'Project Manager',
  dev: 'Developer',
  client: 'Client',
}

export default function TeamPage() {
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('dev')
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null)
  const [changingRole, setChangingRole] = useState<string | null>(null)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      // Get current user role
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setCurrentUserRole(profile?.role || 'client')
      }

      // Fetch all team members
      const { data: teamMembers } = await supabase
        .from('profiles')
        .select('*')
        .order('role')

      setMembers(teamMembers || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send an invite email
    toast('info', `Invitación sería enviada a ${inviteEmail} como ${roleLabels[inviteRole]}`)
    setShowInviteModal(false)
    setInviteEmail('')
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setChangingRole(userId)
    const result = await updateUserRole(userId, newRole)

    if (result.error) {
      toast('error', result.error)
    } else {
      setMembers(prev =>
        prev.map(m => m.id === userId ? { ...m, role: newRole } : m)
      )
      toast('success', `Rol actualizado a ${roleLabels[newRole]}`)
    }
    setChangingRole(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cosmic-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stardust-100">Team Management</h1>
          <p className="mt-1 text-stardust-400">Manage your agency team members and their roles</p>
        </div>
        {currentUserRole === 'owner' && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cosmic-500/25 transition-all hover:shadow-cosmic-500/40"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Invite Member
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(['owner', 'pm', 'dev', 'client'] as UserRole[]).map(role => {
          const count = members.filter(m => m.role === role).length
          return (
            <div
              key={role}
              className="rounded-2xl border border-space-700/50 bg-space-800/50 p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${roleColors[role]} shadow-lg`}>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-stardust-400">{roleLabels[role]}s</p>
                  <p className="text-2xl font-bold text-stardust-100">{count}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Team List */}
      <div className="rounded-2xl border border-space-700/50 bg-space-800/50 backdrop-blur-sm">
        <div className="border-b border-space-700/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-stardust-100">Team Members</h2>
          <p className="mt-1 text-sm text-stardust-400">
            {currentUserRole === 'owner' ? 'Click on a role to change it' : 'View all team members'}
          </p>
        </div>
        <div className="divide-y divide-space-700/50">
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="h-12 w-12 text-stardust-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-4 text-stardust-400">No team members yet</p>
              <p className="text-sm text-stardust-500">Invite your first team member to get started</p>
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-sm font-medium text-white">
                    {member.full_name?.charAt(0) || member.email?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-stardust-100">{member.full_name || 'Unnamed'}</p>
                    <p className="text-sm text-stardust-400">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {currentUserRole === 'owner' && member.role !== 'owner' ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                      disabled={changingRole === member.id}
                      className="rounded-lg border border-space-700 bg-space-800 px-3 py-1.5 text-sm text-stardust-100 focus:border-cosmic-500 focus:outline-none disabled:opacity-50 cursor-pointer"
                    >
                      <option value="pm">Project Manager</option>
                      <option value="dev">Developer</option>
                      <option value="client">Client</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${roleColors[member.role as UserRole]}`}>
                      {roleLabels[member.role as UserRole]}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-space-700 bg-space-900 p-6">
            <h3 className="text-lg font-semibold text-stardust-100">Invite Team Member</h3>
            <p className="mt-1 text-sm text-stardust-400">Send an invitation to join your agency</p>

            <form onSubmit={handleInvite} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stardust-200">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="mt-2 block w-full rounded-xl border border-space-700 bg-space-800 px-4 py-3 text-stardust-100 placeholder-stardust-400 focus:border-cosmic-500 focus:outline-none"
                  placeholder="team@example.com"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-stardust-200">
                  Role
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="mt-2 block w-full rounded-xl border border-space-700 bg-space-800 px-4 py-3 text-stardust-100 focus:border-cosmic-500 focus:outline-none"
                >
                  <option value="pm">Project Manager</option>
                  <option value="dev">Developer</option>
                  <option value="client">Client</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 rounded-xl border border-space-700 bg-space-800 px-4 py-2.5 text-sm font-medium text-stardust-100 transition-colors hover:bg-space-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-cosmic-500/25 transition-all hover:shadow-cosmic-500/40"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
