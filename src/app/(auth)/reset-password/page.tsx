'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UpdatePasswordForm } from '@/features/auth/components'
import Link from 'next/link'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const invitedEmail = searchParams.get('email')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorVisible, setErrorVisible] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    let errorTimer: ReturnType<typeof setTimeout>

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (session?.user) {
        clearTimeout(errorTimer)
        setUser(session.user)
        setLoading(false)
        setErrorVisible(false)
      } else if (event === 'INITIAL_SESSION') {
        // No session on page load — start a timer to show error if nothing arrives
        errorTimer = setTimeout(() => {
          if (mounted) {
            setLoading(false)
            setErrorVisible(true)
          }
        }, 4000)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      mounted = false
      clearTimeout(errorTimer)
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  // Security Guard: Check if the logged-in user matches the invited email
  const isMatch = useMemo(() => {
    if (!user || !invitedEmail) return true
    return user.email?.toLowerCase() === invitedEmail.toLowerCase()
  }, [user, invitedEmail])

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-500 to-nebula-500 shadow-lg shadow-cosmic-500/25 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stardust-100">Set new password</h1>
          
          <div className="mt-4 min-h-[70px] flex flex-col items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-stardust-400">
                  <svg className="animate-spin h-5 w-5 text-nebula-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Securing your session...</span>
                </div>
                <p className="text-[10px] text-stardust-500 uppercase tracking-widest mt-1">Please wait a moment</p>
              </div>
            ) : user ? (
              <>
                {!isMatch ? (
                  <div className="w-full p-4 rounded-xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-400">
                    <p className="font-bold text-sm">⚠️ SESSION CONFLICT</p>
                    <p className="text-xs mt-1">
                      You are logged in as <strong>{user.email}</strong>, but this link is for <strong>{invitedEmail}</strong>.
                    </p>
                    <button 
                      onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
                      className="mt-3 w-full text-xs font-bold px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                    >
                      LOGOUT TO CONTINUE SAFELY
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="inline-block px-4 py-2 rounded-lg bg-cosmic-500/10 border border-cosmic-500/20 text-cosmic-300">
                      Changing password for: <span className="font-semibold text-stardust-100">{user.email}</span>
                    </div>
                    <p className="mt-4 text-[10px] text-stardust-400 uppercase tracking-widest font-medium">
                      Not you? <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="text-nebula-400 hover:text-nebula-300 transition-colors underline underline-offset-4">Sign out</button>
                    </p>
                  </>
                )}
              </>
            ) : errorVisible ? (
              <div className="rounded-xl border border-stardust-500/10 bg-stardust-500/5 p-4 text-center">
                <p className="text-sm text-stardust-300">
                  Authentication session expired or invalid.
                </p>
                <div className="mt-3 flex gap-4 justify-center">
                  <Link href="/login" className="text-xs font-bold text-nebula-400 hover:text-nebula-300 transition-colors">
                    Back to Login
                  </Link>
                  <button onClick={() => window.location.reload()} className="text-xs font-bold text-stardust-400 hover:text-stardust-200">
                    Try Again
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className={`rounded-2xl border border-space-700/50 bg-space-900/50 p-8 backdrop-blur-xl shadow-2xl transition-all duration-500 ${!user || loading || !isMatch ? 'opacity-20 blur-sm pointer-events-none scale-[0.98]' : 'opacity-100 scale-100'}`}>
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 text-cosmic-500" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
