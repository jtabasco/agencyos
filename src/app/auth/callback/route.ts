import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const redirectBase = process.env.NODE_ENV === 'development' ? origin : siteUrl

  const supabase = await createClient()
  
  // 1. Server-side logout (clears cookies)
  await supabase.auth.signOut()

  if (code) {
    // PKCE Flow
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`)
    }
  }

  // 2. Client-side aggressive logout + hash detection
  // This is needed for invitations because they use hashes (#access_token)
  // which the server cannot see. We must clear client storage manually.
  return new NextResponse(
    `<html>
      <head>
        <script>
          const finalize = () => {
            // Clear current domain storage to avoid session mixing
            localStorage.clear();
            sessionStorage.clear();
            
            const hash = window.location.hash;
            if (hash && hash.includes('access_token=')) {
              // Redirect to final destination with the token hash
              window.location.href = '${redirectBase}${next}' + hash;
            } else if ('${code}' === 'null' && !hash) {
              // If no code and no hash, redirect to login
              window.location.href = '${redirectBase}/login';
            } else if ('${code}' !== 'null') {
              // If we HAD a code, the server already attempted exchange and failed (if we are still here)
              window.location.href = '${redirectBase}/auth/auth-code-error';
            } else {
              window.location.href = '${redirectBase}/login';
            }
          };
          finalize();
        </script>
      </head>
      <body><p>Redirecting safely...</p></body>
    </html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
