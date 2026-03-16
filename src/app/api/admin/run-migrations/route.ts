import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    // Get auth token from request
    const body = await request.json()
    const { authToken } = body

    if (!authToken) {
      return NextResponse.json(
        { error: 'Missing auth token' },
        { status: 401 }
      )
    }

    // Verify user is owner
    const verifyResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${authToken}&select=role`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
        },
      }
    )

    if (!verifyResponse.ok) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const profiles = await verifyResponse.json()
    if (!profiles || profiles.length === 0 || profiles[0].role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can run migrations' },
        { status: 403 }
      )
    }

    // Execute migrations via SQL endpoint
    const sqlQueries = [
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'es', 'fr'));`,
      `CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language ON public.profiles(preferred_language);`,
      `CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ DECLARE user_count INTEGER; BEGIN SELECT COUNT(*) INTO user_count FROM profiles; INSERT INTO public.profiles (id, email, full_name, role, preferred_language, avatar_url, created_at, updated_at) VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''), CASE WHEN user_count = 0 THEN 'owner'::text ELSE 'client'::text END, 'en', COALESCE(new.raw_user_meta_data->>'avatar_url', NULL), NOW(), NOW()); RETURN new; END; $$;`,
      `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,
      `CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`,
      `GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon, service_role;`,
    ]

    const results = []
    for (const query of sqlQueries) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        })

        results.push({
          query: query.substring(0, 50) + '...',
          success: response.ok,
          status: response.status,
        })
      } catch (e: any) {
        results.push({
          query: query.substring(0, 50) + '...',
          success: false,
          error: e.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migrations executed',
      results,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
