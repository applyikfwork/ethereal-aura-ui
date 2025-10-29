-- ============================================
-- AURA AI Avatar Creator - Supabase Database Setup
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  credits INTEGER NOT NULL DEFAULT 3,
  premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- AVATARS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  stylized_url TEXT,
  public BOOLEAN NOT NULL DEFAULT false,
  gender TEXT,
  hair_style TEXT,
  hair_color TEXT,
  art_style TEXT,
  aura_effect TEXT,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_avatars_public ON avatars(public);
CREATE INDEX IF NOT EXISTS idx_avatars_created_at ON avatars(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on both tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Allow users to read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Allow users to update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Allow insert for new users (registration)
CREATE POLICY "Allow user registration" ON users
  FOR INSERT
  WITH CHECK (true);

-- Avatars table policies
-- Users can view their own avatars
CREATE POLICY "Users can view own avatars" ON avatars
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Everyone can view public avatars
CREATE POLICY "Anyone can view public avatars" ON avatars
  FOR SELECT
  USING (public = true);

-- Users can insert their own avatars
CREATE POLICY "Users can create own avatars" ON avatars
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own avatars
CREATE POLICY "Users can update own avatars" ON avatars
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatars" ON avatars
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to reset daily credits (call this with a cron job)
CREATE OR REPLACE FUNCTION reset_daily_credits()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET credits = 3
  WHERE premium = false;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STORAGE BUCKET FOR AVATAR IMAGES
-- ============================================

-- Create storage bucket for avatars (run this in Supabase Dashboard -> Storage)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies (run after creating bucket)
-- CREATE POLICY "Avatar images are publicly accessible"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'avatars');

-- CREATE POLICY "Authenticated users can upload avatars"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can update own avatar images"
-- ON storage.objects FOR UPDATE
-- USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own avatar images"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Create a test user (only for development)
-- INSERT INTO users (name, email, credits, premium)
-- VALUES ('Test User', 'test@example.com', 3, false)
-- ON CONFLICT (email) DO NOTHING;

-- ============================================
-- HELPFUL QUERIES
-- ============================================

-- Get user with their avatar count
-- SELECT u.*, COUNT(a.id) as avatar_count
-- FROM users u
-- LEFT JOIN avatars a ON u.id = a.user_id
-- GROUP BY u.id;

-- Get public avatars for gallery
-- SELECT a.*, u.name as creator_name
-- FROM avatars a
-- JOIN users u ON a.user_id = u.id
-- WHERE a.public = true
-- ORDER BY a.created_at DESC;

-- Get user's remaining credits
-- SELECT name, email, credits, premium
-- FROM users
-- WHERE email = 'user@example.com';
