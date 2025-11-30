-- Migration: Create profiles table for user profile data
-- Run this in Supabase SQL Editor: https://app.supabase.com → SQL Editor

-- Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  fishing_experience TEXT CHECK (fishing_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Username constraints: max 20 chars, alphanumeric + underscores only
ALTER TABLE public.profiles ADD CONSTRAINT username_length CHECK (char_length(username) <= 20);
ALTER TABLE public.profiles ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view profiles (needed for social features)
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Users can only delete their own profile
CREATE POLICY "Users can delete own profile" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on row update
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast username lookups (for uniqueness checks and profile search)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Index for searching by display name (for future search feature)
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Comment on table for documentation
COMMENT ON TABLE public.profiles IS 'User profile information linked to auth.users. Stores username, bio, avatar, and other social profile data.';
COMMENT ON COLUMN public.profiles.username IS 'Unique username, max 20 chars, alphanumeric and underscores only';
COMMENT ON COLUMN public.profiles.fishing_experience IS 'Self-reported fishing experience level';
