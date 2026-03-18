import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const { searchParams, origin } = url
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  
  // Preserve any other query parameters (like ?email=...)
  const extraParams = new URLSearchParams(searchParams)
  extraParams.delete('code')
  extraParams.delete('next')
  const extraQuery = extraParams.toString() ? `&${extraParams.toString()}` : ''

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const redirectBase = process.env.NODE_ENV === 'development' ? origin : siteUrl

  // Handle PKCE Flow (Email verification, Password reset)
  if (code) {
    const supabase = await createClient()
    
    // Explicit sign out on the server to clear old session cookies
    await supabase.auth.signOut()

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}${extraQuery}`)
    }
    console.error('Auth callback exchange error:', error)
  }

  // Handle Invitation/Hash Flow
  // We return a page that clears local storage and then redirects with the hash.
  // This is better than a simple redirect because it cleans up the browser state.
  return new NextResponse(
    `<html>
      <head>
        <script>
          (function() {
            // Aggressive cleanup to avoid session collision
            localStorage.clear();
            sessionStorage.clear();
            
            const hash = window.location.hash;
            const fullNext = '${redirectBase}${next}${extraQuery}' + hash;
            
            if (hash || '${code}' === 'null') {
              window.location.replace(fullNext);
            } else {
              window.location.replace('${redirectBase}/auth/auth-code-error');
            }
          })();
        </script>
      </head>
      <body><p>Redirecting safely...</p></body>
    </html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
