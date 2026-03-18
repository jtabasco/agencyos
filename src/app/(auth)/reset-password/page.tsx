import { UpdatePasswordForm } from '@/features/auth/components'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function UpdatePasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Brand */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-500 to-nebula-500 shadow-lg shadow-cosmic-500/25 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stardust-100">Set new password</h1>
          <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-cosmic-500/10 border border-cosmic-500/20 text-cosmic-300">
            Changing password for: <span className="font-semibold text-stardust-100">{user.email}</span>
          </div>
          <p className="mt-4 text-xs text-stardust-400 uppercase tracking-widest font-medium">
            Not you? <Link href="/login" className="text-nebula-400 hover:text-nebula-300 transition-colors">Sign out & start over</Link>
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-8 backdrop-blur-xl shadow-2xl">
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  )
}
