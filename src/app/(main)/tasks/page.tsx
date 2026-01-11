import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Task, Profile, UserRole, Project } from '@/types/database'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userRole = (profile?.role || 'client') as UserRole

  // Get all tasks visible to user based on role
  let tasksQuery = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  // Dev users only see their assigned tasks
  if (userRole === 'dev') {
    tasksQuery = tasksQuery.eq('assigned_to', user.id)
  }

  const { data: tasks } = await tasksQuery

  // Get all projects for filtering
  let projectsQuery = supabase
    .from('projects')
    .select('id, name')
    .order('name')

  if (userRole === 'dev') {
    // Dev sees projects they're part of
    const { data: memberProjects } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id)

    const projectIds = memberProjects?.map(m => m.project_id) || []
    if (projectIds.length > 0) {
      projectsQuery = projectsQuery.in('id', projectIds)
    }
  } else if (userRole === 'client') {
    projectsQuery = projectsQuery.eq('client_id', user.id)
  }

  const { data: projects } = await projectsQuery

  // Get team members for assignment display
  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['owner', 'pm', 'dev'])

  // Calculate task stats
  const totalTasks = tasks?.length || 0
  const todoTasks = tasks?.filter(t => t.status === 'todo').length || 0
  const inProgressTasks = tasks?.filter(t => t.status === 'in_progress').length || 0
  const doneTasks = tasks?.filter(t => t.status === 'done').length || 0

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stardust-100">Tasks</h1>
          <p className="mt-1 text-stardust-400">
            {userRole === 'owner' || userRole === 'pm'
              ? 'Manage and track all tasks across projects'
              : userRole === 'dev'
                ? 'View and manage your assigned tasks'
                : 'View tasks for your projects'
            }
          </p>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-3">
          {(userRole === 'owner' || userRole === 'pm') && (
            <Link
              href="/projects"
              className="flex items-center gap-2 rounded-xl border border-space-700 bg-space-800 px-4 py-2.5 text-sm font-medium text-stardust-100 transition-colors hover:bg-space-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Task
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-space-700/50 bg-space-800/50 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-stardust-400/20 to-stardust-400/10">
              <svg className="h-6 w-6 text-stardust-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-stardust-400">Total Tasks</p>
              <p className="text-2xl font-bold text-stardust-100">{totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-space-700/50 bg-space-800/50 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10">
              <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-stardust-400">To Do</p>
              <p className="text-2xl font-bold text-stardust-100">{todoTasks}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-space-700/50 bg-space-800/50 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cosmic-500/20 to-cosmic-500/10">
              <svg className="h-6 w-6 text-cosmic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-stardust-400">In Progress</p>
              <p className="text-2xl font-bold text-stardust-100">{inProgressTasks}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-space-700/50 bg-space-800/50 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10">
              <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-stardust-400">Completed</p>
              <p className="text-2xl font-bold text-stardust-100">{doneTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Filter */}
      {projects && projects.length > 0 && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-stardust-400">Filter by project:</span>
          <div className="flex flex-wrap gap-2">
            <span className="cursor-pointer rounded-full bg-cosmic-500/20 px-3 py-1 text-sm font-medium text-cosmic-400">
              All Projects
            </span>
            {projects.map((project: Project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="rounded-full bg-space-800 px-3 py-1 text-sm text-stardust-400 transition-colors hover:bg-space-700 hover:text-stardust-100"
              >
                {project.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="rounded-2xl border border-space-700/50 bg-space-800/30 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stardust-100">Kanban Board</h2>
          <div className="flex items-center gap-2 text-sm text-stardust-400">
            <span className="h-2 w-2 rounded-full bg-cosmic-400"></span>
            Drag and drop to update status
          </div>
        </div>

        {tasks && tasks.length > 0 ? (
          <KanbanBoard
            tasks={tasks as Task[]}
            teamMembers={(teamMembers as Profile[]) || []}
            userRole={userRole}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="h-16 w-16 text-stardust-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="mt-4 text-lg font-medium text-stardust-300">No tasks yet</p>
            <p className="mt-1 text-stardust-400">
              {userRole === 'owner' || userRole === 'pm'
                ? 'Create a task from a project to get started'
                : 'Tasks will appear here when assigned to you'
              }
            </p>
            {(userRole === 'owner' || userRole === 'pm') && (
              <Link
                href="/projects"
                className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cosmic-500/25 transition-all hover:shadow-cosmic-500/40"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Go to Projects
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
