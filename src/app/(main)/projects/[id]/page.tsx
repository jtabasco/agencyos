import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { KanbanBoard } from '@/components/kanban'
import { AIProjectReport } from '@/components/ai'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  onboarding: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  paused: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  completed: 'bg-stardust-400/20 text-stardust-300 border-stardust-400/30',
}

const updateTypeIcons: Record<string, string> = {
  milestone: '🎯',
  blocker: '🚧',
  delivery: '📦',
  approval: '✅',
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Get project with relations
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      client:profiles!client_id(id, full_name, email, avatar_url, role),
      manager:profiles!manager_id(id, full_name, email, avatar_url, role)
    `)
    .eq('id', id)
    .single()

  if (!project) {
    notFound()
  }

  // Get tasks for this project
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  // Get updates for this project
  const { data: updates } = await supabase
    .from('updates')
    .select(`
      *,
      author:profiles!author_id(id, full_name, email, avatar_url)
    `)
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get team members
  const { data: members } = await supabase
    .from('project_members')
    .select(`
      *,
      user:profiles!user_id(id, full_name, email, avatar_url, role)
    `)
    .eq('project_id', id)

  // Build team members list
  const teamMembers = [
    ...(project.manager ? [project.manager] : []),
    ...(members?.map(m => m.user).filter(Boolean) || []),
  ]

  const canEdit = profile.role === 'owner' || (profile.role === 'pm' && project.manager_id === user.id)

  // Calculate task stats
  const taskStats = {
    total: tasks?.length || 0,
    done: tasks?.filter(t => t.status === 'done').length || 0,
    inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
    review: tasks?.filter(t => t.status === 'review' || t.status === 'client_approval').length || 0,
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/projects" className="text-stardust-400 hover:text-stardust-100">
          Projects
        </Link>
        <span className="text-stardust-400">/</span>
        <span className="text-stardust-100">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-stardust-100">{project.name}</h1>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                statusColors[project.status]
              }`}
            >
              {project.status.replace('_', ' ')}
            </span>
          </div>
          {project.description && (
            <p className="mt-2 text-stardust-400">{project.description}</p>
          )}

          {/* Progress */}
          <div className="mt-4 max-w-md">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stardust-400">Overall Progress</span>
              <span className="font-medium text-stardust-100">{project.progress_percent}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-space-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500 transition-all"
                style={{ width: `${project.progress_percent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* AI Report Button - Available for clients and managers */}
          <AIProjectReport projectId={id} projectName={project.name} />

          {canEdit && (
            <>
              <Link
                href={`/projects/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-space-700 bg-space-800 px-4 py-2 text-sm font-medium text-stardust-100 transition-colors hover:bg-space-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <Link
              href={`/projects/${id}/tasks/new`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cosmic-500/25 transition-all hover:shadow-cosmic-500/40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </Link>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Tasks', value: taskStats.total, color: 'from-cosmic-500 to-nebula-500' },
          { label: 'In Progress', value: taskStats.inProgress, color: 'from-blue-500 to-cyan-500' },
          { label: 'In Review', value: taskStats.review, color: 'from-amber-500 to-orange-500' },
          { label: 'Completed', value: taskStats.done, color: 'from-emerald-500 to-teal-500' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-space-700/50 bg-space-900/50 p-5 backdrop-blur-sm"
          >
            <p className="text-sm text-stardust-400">{stat.label}</p>
            <p className={`mt-1 bg-gradient-to-r ${stat.color} bg-clip-text text-3xl font-bold text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 xl:grid-cols-3">
        {/* Kanban Board - Takes 2 columns */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl border border-space-700/50 bg-space-900/30 p-6 backdrop-blur-sm">
            <h2 className="mb-6 text-lg font-semibold text-stardust-100">Task Board</h2>
            <KanbanBoard
              tasks={tasks || []}
              teamMembers={teamMembers}
              userRole={profile.role}
              projectId={id}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team */}
          <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-stardust-100">Team</h3>
            <div className="mt-4 space-y-3">
              {/* Client */}
              {project.client && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white">
                    {project.client.full_name?.charAt(0) || project.client.email?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stardust-100">
                      {project.client.full_name || project.client.email}
                    </p>
                    <p className="text-xs text-stardust-400">Client</p>
                  </div>
                </div>
              )}

              {/* Manager */}
              {project.manager && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-sm font-bold text-white">
                    {project.manager.full_name?.charAt(0) || project.manager.email?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stardust-100">
                      {project.manager.full_name || project.manager.email}
                    </p>
                    <p className="text-xs text-stardust-400">Project Manager</p>
                  </div>
                </div>
              )}

              {/* Team Members */}
              {members?.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white">
                    {member.user?.full_name?.charAt(0) || member.user?.email?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stardust-100">
                      {member.user?.full_name || member.user?.email}
                    </p>
                    <p className="text-xs capitalize text-stardust-400">{member.user?.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Updates */}
          <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-stardust-100">Recent Updates</h3>
            {updates && updates.length > 0 ? (
              <div className="mt-4 space-y-4">
                {updates.slice(0, 5).map((update) => (
                  <div key={update.id} className="border-b border-space-700/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{updateTypeIcons[update.type]}</span>
                      <div className="flex-1">
                        <p className="text-sm text-stardust-100">{update.content}</p>
                        <p className="mt-1 text-xs text-stardust-400">
                          {update.author?.full_name || 'Unknown'} •{' '}
                          {new Date(update.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-stardust-400">No updates yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
