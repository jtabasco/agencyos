import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const redirectBase = process.env.NODE_ENV === 'development' ? origin : siteUrl

  // Handle PKCE Flow (Email verification, Password reset)
  if (code) {
    const supabase = await createClient()
    
    // Safety: Always sign out before exchanging code to avoid session mixing
    await supabase.auth.signOut()

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`)
    }
    
    console.error('Auth callback exchange error:', error)
  }

  // Handle Implicit Flow (Invitations often use hash fragments like #access_token=...)
  // Since the server cannot see the hash, we return a small script to handle it on the client
  return new NextResponse(
    `<html>
      <head>
        <script>
          // Check if there is a hash with an access_token (Implicit Flow)
          const hash = window.location.hash;
          if (hash && hash.includes('access_token=')) {
            // Let the Supabase client handle the session from the hash
            // Then redirect to the final destination
            window.location.href = '${redirectBase}${next}' + hash;
          } else {
            // If no hash and no code, it's an error
            window.location.href = '${redirectBase}/auth/auth-code-error';
          }
        </script>
      </head>
      <body>
        <p>Redirecting...</p>
      </body>
    </html>`,
    {
      headers: { 'Content-Type': 'text/html' },
    }
  )
}
