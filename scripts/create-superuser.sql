-- Insert superuser Brandon Randall Valencia Calderon into profiles
-- NOTE: The Supabase auth user must be created first via UI or Auth API
-- This script assumes the user with email brandon.valencia.calderon@gmail.com already exists in auth.users

INSERT INTO profiles (
  id,
  first_name,
  last_name,
  mote,
  carrera,
  telefono,
  persona_emergencia,
  telefono_emergencia,
  direccion,
  correo_electronico,
  tipo_sangre,
  dni,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'brandon.valencia.calderon@gmail.com' LIMIT 1),
  'Brandon',
  'Valencia Calderon',
  'Psicopata',
  '',
  '',
  '',
  '',
  '',
  'brandon.valencia.calderon@gmail.com',
  '',
  '',
  'super_admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  first_name = 'Brandon',
  last_name = 'Valencia Calderon',
  mote = 'Psicopata',
  role = 'super_admin',
  updated_at = NOW();
