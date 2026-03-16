'use client'

import { useState } from 'react'

const migrationSql = `-- MIGRATION 1: Add preferred_language column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en'
CHECK (preferred_language IN ('en', 'es', 'fr'));

CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language
ON public.profiles(preferred_language);

-- MIGRATION 2: Fix default user role trigger
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

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon, service_role;`

export function MigrationHelper() {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(migrationSql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cosmic-500 to-nebula-500 rounded-lg hover:shadow-lg hover:shadow-cosmic-500/40 transition-all"
      >
        Database Migrations
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-space-700 bg-space-900 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-stardust-100">Database Migrations</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-stardust-400 hover:text-stardust-100"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-stardust-400 mb-4">
                Copy this SQL and run it in Supabase Dashboard → SQL Editor
              </p>

              <div className="relative">
                <pre className="bg-space-800/50 border border-space-700 rounded-lg p-4 text-xs text-stardust-100 overflow-x-auto">
                  {migrationSql}
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 px-3 py-1.5 bg-cosmic-500 text-white text-xs rounded hover:bg-cosmic-600 transition-colors"
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="bg-space-800/30 border border-space-700/50 rounded-lg p-4 text-sm text-stardust-400 mb-4">
              <p className="font-semibold text-stardust-200 mb-2">What this does:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Adds language preference support for AI reports</li>
                <li>Fixes user role assignment (new users as "client", not "owner")</li>
                <li>Updates the auth trigger to handle the new field</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  copyToClipboard()
                  window.open('https://app.supabase.com/projects', '_blank')
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cosmic-500 to-nebula-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Copy & Open Supabase
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-space-700 text-stardust-100 rounded-lg hover:bg-space-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
