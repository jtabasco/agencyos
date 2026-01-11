import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createTask } from '@/actions/tasks'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewTaskPage({ params }: PageProps) {
  const { id: projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'owner' && profile.role !== 'pm')) {
    redirect(`/projects/${projectId}`)
  }

  // Get project details
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', projectId)
    .single()

  if (!project) {
    redirect('/projects')
  }

  // Get team members for assignment
  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .in('role', ['owner', 'pm', 'dev'])
    .order('full_name')

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/projects" className="text-stardust-400 hover:text-stardust-100">
          Projects
        </Link>
        <span className="text-stardust-400">/</span>
        <Link href={`/projects/${projectId}`} className="text-stardust-400 hover:text-stardust-100">
          {project.name}
        </Link>
        <span className="text-stardust-400">/</span>
        <span className="text-stardust-100">New Task</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stardust-100">Create New Task</h1>
        <p className="mt-1 text-stardust-400">
          Add a new task to {project.name}
        </p>
      </div>

      {/* Form */}
      <form action={createTask} className="space-y-6">
        <input type="hidden" name="project_id" value={projectId} />

        {/* Task Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-stardust-200">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-2 block w-full rounded-xl border border-space-700 bg-space-800 px-4 py-3 text-stardust-100 placeholder-stardust-400 transition-colors focus:border-cosmic-500 focus:outline-none focus:ring-1 focus:ring-cosmic-500"
            placeholder="e.g. Design homepage wireframes"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-stardust-200">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="mt-2 block w-full rounded-xl border border-space-700 bg-space-800 px-4 py-3 text-stardust-100 placeholder-stardust-400 transition-colors focus:border-cosmic-500 focus:outline-none focus:ring-1 focus:ring-cosmic-500"
            placeholder="Detailed description of the task..."
          />
        </div>

        {/* Assignee */}
        <div>
          <label htmlFor="assigned_to" className="block text-sm font-medium text-stardust-200">
            Assign To
          </label>
          <select
            id="assigned_to"
            name="assigned_to"
            className="mt-2 block w-full rounded-xl border border-space-700 bg-space-800 px-4 py-3 text-stardust-100 transition-colors focus:border-cosmic-500 focus:outline-none focus:ring-1 focus:ring-cosmic-500"
          >
            <option value="">Unassigned</option>
            {teamMembers?.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name || member.email} ({member.role})
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-stardust-200">
            Due Date
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            className="mt-2 block w-full rounded-xl border border-space-700 bg-space-800 px-4 py-3 text-stardust-100 transition-colors focus:border-cosmic-500 focus:outline-none focus:ring-1 focus:ring-cosmic-500"
          />
        </div>

        {/* Priority indicator */}
        <div className="rounded-xl border border-space-700/50 bg-space-800/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cosmic-500/20">
              <svg className="h-5 w-5 text-cosmic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-stardust-200">Task will be created in "To Do" status</p>
              <p className="text-xs text-stardust-400">You can change the status from the Kanban board</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 border-t border-space-700/50 pt-6">
          <Link
            href={`/projects/${projectId}`}
            className="rounded-xl border border-space-700 bg-space-800 px-5 py-2.5 text-sm font-medium text-stardust-100 transition-colors hover:bg-space-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cosmic-500/25 transition-all hover:shadow-cosmic-500/40"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  )
}
