-- WhatFly Database Setup for Supabase
-- Run this SQL in your Supabase SQL editor to set up the database tables

-- Create fishing_logs table
CREATE TABLE IF NOT EXISTS fishing_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  weather_conditions TEXT NOT NULL,
  water_conditions TEXT NOT NULL,
  water_temperature DECIMAL(5,2),
  air_temperature DECIMAL(5,2),
  wind_speed DECIMAL(5,2),
  wind_direction TEXT,
  water_clarity TEXT CHECK (water_clarity IN ('clear', 'slightly_murky', 'murky', 'very_murky')),
  water_level TEXT CHECK (water_level IN ('low', 'normal', 'high', 'flooding')),
  time_of_day TEXT CHECK (time_of_day IN ('dawn', 'morning', 'midday', 'afternoon', 'dusk', 'night')),
  flies_used TEXT[] DEFAULT '{}',
  successful_flies TEXT[] DEFAULT '{}',
  fish_caught INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flies table
CREATE TABLE IF NOT EXISTS flies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('dry', 'wet', 'nymph', 'streamer', 'terrestrial')) NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  best_conditions JSONB NOT NULL DEFAULT '{}',
  success_rate DECIMAL(3,2) DEFAULT 0.0,
  total_uses INTEGER DEFAULT 0,
  successful_uses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fishing_logs_user_id ON fishing_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fishing_logs_date ON fishing_logs(date);
CREATE INDEX IF NOT EXISTS idx_fishing_logs_location ON fishing_logs(location);
CREATE INDEX IF NOT EXISTS idx_flies_type ON flies(type);
CREATE INDEX IF NOT EXISTS idx_flies_success_rate ON flies(success_rate);

-- Insert sample flies data
INSERT INTO flies (name, type, size, color, description, best_conditions) VALUES
('Adams', 'dry', '16', 'Gray', 'Classic dry fly pattern, excellent for mayfly hatches', '{"weather": ["sunny", "cloudy", "overcast"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "low"], "time_of_day": ["morning", "afternoon", "dusk"], "water_temperature_range": {"min": 45, "max": 70}}'),
('Elk Hair Caddis', 'dry', '14', 'Brown', 'Versatile dry fly for caddis hatches', '{"weather": ["sunny", "cloudy"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "high"], "time_of_day": ["morning", "afternoon", "dusk"], "water_temperature_range": {"min": 50, "max": 75}}'),
('Pheasant Tail Nymph', 'nymph', '18', 'Brown', 'Effective nymph pattern for subsurface fishing', '{"weather": ["cloudy", "overcast", "rainy"], "water_clarity": ["clear", "slightly_murky", "murky"], "water_level": ["normal", "high"], "time_of_day": ["morning", "midday", "afternoon"], "water_temperature_range": {"min": 40, "max": 65}}'),
('Woolly Bugger', 'streamer', '8', 'Black', 'Versatile streamer that imitates various aquatic creatures', '{"weather": ["cloudy", "overcast", "rainy"], "water_clarity": ["slightly_murky", "murky", "very_murky"], "water_level": ["normal", "high", "flooding"], "time_of_day": ["dawn", "morning", "dusk", "night"], "water_temperature_range": {"min": 35, "max": 70}}'),
('Parachute Adams', 'dry', '20', 'Gray', 'High-visibility dry fly for difficult conditions', '{"weather": ["sunny", "cloudy"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "low"], "time_of_day": ["morning", "afternoon"], "water_temperature_range": {"min": 45, "max": 70}}'),
('Hare''s Ear Nymph', 'nymph', '16', 'Brown', 'Natural-looking nymph pattern', '{"weather": ["cloudy", "overcast"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "high"], "time_of_day": ["morning", "midday", "afternoon"], "water_temperature_range": {"min": 40, "max": 65}}'),
('Royal Wulff', 'dry', '12', 'Multi', 'High-floating dry fly for rough water', '{"weather": ["sunny", "cloudy"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "high"], "time_of_day": ["morning", "afternoon"], "water_temperature_range": {"min": 50, "max": 75}}'),
('Zebra Midge', 'nymph', '22', 'Black', 'Small midge pattern for selective fish', '{"weather": ["cloudy", "overcast"], "water_clarity": ["clear"], "water_level": ["normal", "low"], "time_of_day": ["morning", "midday", "afternoon"], "water_temperature_range": {"min": 35, "max": 60}}');

-- Enable Row Level Security (RLS)
ALTER TABLE fishing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE flies ENABLE ROW LEVEL SECURITY;

-- Create policies for fishing_logs (users can only see their own logs)
CREATE POLICY "Users can view their own fishing logs" ON fishing_logs
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own fishing logs" ON fishing_logs
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own fishing logs" ON fishing_logs
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own fishing logs" ON fishing_logs
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create policies for flies (everyone can read, but only authenticated users can modify)
CREATE POLICY "Anyone can view flies" ON flies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert flies" ON flies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update flies" ON flies
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete flies" ON flies
  FOR DELETE USING (auth.role() = 'authenticated');
