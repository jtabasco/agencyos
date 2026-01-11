import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createProject } from '@/actions/projects'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'owner' && profile.role !== 'pm')) {
    redirect('/projects')
  }

  // Get available clients (users with role 'client')
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'client')
    .order('full_name')

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/projects" className="text-stardust-400 hover:text-stardust-100">
          Projects
        </Link>
        <span className="text-stardust-400">/</span>
        <span className="text-stardust-100">New Project</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stardust-100">Create New Project</h1>
        <p className="mt-1 text-stardust-400">
          Set up a new project for your client
        </p>
      </div>

      {/* Form */}
      <form action={createProject} className="space-y-6">
        {/* Project Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stardust-200">
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-2 block w-full rounded-xl border border-space-700 bg-space-800 px-4 py-3 text-stardust-100 placeholder-stardust-400 transition-colors focus:border-cosmic-500 focus:outline-none focus:ring-1 focus:ring-cosmic-500"
            placeholder="e.g. Website Redesign"
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
            placeholder="Brief description of the project scope and goals..."
          />
        </div>

        {/* Client Selection */}
        <div>
          <label htmlFor="client_id" className="block text-sm font-medium text-stardust-200">
            Assign Client
          </label>
          <select
            id="client_id"
            name="client_id"
            className="mt-2 block w-full rounded-xl border border-space-700 bg-space-800 px-4 py-3 text-stardust-100 transition-colors focus:border-cosmic-500 focus:outline-none focus:ring-1 focus:ring-cosmic-500"
          >
            <option value="">No client assigned</option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name || client.email}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-stardust-400">
            Select a client to give them access to view this project
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 border-t border-space-700/50 pt-6">
          <Link
            href="/projects"
            className="rounded-xl border border-space-700 bg-space-800 px-5 py-2.5 text-sm font-medium text-stardust-100 transition-colors hover:bg-space-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cosmic-500/25 transition-all hover:shadow-cosmic-500/40"
          >
            Create Project
          </button>
        </div>
      </form>
    </div>
  )
}
