-- Script to create the superuser Brandon Randall Valencia Calderon
-- This script should be run in Supabase SQL Editor

-- First, create the user in auth.users table
-- Note: You need to use Supabase UI or API to create in auth system
-- This creates the profile that links to the auth user

-- Get the superuser ID from auth.users - you'll need to replace this with the actual UUID
-- For now, we'll insert with a placeholder that you'll update after creating the user in Supabase Auth

INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  mote,
  correo_electronico,
  role,
  created_at,
  updated_at
) VALUES (
  -- Replace THIS_UID_FROM_AUTH with the actual user ID from Supabase Auth
  'replace-with-actual-uuid-from-auth',
  'Brandon',
  'Valencia Calderon',
  'Psicopata',
  'brandon.valencia.calderon@gmail.com',
  'super_admin',
  NOW(),
  NOW()
);

-- Verify the insert
SELECT * FROM public.profiles WHERE correo_electronico = 'brandon.valencia.calderon@gmail.com';
