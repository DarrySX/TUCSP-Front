-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'aspirante' CHECK (role IN ('super_admin', 'tuno_admin', 'tuno', 'pardillo', 'aspirante')),
  absences_count INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  date DATE NOT NULL,
  time TIME,
  type VARCHAR(50) NOT NULL CHECK (type IN ('event', 'contract', 'boarding', 'rehearsal', 'university_presentation')),
  is_income BOOLEAN DEFAULT FALSE,
  cost DECIMAL(10, 2) DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'present', 'absent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- Create activity_feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('comment', 'image', 'video')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Super admin can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Tuno admin can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'tuno_admin')
    )
  );

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Super admin can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can delete users"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for activities table
CREATE POLICY "Everyone can view activities"
  ON activities FOR SELECT
  USING (TRUE);

CREATE POLICY "Tuno admin can create activities"
  ON activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'tuno_admin')
    )
  );

CREATE POLICY "Tuno admin can update activities"
  ON activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'tuno_admin')
    )
  );

CREATE POLICY "Tuno admin can delete activities"
  ON activities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'tuno_admin')
    )
  );

-- RLS Policies for attendance table
CREATE POLICY "Users can view their own attendance"
  ON attendance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Tuno admin can view all attendance"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'tuno_admin')
    )
  );

CREATE POLICY "Users can insert their own attendance"
  ON attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tuno admin can insert attendance"
  ON attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'tuno_admin')
    )
  );

CREATE POLICY "Tuno admin can update attendance"
  ON attendance FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'tuno_admin')
    )
  );

-- RLS Policies for activity_feed table
CREATE POLICY "Everyone can view activity feed"
  ON activity_feed FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can add their own content"
  ON activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
  ON activity_feed FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for media (if using Supabase storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-media', 'activity-media', true)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Public access to activity media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'activity-media');

CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'activity-media' AND
    auth.role() = 'authenticated'
  );
