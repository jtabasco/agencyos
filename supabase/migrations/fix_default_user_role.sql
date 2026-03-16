-- Migration: Fix default user role from 'owner' to 'client'
-- This migration corrects the Supabase trigger that creates user profiles
-- New users should be created as 'client' by default, not 'owner'

-- 1. Update existing 'owner' role users who were just created (optional)
-- Uncomment if you want to convert all incorrectly created owners to clients
-- UPDATE profiles SET role = 'client' WHERE role = 'owner' AND created_at > NOW() - INTERVAL '7 days';

-- 2. Create or replace the trigger function for new user creation
-- This should replace your existing 'on_auth_user_created' function

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Check if this is the first user (should be owner)
  SELECT COUNT(*) INTO user_count FROM profiles;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    preferred_language,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    CASE
      WHEN user_count = 0 THEN 'owner'::text  -- First user is owner
      ELSE 'client'::text                       -- All other users are clients
    END,
    'en',
    COALESCE(new.raw_user_meta_data->>'avatar_url', NULL),
    NOW(),
    NOW()
  );

  RETURN new;
END;
$$;

-- 3. Ensure the trigger is attached to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon, service_role;

-- Done! New users will now be created as 'client' instead of 'owner'
-- The first user in the system will still be created as 'owner'
