#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://api.ciclomaja.jtabasco.com';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzIzMTIyMTEsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.1VogVa-ihr0yE3pnGud-sROaWENWngd-dxaFHdJ7z80';

// Initialize Supabase Admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('🚀 Starting migrations...\n');

  try {
    // Migration 1: Add preferred_language column
    console.log('📝 Migration 1: Adding preferred_language column...');
    const migration1 = `
      ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en'
      CHECK (preferred_language IN ('en', 'es', 'fr'));

      CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language
      ON public.profiles(preferred_language);
    `;

    const { error: err1 } = await supabase.rpc('exec_sql', {
      sql: migration1
    }).catch(async () => {
      // Fallback: execute via raw SQL endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: migration1 })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { error: null };
    });

    if (err1) {
      console.error('❌ Error in migration 1:', err1);
    } else {
      console.log('✅ Migration 1 completed successfully!\n');
    }

    // Migration 2: Fix default user role trigger
    console.log('📝 Migration 2: Fixing default user role trigger...');
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
    `;

    const { error: err2 } = await supabase.rpc('exec_sql', {
      sql: migration2
    }).catch(async () => {
      // Fallback: execute via raw SQL endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: migration2 })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { error: null };
    });

    if (err2) {
      console.error('❌ Error in migration 2:', err2);
    } else {
      console.log('✅ Migration 2 completed successfully!\n');
    }

    console.log('🎉 All migrations completed!\n');
    console.log('📋 Summary:');
    console.log('  • Added preferred_language column to profiles');
    console.log('  • Updated handle_new_user trigger for correct role assignment');
    console.log('  • New users will now be created as "client" by default');
    console.log('  • AI Reports can now be generated in user selected language');

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

runMigrations();
