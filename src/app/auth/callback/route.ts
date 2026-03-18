import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const { searchParams, origin } = url
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  
  // Robust URL construction for the destination
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const redirectBase = process.env.NODE_ENV === 'development' ? origin : siteUrl
  
  // Create the final redirect URL properly
  const finalRedirectUrl = new URL(next, redirectBase)
  
  // Preserve any other query parameters (like ?email=...)
  searchParams.forEach((value, key) => {
    if (key !== 'code' && key !== 'next') {
      finalRedirectUrl.searchParams.set(key, value)
    }
  })

  const supabase = await createClient()

  if (code) {
    // PKCE Flow (used by some Supabase invitation flows)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(finalRedirectUrl.toString())
    }
    console.error('Auth callback exchange error:', error)
  }

  // Hash-based flow: invitations use #access_token which is invisible to the server.
  // Redirect client-side so the browser Supabase client can parse the hash.
  return new NextResponse(
    `<html>
      <head>
        <script>
          (function() {
            const hash = window.location.hash;
            const finalDestination = "${finalRedirectUrl.toString()}" + hash;

            if (hash) {
              window.location.replace(finalDestination);
            } else {
              window.location.replace("${redirectBase}/auth/auth-code-error");
            }
          })();
        </script>
      </head>
      <body><p>Redirecting...</p></body>
    </html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
