import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Profile, Project, Task } from '@/types/database'

const statusColors = {
  onboarding: 'bg-blue-500/20 text-blue-300',
  active: 'bg-emerald-500/20 text-emerald-300',
  paused: 'bg-amber-500/20 text-amber-300',
  completed: 'bg-stardust-400/20 text-stardust-300',
  cancelled: 'bg-red-500/20 text-red-300',
}

export default async function DashboardPage() {
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

  // Get data based on role
  let projectsQuery = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  let tasksQuery = supabase
    .from('tasks')
    .select('*, project:projects(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Apply role-based filters
  if (profile.role === 'client') {
    projectsQuery = projectsQuery.eq('client_id', user.id)
    // Tasks for client's projects
    const { data: clientProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('client_id', user.id)
    const projectIds = clientProjects?.map(p => p.id) || []
    if (projectIds.length > 0) {
      tasksQuery = tasksQuery.in('project_id', projectIds)
    }
  } else if (profile.role === 'pm') {
    projectsQuery = projectsQuery.eq('manager_id', user.id)
    // Tasks for PM's projects
    const { data: pmProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('manager_id', user.id)
    const projectIds = pmProjects?.map(p => p.id) || []
    if (projectIds.length > 0) {
      tasksQuery = tasksQuery.in('project_id', projectIds)
    }
  } else if (profile.role === 'dev') {
    // Dev sees assigned projects
    const { data: memberships } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id)
    const projectIds = memberships?.map(m => m.project_id) || []
    if (projectIds.length > 0) {
      projectsQuery = projectsQuery.in('id', projectIds)
    }
    // Tasks assigned to dev
    tasksQuery = tasksQuery.eq('assigned_to', user.id)
  }
  // Owner sees all

  const [{ data: projects }, { data: tasks }] = await Promise.all([
    projectsQuery,
    tasksQuery,
  ])

  // Get stats
  const totalProjects = projects?.length || 0
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0
  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0

  return (
    <DashboardContent
      profile={profile}
      projects={projects || []}
      tasks={tasks || []}
      stats={{
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
      }}
    />
  )
}

function DashboardContent({
  profile,
  projects,
  tasks,
  stats,
}: {
  profile: Profile
  projects: Project[]
  tasks: (Task & { project?: { name: string } })[]
  stats: {
    totalProjects: number
    activeProjects: number
    totalTasks: number
    completedTasks: number
  }
}) {
  const roleGreetings: Record<string, string> = {
    owner: 'Here\'s your agency overview',
    pm: 'Here\'s what\'s happening with your projects',
    dev: 'Here are your assigned tasks',
    client: 'Here\'s your project status',
  }

  const taskStatusColors: Record<string, string> = {
    todo: 'border-stardust-400/30 text-stardust-400',
    in_progress: 'border-cosmic-400/30 text-cosmic-400',
    review: 'border-nebula-400/30 text-nebula-400',
    client_approval: 'border-amber-400/30 text-amber-400',
    done: 'border-emerald-400/30 text-emerald-400',
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stardust-100">
            Welcome back{profile.full_name ? `, ${profile.full_name}` : ''}
          </h1>
          <p className="mt-1 text-stardust-400">
            {roleGreetings[profile.role]}
          </p>
        </div>

        {/* Quick Actions for Owner/PM */}
        {(profile.role === 'owner' || profile.role === 'pm') && (
          <div className="flex items-center gap-3">
            <Link
              href="/tasks"
              className="flex items-center gap-2 rounded-xl border border-space-700 bg-space-800 px-4 py-2.5 text-sm font-medium text-stardust-100 transition-colors hover:bg-space-700"
            >
              <svg className="h-5 w-5 text-cosmic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Kanban Board
            </Link>
            {profile.role === 'owner' && (
              <Link
                href="/projects"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-cosmic-500/25 transition-all hover:shadow-cosmic-500/40"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Project
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cosmic-500/20 to-nebula-500/20">
              <svg className="h-6 w-6 text-cosmic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-stardust-400">Total Projects</p>
              <p className="text-2xl font-bold text-stardust-100">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
              <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-stardust-400">Active Projects</p>
              <p className="text-2xl font-bold text-stardust-100">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-stardust-400">Total Tasks</p>
              <p className="text-2xl font-bold text-stardust-100">{stats.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-stardust-400">Completed Tasks</p>
              <p className="text-2xl font-bold text-stardust-100">{stats.completedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Projects */}
        <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stardust-100">Recent Projects</h2>
            <Link
              href="/projects"
              className="text-sm text-cosmic-400 hover:text-cosmic-300"
            >
              View all
            </Link>
          </div>

          {projects.length > 0 ? (
            <div className="mt-4 space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group flex items-center justify-between rounded-xl border border-space-700/50 bg-space-800/50 p-4 transition-all hover:border-cosmic-500/50 hover:bg-space-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-stardust-100 group-hover:text-cosmic-300">
                        {project.name}
                      </h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusColors[project.status]}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-1.5 overflow-hidden rounded-full bg-space-700">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500"
                            style={{ width: `${project.progress_percent}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-stardust-400">{project.progress_percent}%</span>
                    </div>
                  </div>
                  <svg className="ml-4 h-5 w-5 text-stardust-400 transition-transform group-hover:translate-x-1 group-hover:text-cosmic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-space-800">
                <svg className="h-6 w-6 text-stardust-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="mt-3 text-sm text-stardust-400">No projects yet</p>
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stardust-100">
              {profile.role === 'dev' ? 'My Tasks' : 'Recent Tasks'}
            </h2>
            {(profile.role === 'owner' || profile.role === 'pm' || profile.role === 'dev') && (
              <Link
                href="/tasks"
                className="text-sm text-cosmic-400 hover:text-cosmic-300"
              >
                View all
              </Link>
            )}
          </div>

          {tasks.length > 0 ? (
            <div className="mt-4 space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 rounded-xl border border-space-700/50 bg-space-800/50 p-4"
                >
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${taskStatusColors[task.status]}`}>
                    {task.status === 'done' && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.status === 'done' ? 'text-stardust-400 line-through' : 'text-stardust-100'}`}>
                      {task.title}
                    </p>
                    {task.project && (
                      <p className="mt-0.5 text-xs text-stardust-400 truncate">
                        {task.project.name}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs capitalize ${taskStatusColors[task.status]}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-space-800">
                <svg className="h-6 w-6 text-stardust-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="mt-3 text-sm text-stardust-400">No tasks yet</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Reports Section - Only for Owner */}
      {profile.role === 'owner' && projects.length > 0 && (
        <div className="rounded-2xl border border-space-700/50 bg-gradient-to-br from-cosmic-500/5 to-nebula-500/5 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cosmic-500 to-nebula-500 shadow-lg shadow-cosmic-500/25">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-stardust-100">AI Project Reports</h2>
              <p className="mt-0.5 text-sm text-stardust-400">
                Generate intelligent reports for your projects using AI analysis
              </p>
            </div>
            <Link
              href={`/projects/${projects[0].id}`}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cosmic-500/25 transition-all hover:shadow-cosmic-500/40"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Generate Report
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-space-800/50 p-4">
              <p className="text-xs font-medium text-stardust-400">Available Projects</p>
              <p className="mt-1 text-xl font-bold text-stardust-100">{projects.length}</p>
            </div>
            <div className="rounded-xl bg-space-800/50 p-4">
              <p className="text-xs font-medium text-stardust-400">AI Model</p>
              <p className="mt-1 text-xl font-bold text-stardust-100">Gemini Pro</p>
            </div>
            <div className="rounded-xl bg-space-800/50 p-4">
              <p className="text-xs font-medium text-stardust-400">Report Types</p>
              <p className="mt-1 text-xl font-bold text-stardust-100">3 Available</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card - Only for client role */}
      {profile.role === 'client' && (
        <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-stardust-100">Your Profile</h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-2xl font-bold text-white">
              {profile.full_name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-medium text-stardust-100">
                {profile.full_name || 'No name set'}
              </p>
              <p className="text-stardust-400">{profile.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
