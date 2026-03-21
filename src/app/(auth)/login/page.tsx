import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/features/auth/components'

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-md space-y-5">
        {/* Logo / Brand */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cosmic-500 to-nebula-500 shadow-lg shadow-cosmic-500/25 mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stardust-100">Welcome back</h1>
          <p className="mt-1 text-sm text-stardust-400">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-6 backdrop-blur-xl shadow-2xl">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-stardust-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-cosmic-300 hover:text-cosmic-200 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
