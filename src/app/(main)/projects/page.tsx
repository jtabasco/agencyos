import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Project, Profile } from '@/types/database'

const statusColors = {
  onboarding: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  paused: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  completed: 'bg-stardust-400/20 text-stardust-300 border-stardust-400/30',
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Get projects based on role
  let projectsQuery = supabase
    .from('projects')
    .select(`
      *,
      client:profiles!client_id(id, full_name, email, avatar_url),
      manager:profiles!manager_id(id, full_name, email, avatar_url)
    `)
    .order('created_at', { ascending: false })

  // Filter based on role
  if (profile.role === 'client') {
    projectsQuery = projectsQuery.eq('client_id', user.id)
  } else if (profile.role === 'pm') {
    projectsQuery = projectsQuery.eq('manager_id', user.id)
  } else if (profile.role === 'dev') {
    // Dev sees assigned projects - need to join with project_members
    const { data: memberships } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id)

    const projectIds = memberships?.map(m => m.project_id) || []
    if (projectIds.length > 0) {
      projectsQuery = projectsQuery.in('id', projectIds)
    } else {
      // No assigned projects
      return (
        <ProjectsPageContent profile={profile} projects={[]} />
      )
    }
  }
  // Owner sees all projects (no filter)

  const { data: projects } = await projectsQuery

  return <ProjectsPageContent profile={profile} projects={projects || []} />
}

function ProjectsPageContent({
  profile,
  projects,
}: {
  profile: Profile
  projects: (Project & { client?: Profile | null; manager?: Profile | null })[]
}) {
  const canCreateProject = profile.role === 'owner' || profile.role === 'pm'

  // Stats
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + p.progress_percent, 0) / projects.length)
    : 0

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stardust-100">Projects</h1>
          <p className="mt-1 text-stardust-400">
            {profile.role === 'client'
              ? 'View your active projects and track progress'
              : 'Manage and track all your projects'}
          </p>
        </div>
        {canCreateProject && (
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cosmic-500/25 transition-all hover:shadow-cosmic-500/40"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Projects', value: totalProjects, icon: '📁' },
          { label: 'Active', value: activeProjects, icon: '🚀' },
          { label: 'Completed', value: completedProjects, icon: '✅' },
          { label: 'Avg Progress', value: `${avgProgress}%`, icon: '📊' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-space-700/50 bg-space-900/50 p-5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-sm text-stardust-400">{stat.label}</p>
                <p className="text-2xl font-bold text-stardust-100">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-space-700/50 bg-space-900/50 py-16 backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-space-800">
            <svg className="h-8 w-8 text-stardust-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-stardust-100">No projects yet</h3>
          <p className="mt-1 text-sm text-stardust-400">
            {canCreateProject
              ? 'Create your first project to get started'
              : 'You have not been assigned to any projects yet'}
          </p>
          {canCreateProject && (
            <Link
              href="/projects/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-5 py-2.5 text-sm font-medium text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group rounded-2xl border border-space-700/50 bg-space-900/50 p-6 backdrop-blur-sm transition-all hover:border-cosmic-500/50 hover:shadow-lg hover:shadow-cosmic-500/10"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                    statusColors[project.status]
                  }`}
                >
                  {project.status.replace('_', ' ')}
                </span>
                <svg
                  className="h-5 w-5 text-stardust-400 transition-transform group-hover:translate-x-1 group-hover:text-cosmic-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Project Name */}
              <h3 className="mt-4 text-lg font-semibold text-stardust-100 group-hover:text-cosmic-300">
                {project.name}
              </h3>

              {/* Description */}
              {project.description && (
                <p className="mt-2 line-clamp-2 text-sm text-stardust-400">
                  {project.description}
                </p>
              )}

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stardust-400">Progress</span>
                  <span className="font-medium text-stardust-100">{project.progress_percent}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-space-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500 transition-all"
                    style={{ width: `${project.progress_percent}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-space-700/50 pt-4">
                {/* Client */}
                {project.client && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-medium text-white">
                      {project.client.full_name?.charAt(0) || project.client.email?.charAt(0) || 'C'}
                    </div>
                    <span className="text-xs text-stardust-400">
                      {project.client.full_name || project.client.email}
                    </span>
                  </div>
                )}

                {/* Date */}
                <span className="text-xs text-stardust-400">
                  {new Date(project.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
