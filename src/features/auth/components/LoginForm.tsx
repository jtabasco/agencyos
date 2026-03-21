'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/actions/auth'
import { GoogleSignInButton } from './GoogleSignInButton'
import { AuthDivider } from './AuthDivider'

export function LoginForm() {
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error')
  const [error, setError] = useState<string | null>(
    oauthError === 'auth_callback_failed' ? 'Error al iniciar sesión con Google. Intenta de nuevo.' : null
  )
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <GoogleSignInButton />

      <AuthDivider />

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stardust-200">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1.5 block w-full rounded-xl border border-space-700 bg-space-800/50 px-4 py-2.5 text-stardust-100 placeholder-stardust-400 backdrop-blur-sm transition-all focus:border-cosmic-400 focus:bg-space-800 focus:outline-none focus:ring-2 focus:ring-cosmic-400/20"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stardust-200">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1.5 block w-full rounded-xl border border-space-700 bg-space-800/50 px-4 py-2.5 text-stardust-100 placeholder-stardust-400 backdrop-blur-sm transition-all focus:border-cosmic-400 focus:bg-space-800 focus:outline-none focus:ring-2 focus:ring-cosmic-400/20"
            placeholder="********"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-cosmic-500/25 transition-all hover:from-cosmic-400 hover:to-nebula-400 hover:shadow-cosmic-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>

        <p className="text-center text-sm text-stardust-400">
          <Link href="/forgot-password" className="text-cosmic-300 hover:text-cosmic-200 transition-colors">
            Forgot password?
          </Link>
        </p>
      </form>
    </div>
  )
}
