'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UpdatePasswordForm } from '@/features/auth/components'
import Link from 'next/link'

export default function UpdatePasswordPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      setLoading(false)
    }

    // Listen for auth changes (like when the hash is processed)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    getUser()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

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
          
          <div className="mt-4 min-h-[50px] flex flex-col items-center justify-center">
            {loading ? (
              <div className="flex items-center gap-2 text-stardust-400">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verifying identity...</span>
              </div>
            ) : user ? (
              <>
                <div className="inline-block px-4 py-2 rounded-lg bg-cosmic-500/10 border border-cosmic-500/20 text-cosmic-300">
                  Changing password for: <span className="font-semibold text-stardust-100">{user.email}</span>
                </div>
                <p className="mt-4 text-xs text-stardust-400 uppercase tracking-widest font-medium">
                  Not you? <Link href="/login" className="text-nebula-400 hover:text-nebula-300 transition-colors">Sign out & start over</Link>
                </p>
              </>
            ) : (
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                <p className="text-sm text-yellow-500">
                  Authentication failed. Your link may have expired.
                </p>
                <Link href="/login" className="mt-2 inline-block text-xs font-semibold text-stardust-300 underline underline-offset-4">
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Form Card */}
        <div className={`rounded-2xl border border-space-700/50 bg-space-900/50 p-8 backdrop-blur-xl shadow-2xl transition-opacity duration-300 ${!user || loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  )
}
