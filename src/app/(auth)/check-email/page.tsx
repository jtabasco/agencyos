import Link from 'next/link'

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cosmic-500/20 to-nebula-500/20 border border-cosmic-500/30 mb-2">
          <svg className="w-10 h-10 text-cosmic-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-stardust-100">Check your email</h1>
          <p className="text-stardust-400 max-w-sm mx-auto">
            We&apos;ve sent you a confirmation link. Please check your email to complete your registration.
          </p>
        </div>

        {/* Card with tips */}
        <div className="rounded-2xl border border-space-700/50 bg-space-900/50 p-6 backdrop-blur-xl text-left">
          <h3 className="text-sm font-medium text-stardust-200 mb-3">Didn&apos;t receive the email?</h3>
          <ul className="space-y-2 text-sm text-stardust-400">
            <li className="flex items-start gap-2">
              <span className="text-cosmic-400 mt-0.5">1.</span>
              Check your spam folder
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cosmic-400 mt-0.5">2.</span>
              Make sure you entered the correct email
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cosmic-400 mt-0.5">3.</span>
              Wait a few minutes and try again
            </li>
          </ul>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-cosmic-300 hover:text-cosmic-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to login
        </Link>
      </div>
    </div>
  )
}
