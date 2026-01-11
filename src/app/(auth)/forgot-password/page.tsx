import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Brand */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-500/20 to-nebula-500/20 border border-cosmic-500/30 mb-6">
            <svg className="w-8 h-8 text-cosmic-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stardust-100">Reset password</h1>
          <p className="mt-2 text-stardust-400">Enter your email to receive a reset link</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-8 backdrop-blur-xl shadow-2xl">
          <ForgotPasswordForm />
        </div>

        {/* Footer */}
        <p className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-cosmic-300 hover:text-cosmic-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
