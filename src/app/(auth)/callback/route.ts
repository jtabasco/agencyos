import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Usa el host real del request (funciona detrás de proxies/CDN)
  const headers = new Headers(request.headers)
  const host = headers.get('x-forwarded-host') ?? headers.get('host') ?? ''
  const proto = headers.get('x-forwarded-proto') ?? 'https'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${siteUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${siteUrl}/login?error=auth_callback_failed`)
}
