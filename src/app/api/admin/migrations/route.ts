'use server'

import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and has admin rights
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is owner
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'owner') {
      return Response.json(
        { error: 'Only owners can run migrations' },
        { status: 403 }
      )
    }

    // Migration 1: Add preferred_language column
    const migration1 = `
      ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en'
      CHECK (preferred_language IN ('en', 'es', 'fr'));

      CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language
      ON public.profiles(preferred_language);
    `

    // Migration 2: Fix default user role trigger
    const migration2 = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER SET search_path = public
      AS $$
      DECLARE
        user_count INTEGER;
      BEGIN
        SELECT COUNT(*) INTO user_count FROM profiles;

        INSERT INTO public.profiles (
          id, email, full_name, role, preferred_language, avatar_url, created_at, updated_at
        )
        VALUES (
          new.id,
          new.email,
          COALESCE(new.raw_user_meta_data->>'full_name', ''),
          CASE WHEN user_count = 0 THEN 'owner'::text ELSE 'client'::text END,
          'en',
          COALESCE(new.raw_user_meta_data->>'avatar_url', NULL),
          NOW(),
          NOW()
        );

        RETURN new;
      END;
      $$;

      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();

      GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon, service_role;
    `

    // Execute migrations
    const results = {
      migration1: null as any,
      migration2: null as any,
      errors: [] as string[]
    }

    // Execute migration 1
    try {
      const { error: err1 } = await supabase.rpc('exec_sql', {
        sql: migration1
      })
      if (err1) {
        results.errors.push(`Migration 1 failed: ${err1.message}`)
      } else {
        results.migration1 = 'success'
      }
    } catch (e: any) {
      results.errors.push(`Migration 1 error: ${e.message}`)
    }

    // Execute migration 2
    try {
      const { error: err2 } = await supabase.rpc('exec_sql', {
        sql: migration2
      })
      if (err2) {
        results.errors.push(`Migration 2 failed: ${err2.message}`)
      } else {
        results.migration2 = 'success'
      }
    } catch (e: any) {
      results.errors.push(`Migration 2 error: ${e.message}`)
    }

    if (results.errors.length === 0) {
      return Response.json({
        success: true,
        message: 'Migrations completed successfully',
        results
      })
    } else {
      return Response.json({
        success: false,
        message: 'Some migrations failed',
        results,
        errors: results.errors
      }, { status: 500 })
    }
  } catch (error: any) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
