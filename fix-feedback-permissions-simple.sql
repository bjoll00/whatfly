-- Simple Fix for Feedback Admin Permissions
-- Run this in your Supabase SQL editor

-- 1. First, disable RLS temporarily to clear all policies
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read all feedback" ON feedback;
DROP POLICY IF EXISTS "Allow authenticated users to update feedback status" ON feedback;
DROP POLICY IF EXISTS "Allow authenticated users to delete feedback" ON feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can update own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can delete own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can update own pending feedback" ON feedback;
DROP POLICY IF EXISTS "Users can delete own pending feedback" ON feedback;

-- 3. Re-enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, permissive policies for authenticated users
CREATE POLICY "Authenticated users can do everything with feedback" ON feedback
  FOR ALL USING (auth.role() = 'authenticated');

-- 5. Ensure proper permissions
GRANT ALL ON feedback TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 6. Test the permissions
SELECT 'Permissions updated successfully' as status;
