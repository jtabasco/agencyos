-- Migration: Add preferred_language column to profiles table
-- Adds support for multilingual AI reports

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en'
CHECK (preferred_language IN ('en', 'es', 'fr'));

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language
ON public.profiles(preferred_language);
