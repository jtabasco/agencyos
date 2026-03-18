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
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event change:', event, session?.user?.email)
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    getUser()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

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
          
          <div className="mt-4 min-h-[60px] flex flex-col items-center justify-center">
            {loading ? (
              <div className="flex items-center gap-2 text-stardust-400">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verifying secure session...</span>
              </div>
            ) : user ? (
              <>
                {!isMatch ? (
                  <div className="w-full p-4 rounded-xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-400 animate-pulse">
                    <p className="font-bold text-sm">⚠️ CRITICAL: ACCOUNT MISMATCH</p>
                    <p className="text-xs mt-1">
                      You are logged in as <strong>{user.email}</strong>, but this invitation is for <strong>{invitedEmail}</strong>.
                    </p>
                    <button 
                      onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
                      className="mt-3 text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                    >
                      LOGOUT & RE-ENROLL SAFELY
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="inline-block px-4 py-2 rounded-lg bg-cosmic-500/10 border border-cosmic-500/20 text-cosmic-300">
                      Changing password for: <span className="font-semibold text-stardust-100">{user.email}</span>
                    </div>
                    <p className="mt-4 text-xs text-stardust-400 uppercase tracking-widest font-medium">
                      Not you? <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="text-nebula-400 hover:text-nebula-300 transition-colors">Sign out</button>
                    </p>
                  </>
                )}
              </>
            ) : (
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                <p className="text-sm text-yellow-500">
                  Authentication session expired or invalid.
                </p>
                <Link href="/login" className="mt-2 inline-block text-xs font-semibold text-stardust-300 underline underline-offset-4">
                  Request a new link
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className={`rounded-2xl border border-space-700/50 bg-space-900/50 p-8 backdrop-blur-xl shadow-2xl transition-all duration-300 ${!user || loading || !isMatch ? 'opacity-30 blur-sm pointer-events-none' : 'opacity-100'}`}>
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
