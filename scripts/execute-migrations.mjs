#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://api.ciclomaja.jtabasco.com';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzIzMTIyMTEsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.1VogVa-ihr0yE3pnGud-sROaWENWngd-dxaFHdJ7z80';

console.log('🚀 Ejecutando migraciones...\n');

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSql(name, sql) {
  console.log(`📝 ${name}...`);

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql })
    });

    if (response.ok) {
      console.log(`✅ ${name} completado!\n`);
      return true;
    } else {
      const error = await response.text();
      console.error(`❌ Error: ${error}\n`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    return false;
  }
}

async function main() {
  // Migration 1: Add preferred_language column
  const migration1 = `
    ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en'
    CHECK (preferred_language IN ('en', 'es', 'fr'));

    CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language
    ON public.profiles(preferred_language);
  `;

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
  `;

  const result1 = await executeSql('Migration 1: Agregar columna preferred_language', migration1);
  const result2 = await executeSql('Migration 2: Arreglar trigger de rol por defecto', migration2);

  if (result1 && result2) {
    console.log('🎉 ¡Todas las migraciones completadas!\n');
    console.log('✅ Cambios realizados:');
    console.log('  • Agregada columna preferred_language a tabla profiles');
    console.log('  • Actualizado trigger handle_new_user para asignación correcta de roles');
    console.log('  • Los nuevos usuarios ahora se crean como "client" por defecto');
    console.log('  • Los reportes IA se pueden generar en idioma seleccionado del usuario');
  } else {
    console.log('⚠️ Algunas migraciones fallaron. Verifica los errores arriba.');
    process.exit(1);
  }
}

main();
