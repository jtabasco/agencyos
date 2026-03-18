export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-stardust-100">Authentication Error</h1>
        <p className="text-stardust-400">
          We couldn't verify your authentication code. This could be because the link has expired or has already been used.
        </p>
        <a
          href="/login"
          className="inline-block rounded-xl bg-space-800 px-6 py-3 font-semibold text-stardust-200 border border-space-700 hover:bg-space-700 transition-all"
        >
          Back to Login
        </a>
      </div>
    </div>
  )
}
