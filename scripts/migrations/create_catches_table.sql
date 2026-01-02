-- Create catches table for logging fish catches
-- Run this migration in your Supabase SQL editor

-- Create the catches table
CREATE TABLE IF NOT EXISTS catches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Fish details
  fish_species TEXT,
  size_length DECIMAL(5,2), -- Length in inches
  size_weight DECIMAL(6,2), -- Weight in lbs
  
  -- Location
  location_name TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  
  -- Fishing details
  fly_used TEXT,
  fly_id UUID REFERENCES flies(id) ON DELETE SET NULL, -- Optional link to flies table
  
  -- Conditions at time of catch
  water_temperature DECIMAL(5,2), -- In Fahrenheit
  water_conditions TEXT, -- e.g., 'clear', 'murky', 'high', 'low'
  weather_conditions TEXT, -- e.g., 'sunny', 'cloudy', 'rainy'
  air_temperature DECIMAL(5,2), -- In Fahrenheit
  
  -- Media
  photo_url TEXT,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  caught_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- When the fish was caught
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_catches_user_id ON catches(user_id);
CREATE INDEX IF NOT EXISTS idx_catches_caught_at ON catches(caught_at DESC);

-- Enable Row Level Security
ALTER TABLE catches ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own catches (private logs)
CREATE POLICY "Users can view their own catches"
  ON catches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own catches"
  ON catches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catches"
  ON catches FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catches"
  ON catches FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment for clarity
COMMENT ON TABLE catches IS 'Private catch logs for users to track their fishing catches';

