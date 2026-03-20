-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS mote VARCHAR(100),
ADD COLUMN IF NOT EXISTS fecha_ingreso DATE,
ADD COLUMN IF NOT EXISTS fecha_bautizo DATE,
ADD COLUMN IF NOT EXISTS padrino_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lugar_bautizo VARCHAR(255),
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS carrera VARCHAR(100),
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS persona_emergencia VARCHAR(255),
ADD COLUMN IF NOT EXISTS telefono_emergencia VARCHAR(20),
ADD COLUMN IF NOT EXISTS direccion VARCHAR(255),
ADD COLUMN IF NOT EXISTS correo_electronico VARCHAR(255),
ADD COLUMN IF NOT EXISTS tipo_sangre VARCHAR(3),
ADD COLUMN IF NOT EXISTS dni VARCHAR(20);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_profiles_dni ON profiles(dni);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(correo_electronico);
