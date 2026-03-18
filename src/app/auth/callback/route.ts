import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/dashboard'

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const redirectBase = process.env.NODE_ENV === 'development' ? origin : siteUrl

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`)
    }
    console.error('Auth callback exchange error:', error)
  }

  // Fallback: If no code, but we have a 'next' param, it might be an implicit flow (hash)
  // or a flow handled by the client SDK. Redirect to the destination.
  if (next && !searchParams.get('error')) {
    return NextResponse.redirect(`${redirectBase}${next}`)
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${redirectBase}/auth/auth-code-error`)
}
