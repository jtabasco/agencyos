import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const redirectBase = process.env.NODE_ENV === 'development' ? origin : siteUrl

  if (code) {
    const supabase = await createClient()
    
    // Safety: If there is an existing session, we sign out to avoid collisions 
    // when clicking an invitation link while logged in as another user.
    await supabase.auth.signOut()

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`)
    }
    
    console.error('Auth callback exchange error:', error)
  }

  // Security: Don't allow fallback to sensitive routes like /reset-password if code exchange failed
  if (next.includes('/reset-password')) {
    return NextResponse.redirect(`${redirectBase}/auth/auth-code-error`)
  }

  // Fallback for non-sensitive routes
  if (next && !searchParams.get('error')) {
    return NextResponse.redirect(`${redirectBase}${next}`)
  }

  return NextResponse.redirect(`${redirectBase}/auth/auth-code-error`)
}
