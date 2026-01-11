import Link from 'next/link'
import { SignupForm } from '@/features/auth/components'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Brand */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-500 to-nebula-500 shadow-lg shadow-cosmic-500/25 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stardust-100">Create account</h1>
          <p className="mt-2 text-stardust-400">Get started for free</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-8 backdrop-blur-xl shadow-2xl">
          <SignupForm />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-stardust-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-cosmic-300 hover:text-cosmic-200 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
