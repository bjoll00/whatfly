-- COMPLETE FLY DATABASE MIGRATION
-- This script expands the flies table schema and populates it with comprehensive data
-- Run this in the Supabase SQL editor

-- ========================================
-- STEP 1: ADD ALL MISSING COLUMNS TO FLIES TABLE
-- ========================================

-- Add missing columns to support the hierarchical algorithm
ALTER TABLE flies 
ADD COLUMN IF NOT EXISTS pattern_name TEXT,
ADD COLUMN IF NOT EXISTS sizes_available TEXT[],
ADD COLUMN IF NOT EXISTS secondary_colors TEXT[],
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS link TEXT,
ADD COLUMN IF NOT EXISTS regional_effectiveness JSONB,
ADD COLUMN IF NOT EXISTS target_species JSONB,
ADD COLUMN IF NOT EXISTS hatch_matching JSONB,
ADD COLUMN IF NOT EXISTS characteristics JSONB,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT,
ADD COLUMN IF NOT EXISTS tying_difficulty TEXT,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL;

-- ========================================
-- STEP 2: CLEAR EXISTING FLIES AND INSERT COMPREHENSIVE DATA
-- ========================================

-- Clear existing flies to start fresh with comprehensive data
DELETE FROM flies;

-- Insert comprehensive fly database with all hierarchical algorithm requirements
INSERT INTO flies (
  id, name, type, pattern_name, sizes_available, size, color, secondary_colors,
  description, best_conditions, regional_effectiveness, target_species, 
  hatch_matching, characteristics, difficulty_level, tying_difficulty,
  success_rate, total_uses, successful_uses, created_at, updated_at
) VALUES 

-- ========================================
-- DRY FLIES - Surface Fishing Specialists
-- ========================================

-- Classic Mayfly Patterns
(
  gen_random_uuid(), 'Adams', 'dry', 'Parachute Adams',
  ARRAY['12', '14', '16', '18', '20', '22'],
  '16', 'Gray', ARRAY['Light Gray', 'Dark Gray'],
  'Classic dry fly pattern, excellent for mayfly hatches. Works as both dun and spinner.',
  '{
    "weather": ["sunny", "cloudy", "overcast"],
    "water_clarity": ["clear", "slightly_murky"],
    "water_level": ["normal", "low"],
    "water_flow": ["moderate", "slow"],
    "time_of_day": ["morning", "afternoon", "dusk"],
    "time_of_year": ["spring", "summer", "fall"],
    "water_temperature_range": {"min": 45, "max": 70},
    "air_temperature_range": {"min": 50, "max": 80},
    "wind_conditions": ["calm", "light"],
    "light_conditions": ["bright", "overcast"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain", "midwest"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall"],
      "eastern": ["spring", "summer", "fall"],
      "mountain": ["spring", "summer", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["grayling", "char"],
    "size_preference": "medium"
  }'::jsonb,
  '{
    "insects": ["mayfly", "baetis", "bwo"],
    "stages": ["dun", "spinner"],
    "sizes": ["16", "18", "20", "22"]
  }'::jsonb,
  '{
    "floatability": "high",
    "visibility": "high",
    "durability": "medium",
    "versatility": "high"
  }'::jsonb,
  'intermediate', 'medium', 0.75, 150, 112, NOW(), NOW()
),

-- Parachute Adams
(
  gen_random_uuid(), 'Parachute Adams', 'dry', 'Para Adams',
  ARRAY['12', '14', '16', '18', '20'],
  '18', 'Gray', ARRAY['Light Gray', 'Dark Gray'],
  'Improved Adams with parachute hackle for better floatability in rough water.',
  '{
    "weather": ["sunny", "cloudy", "overcast"],
    "water_clarity": ["clear", "slightly_murky"],
    "water_level": ["normal", "low"],
    "water_flow": ["moderate", "slow"],
    "time_of_day": ["morning", "afternoon", "dusk"],
    "time_of_year": ["spring", "summer", "fall"],
    "water_temperature_range": {"min": 45, "max": 70},
    "air_temperature_range": {"min": 50, "max": 80},
    "wind_conditions": ["calm", "light"],
    "light_conditions": ["bright", "overcast"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain", "midwest"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall"],
      "eastern": ["spring", "summer", "fall"],
      "mountain": ["spring", "summer", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["grayling", "char"],
    "size_preference": "small"
  }'::jsonb,
  '{
    "insects": ["mayfly", "baetis", "bwo"],
    "stages": ["dun", "spinner"],
    "sizes": ["16", "18", "20", "22"]
  }'::jsonb,
  '{
    "floatability": "high",
    "visibility": "high",
    "durability": "high",
    "versatility": "high"
  }'::jsonb,
  'intermediate', 'medium', 0.78, 130, 101, NOW(), NOW()
),

-- Blue Winged Olive
(
  gen_random_uuid(), 'Blue Winged Olive', 'dry', 'BWO',
  ARRAY['16', '18', '20', '22', '24'],
  '20', 'Olive', ARRAY['Dark Olive', 'Light Olive'],
  'Essential mayfly pattern for spring and fall. Critical for selective trout.',
  '{
    "weather": ["cloudy", "overcast"],
    "water_clarity": ["clear", "slightly_murky"],
    "water_level": ["normal", "low"],
    "water_flow": ["slow", "moderate"],
    "time_of_day": ["midday", "afternoon"],
    "time_of_year": ["spring", "fall"],
    "water_temperature_range": {"min": 45, "max": 65},
    "air_temperature_range": {"min": 50, "max": 75},
    "wind_conditions": ["calm", "light"],
    "light_conditions": ["overcast", "low_light"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain", "midwest"],
    "primary_regions": ["western", "eastern", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "fall"],
      "eastern": ["spring", "fall"],
      "mountain": ["spring", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["grayling", "char"],
    "size_preference": "small"
  }'::jsonb,
  '{
    "insects": ["mayfly", "baetis", "bwo"],
    "stages": ["dun", "spinner"],
    "sizes": ["18", "20", "22", "24"]
  }'::jsonb,
  '{
    "floatability": "high",
    "visibility": "medium",
    "durability": "medium",
    "versatility": "high"
  }'::jsonb,
  'intermediate', 'medium', 0.82, 170, 139, NOW(), NOW()
),

-- Caddisfly Patterns
(
  gen_random_uuid(), 'Elk Hair Caddis', 'dry', 'X-Caddis',
  ARRAY['10', '12', '14', '16', '18'],
  '14', 'Brown', ARRAY['Tan', 'Olive', 'Black'],
  'Versatile dry fly for caddis hatches. Excellent floatability and natural movement.',
  '{
    "weather": ["sunny", "cloudy", "overcast", "rainy"],
    "water_clarity": ["clear", "slightly_murky", "murky"],
    "water_level": ["normal", "high"],
    "water_flow": ["moderate", "fast", "slow"],
    "time_of_day": ["morning", "afternoon", "dusk"],
    "time_of_year": ["spring", "summer", "fall"],
    "water_temperature_range": {"min": 50, "max": 75},
    "air_temperature_range": {"min": 55, "max": 85},
    "wind_conditions": ["calm", "light", "moderate"],
    "light_conditions": ["bright", "overcast", "low_light"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain", "midwest", "southern"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall"],
      "mountain": ["spring", "summer", "fall"],
      "eastern": ["spring", "summer", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["grayling", "char", "bass"],
    "size_preference": "medium"
  }'::jsonb,
  '{
    "insects": ["caddis", "trichoptera"],
    "stages": ["adult", "emerger"],
    "sizes": ["12", "14", "16", "18"]
  }'::jsonb,
  '{
    "floatability": "high",
    "visibility": "high",
    "durability": "high",
    "versatility": "high"
  }'::jsonb,
  'beginner', 'easy', 0.80, 200, 160, NOW(), NOW()
),

-- Terrestrial Patterns
(
  gen_random_uuid(), 'Daves Hopper', 'terrestrial', 'Parachute Hopper',
  ARRAY['6', '8', '10', '12'],
  '10', 'Yellow', ARRAY['Green', 'Brown', 'Tan'],
  'Classic grasshopper imitation. Perfect for summer terrestrial fishing.',
  '{
    "weather": ["sunny", "cloudy"],
    "water_clarity": ["clear", "slightly_murky"],
    "water_level": ["normal", "low"],
    "water_flow": ["slow", "moderate"],
    "time_of_day": ["midday", "afternoon"],
    "time_of_year": ["summer", "fall"],
    "water_temperature_range": {"min": 60, "max": 80},
    "air_temperature_range": {"min": 70, "max": 95},
    "wind_conditions": ["light", "moderate", "strong"],
    "light_conditions": ["bright"]
  }'::jsonb,
  '{
    "regions": ["western", "mountain", "midwest"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["summer", "fall"],
      "mountain": ["summer", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["bass", "panfish"],
    "size_preference": "large"
  }'::jsonb,
  '{
    "insects": ["grasshopper", "terrestrial"],
    "stages": ["adult"],
    "sizes": ["6", "8", "10", "12"]
  }'::jsonb,
  '{
    "floatability": "high",
    "visibility": "high",
    "durability": "high",
    "versatility": "medium"
  }'::jsonb,
  'beginner', 'medium', 0.70, 120, 84, NOW(), NOW()
),

-- Mouse Patterns (Night Fishing)
(
  gen_random_uuid(), 'Morrish Mouse', 'streamer', 'Mouse Pattern',
  ARRAY['2', '4', '6', '8'],
  '6', 'Brown', ARRAY['Black', 'Tan', 'Gray'],
  'Large mouse imitation for night fishing. Deadly on big trout during low light.',
  '{
    "weather": ["cloudy", "overcast"],
    "water_clarity": ["clear", "slightly_murky"],
    "water_level": ["normal", "high"],
    "water_flow": ["slow", "moderate"],
    "time_of_day": ["night", "dusk"],
    "time_of_year": ["summer", "fall"],
    "water_temperature_range": {"min": 50, "max": 70},
    "air_temperature_range": {"min": 60, "max": 80},
    "wind_conditions": ["calm", "light"],
    "light_conditions": ["low_light", "dark"]
  }'::jsonb,
  '{
    "regions": ["western", "mountain", "eastern"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["summer", "fall"],
      "mountain": ["summer", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["bass"],
    "size_preference": "large"
  }'::jsonb,
  '{
    "insects": ["mouse", "terrestrial"],
    "stages": ["adult"],
    "sizes": ["2", "4", "6", "8"]
  }'::jsonb,
  '{
    "floatability": "medium",
    "sink_rate": "slow",
    "visibility": "high",
    "durability": "high",
    "versatility": "low"
  }'::jsonb,
  'advanced', 'hard', 0.85, 80, 68, NOW(), NOW()
),

-- ========================================
-- NYMPHS - Subsurface Fishing Specialists
-- ========================================

-- Pheasant Tail Nymph
(
  gen_random_uuid(), 'Pheasant Tail Nymph', 'nymph', 'PT Nymph',
  ARRAY['12', '14', '16', '18', '20', '22'],
  '18', 'Brown', ARRAY['Olive', 'Black', 'Copper'],
  'Classic nymph pattern. Imitates mayfly nymphs and works year-round.',
  '{
    "weather": ["cloudy", "overcast", "rainy", "sunny"],
    "water_clarity": ["clear", "slightly_murky", "murky"],
    "water_level": ["normal", "high", "low"],
    "water_flow": ["moderate", "fast", "slow"],
    "time_of_day": ["morning", "midday", "afternoon"],
    "time_of_year": ["spring", "summer", "fall", "winter"],
    "water_temperature_range": {"min": 35, "max": 70},
    "air_temperature_range": {"min": 40, "max": 85},
    "wind_conditions": ["calm", "light", "moderate", "strong"],
    "light_conditions": ["bright", "overcast", "low_light"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain", "midwest", "southern"],
    "primary_regions": ["western", "eastern", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall", "winter"],
      "eastern": ["spring", "summer", "fall", "winter"],
      "mountain": ["spring", "summer", "fall", "winter"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["grayling", "char", "bass"],
    "size_preference": "medium"
  }'::jsonb,
  '{
    "insects": ["mayfly", "baetis", "bwo", "pale morning dun"],
    "stages": ["nymph"],
    "sizes": ["14", "16", "18", "20", "22"]
  }'::jsonb,
  '{
    "sink_rate": "medium",
    "visibility": "medium",
    "durability": "high",
    "versatility": "high"
  }'::jsonb,
  'beginner', 'easy', 0.85, 300, 255, NOW(), NOW()
),

-- Stonefly Nymphs
(
  gen_random_uuid(), 'Pats Rubber Legs', 'nymph', 'Rubber Leg Stonefly',
  ARRAY['4', '6', '8', '10', '12'],
  '8', 'Brown', ARRAY['Black', 'Olive', 'Golden'],
  'Large stonefly nymph imitation. Excellent for high water and cold conditions.',
  '{
    "weather": ["cloudy", "overcast", "rainy"],
    "water_clarity": ["clear", "slightly_murky", "murky"],
    "water_level": ["high", "normal"],
    "water_flow": ["fast", "moderate"],
    "time_of_day": ["morning", "midday", "afternoon"],
    "time_of_year": ["spring", "summer", "fall"],
    "water_temperature_range": {"min": 40, "max": 65},
    "air_temperature_range": {"min": 45, "max": 80},
    "wind_conditions": ["calm", "light", "moderate", "strong"],
    "light_conditions": ["overcast", "low_light", "bright"]
  }'::jsonb,
  '{
    "regions": ["western", "mountain"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "summer"],
      "mountain": ["spring", "summer"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["grayling"],
    "size_preference": "large"
  }'::jsonb,
  '{
    "insects": ["stonefly", "golden stone", "salmonfly"],
    "stages": ["nymph"],
    "sizes": ["4", "6", "8", "10"]
  }'::jsonb,
  '{
    "sink_rate": "fast",
    "visibility": "high",
    "durability": "high",
    "versatility": "medium"
  }'::jsonb,
  'intermediate', 'medium', 0.80, 180, 144, NOW(), NOW()
),

-- Midge Patterns
(
  gen_random_uuid(), 'Zebra Midge', 'nymph', 'Midge Larva',
  ARRAY['18', '20', '22', '24', '26'],
  '22', 'Black', ARRAY['Red', 'Olive', 'Brown', 'Purple'],
  'Tiny midge larva imitation. Essential for winter and selective fish.',
  '{
    "weather": ["cloudy", "overcast", "sunny"],
    "water_clarity": ["clear", "slightly_murky"],
    "water_level": ["normal", "low"],
    "water_flow": ["slow", "moderate"],
    "time_of_day": ["morning", "midday", "afternoon"],
    "time_of_year": ["winter", "spring", "fall"],
    "water_temperature_range": {"min": 32, "max": 55},
    "air_temperature_range": {"min": 35, "max": 70},
    "wind_conditions": ["calm", "light"],
    "light_conditions": ["bright", "overcast"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain", "midwest"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["winter", "spring", "fall"],
      "mountain": ["winter", "spring", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["grayling", "char"],
    "size_preference": "small"
  }'::jsonb,
  '{
    "insects": ["midge", "chironomid"],
    "stages": ["nymph", "larva"],
    "sizes": ["18", "20", "22", "24", "26"]
  }'::jsonb,
  '{
    "sink_rate": "slow",
    "visibility": "low",
    "durability": "medium",
    "versatility": "high"
  }'::jsonb,
  'intermediate', 'medium', 0.90, 250, 225, NOW(), NOW()
),

-- ========================================
-- STREAMERS - Aggressive Fishing Patterns
-- ========================================

-- Woolly Bugger
(
  gen_random_uuid(), 'Woolly Bugger', 'streamer', 'Bugger',
  ARRAY['4', '6', '8', '10', '12', '14'],
  '8', 'Black', ARRAY['Olive', 'Brown', 'White', 'Chartreuse'],
  'Versatile streamer pattern. Imitates leeches, baitfish, and other large prey.',
  '{
    "weather": ["sunny", "cloudy", "overcast", "rainy"],
    "water_clarity": ["clear", "slightly_murky", "murky"],
    "water_level": ["normal", "high", "low"],
    "water_flow": ["moderate", "fast", "slow"],
    "time_of_day": ["morning", "midday", "afternoon", "dusk"],
    "time_of_year": ["spring", "summer", "fall", "winter"],
    "water_temperature_range": {"min": 40, "max": 75},
    "air_temperature_range": {"min": 45, "max": 90},
    "wind_conditions": ["calm", "light", "moderate", "strong"],
    "light_conditions": ["bright", "overcast", "low_light"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain", "midwest", "southern"],
    "primary_regions": ["western", "eastern", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall", "winter"],
      "eastern": ["spring", "summer", "fall", "winter"],
      "mountain": ["spring", "summer", "fall", "winter"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["bass", "pike", "grayling"],
    "size_preference": "large"
  }'::jsonb,
  '{
    "insects": ["leech", "baitfish", "crayfish"],
    "stages": ["adult", "nymph"],
    "sizes": ["6", "8", "10", "12"]
  }'::jsonb,
  '{
    "sink_rate": "fast",
    "visibility": "high",
    "durability": "high",
    "versatility": "high"
  }'::jsonb,
  'beginner', 'easy', 0.75, 220, 165, NOW(), NOW()
),

-- Sculpin Patterns
(
  gen_random_uuid(), 'Sculpin Streamer', 'streamer', 'Sculpin',
  ARRAY['2', '4', '6', '8'],
  '6', 'Olive', ARRAY['Brown', 'Black', 'Tan'],
  'Realistic sculpin imitation. Deadly for large trout in deeper water.',
  '{
    "weather": ["cloudy", "overcast", "rainy"],
    "water_clarity": ["clear", "slightly_murky", "murky"],
    "water_level": ["normal", "high"],
    "water_flow": ["moderate", "fast"],
    "time_of_day": ["morning", "midday", "afternoon"],
    "time_of_year": ["spring", "summer", "fall"],
    "water_temperature_range": {"min": 45, "max": 70},
    "air_temperature_range": {"min": 50, "max": 85},
    "wind_conditions": ["calm", "light", "moderate"],
    "light_conditions": ["overcast", "low_light"]
  }'::jsonb,
  '{
    "regions": ["western", "mountain"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall"],
      "mountain": ["spring", "summer", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["bass", "pike"],
    "size_preference": "large"
  }'::jsonb,
  '{
    "insects": ["sculpin", "baitfish"],
    "stages": ["adult"],
    "sizes": ["2", "4", "6", "8"]
  }'::jsonb,
  '{
    "sink_rate": "fast",
    "visibility": "high",
    "durability": "high",
    "versatility": "medium"
  }'::jsonb,
  'advanced', 'hard', 0.85, 100, 85, NOW(), NOW()
),

-- ========================================
-- EMERGERS - Transition Stage Specialists
-- ========================================

-- RS2 Emerger
(
  gen_random_uuid(), 'RS2 Emerger', 'emerger', 'Rainy''s Super 2',
  ARRAY['16', '18', '20', '22'],
  '18', 'Gray', ARRAY['Olive', 'Brown', 'Tan'],
  'Effective emerger pattern. Imitates insects transitioning from nymph to adult.',
  '{
    "weather": ["cloudy", "overcast", "rainy"],
    "water_clarity": ["clear", "slightly_murky"],
    "water_level": ["normal", "low"],
    "water_flow": ["slow", "moderate"],
    "time_of_day": ["morning", "afternoon", "dusk"],
    "time_of_year": ["spring", "summer", "fall"],
    "water_temperature_range": {"min": 45, "max": 70},
    "air_temperature_range": {"min": 50, "max": 80},
    "wind_conditions": ["calm", "light"],
    "light_conditions": ["overcast", "low_light"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall"],
      "mountain": ["spring", "summer", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["grayling", "char"],
    "size_preference": "small"
  }'::jsonb,
  '{
    "insects": ["mayfly", "baetis", "bwo", "pale morning dun"],
    "stages": ["emerger"],
    "sizes": ["16", "18", "20", "22"]
  }'::jsonb,
  '{
    "floatability": "medium",
    "sink_rate": "slow",
    "visibility": "medium",
    "durability": "medium",
    "versatility": "high"
  }'::jsonb,
  'intermediate', 'medium', 0.80, 160, 128, NOW(), NOW()
),

-- ========================================
-- SPECIALIZED PATTERNS
-- ========================================

-- San Juan Worm
(
  gen_random_uuid(), 'San Juan Worm', 'nymph', 'SJW',
  ARRAY['10', '12', '14', '16', '18'],
  '14', 'Red', ARRAY['Pink', 'Orange', 'Brown'],
  'Simple but effective worm pattern. Works great in high, dirty water.',
  '{
    "weather": ["cloudy", "overcast", "rainy"],
    "water_clarity": ["slightly_murky", "murky", "very_murky"],
    "water_level": ["high", "normal"],
    "water_flow": ["fast", "moderate"],
    "time_of_day": ["morning", "midday", "afternoon"],
    "time_of_year": ["spring", "summer", "fall"],
    "water_temperature_range": {"min": 40, "max": 65},
    "air_temperature_range": {"min": 45, "max": 80},
    "wind_conditions": ["calm", "light", "moderate"],
    "light_conditions": ["overcast", "low_light"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain", "midwest"],
    "primary_regions": ["western", "eastern"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall"],
      "eastern": ["spring", "summer", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["bass", "panfish"],
    "size_preference": "medium"
  }'::jsonb,
  '{
    "insects": ["worm", "aquatic worm"],
    "stages": ["adult"],
    "sizes": ["10", "12", "14", "16"]
  }'::jsonb,
  '{
    "sink_rate": "fast",
    "visibility": "high",
    "durability": "high",
    "versatility": "medium"
  }'::jsonb,
  'beginner', 'easy', 0.70, 140, 98, NOW(), NOW()
),

-- Stimulator
(
  gen_random_uuid(), 'Stimulator', 'dry', 'Stimmy',
  ARRAY['4', '6', '8', '10', '12', '14'],
  '10', 'Yellow', ARRAY['Orange', 'Red', 'Green'],
  'High-floating attractor pattern. Excellent for rough water and as a dropper indicator.',
  '{
    "weather": ["sunny", "cloudy", "overcast", "rainy"],
    "water_clarity": ["clear", "slightly_murky", "murky"],
    "water_level": ["normal", "high"],
    "water_flow": ["fast", "moderate"],
    "time_of_day": ["morning", "midday", "afternoon"],
    "time_of_year": ["spring", "summer", "fall"],
    "water_temperature_range": {"min": 45, "max": 75},
    "air_temperature_range": {"min": 50, "max": 90},
    "wind_conditions": ["calm", "light", "moderate", "strong"],
    "light_conditions": ["bright", "overcast"]
  }'::jsonb,
  '{
    "regions": ["western", "mountain"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall"],
      "mountain": ["spring", "summer", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["grayling"],
    "size_preference": "large"
  }'::jsonb,
  '{
    "insects": ["stonefly", "caddis", "attractor"],
    "stages": ["adult", "attractor"],
    "sizes": ["6", "8", "10", "12"]
  }'::jsonb,
  '{
    "floatability": "high",
    "visibility": "high",
    "durability": "high",
    "versatility": "high"
  }'::jsonb,
  'intermediate', 'medium', 0.75, 180, 135, NOW(), NOW()
),

-- Chubby Chernobyl (Fixed)
(
  gen_random_uuid(), 'Chubby Chernobyl', 'dry', 'Chubby',
  ARRAY['4', '6', '8', '10', '12'],
  '8', 'Yellow', ARRAY['Orange', 'Pink', 'White'],
  'Large, buoyant attractor pattern. Excellent for rough water and as a hopper imitation.',
  '{
    "weather": ["sunny", "cloudy"],
    "water_clarity": ["clear", "slightly_murky", "murky"],
    "water_level": ["normal", "high"],
    "water_flow": ["fast", "moderate"],
    "time_of_day": ["morning", "afternoon"],
    "time_of_year": ["summer", "fall"],
    "water_temperature_range": {"min": 50, "max": 80},
    "air_temperature_range": {"min": 60, "max": 95},
    "wind_conditions": ["light", "moderate"],
    "light_conditions": ["bright"]
  }'::jsonb,
  '{
    "regions": ["western", "mountain"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["summer", "fall"],
      "mountain": ["summer", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["bass"],
    "size_preference": "large"
  }'::jsonb,
  '{
    "insects": ["grasshopper", "stonefly", "attractor"],
    "stages": ["adult", "attractor"],
    "sizes": ["6", "8", "10", "12"]
  }'::jsonb,
  '{
    "floatability": "high",
    "visibility": "high",
    "durability": "high",
    "versatility": "medium"
  }'::jsonb,
  'intermediate', 'medium', 0.65, 120, 78, NOW(), NOW()
),

-- Bead Head Pheasant Tail
(
  gen_random_uuid(), 'Bead Head Pheasant Tail', 'nymph', 'BHPT',
  ARRAY['12', '14', '16', '18', '20'],
  '16', 'Brown', ARRAY['Olive', 'Black', 'Copper'],
  'Weighted version of the classic Pheasant Tail. Sinks faster and stays in the strike zone.',
  '{
    "weather": ["cloudy", "overcast", "rainy", "sunny"],
    "water_clarity": ["clear", "slightly_murky", "murky"],
    "water_level": ["normal", "high", "low"],
    "water_flow": ["moderate", "fast", "slow"],
    "time_of_day": ["morning", "midday", "afternoon"],
    "time_of_year": ["spring", "summer", "fall", "winter"],
    "water_temperature_range": {"min": 35, "max": 70},
    "air_temperature_range": {"min": 40, "max": 85},
    "wind_conditions": ["calm", "light", "moderate", "strong"],
    "light_conditions": ["bright", "overcast", "low_light"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain", "midwest", "southern"],
    "primary_regions": ["western", "eastern", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall", "winter"],
      "eastern": ["spring", "summer", "fall", "winter"],
      "mountain": ["spring", "summer", "fall", "winter"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["grayling", "char", "bass"],
    "size_preference": "medium"
  }'::jsonb,
  '{
    "insects": ["mayfly", "baetis", "bwo", "pale morning dun"],
    "stages": ["nymph"],
    "sizes": ["14", "16", "18", "20"]
  }'::jsonb,
  '{
    "sink_rate": "fast",
    "visibility": "medium",
    "durability": "high",
    "versatility": "high"
  }'::jsonb,
  'beginner', 'easy', 0.85, 280, 238, NOW(), NOW()
),

-- Additional diverse flies for better variety
(
  gen_random_uuid(), 'Griffiths Gnat', 'dry', 'Midge Cluster',
  ARRAY['18', '20', '22', '24', '26'],
  '22', 'Black', ARRAY['Red', 'Olive', 'Brown', 'Purple'],
  'Tiny midge cluster pattern. Essential for selective fish during midge hatches.',
  '{
    "weather": ["cloudy", "overcast"],
    "water_clarity": ["clear", "slightly_murky"],
    "water_level": ["normal", "low"],
    "water_flow": ["slow", "moderate"],
    "time_of_day": ["morning", "midday", "afternoon"],
    "time_of_year": ["winter", "spring", "fall"],
    "water_temperature_range": {"min": 35, "max": 60},
    "air_temperature_range": {"min": 40, "max": 70},
    "wind_conditions": ["calm", "light"],
    "light_conditions": ["overcast", "low_light"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain", "midwest"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["winter", "spring", "fall"],
      "mountain": ["winter", "spring", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["grayling", "char"],
    "size_preference": "small"
  }'::jsonb,
  '{
    "insects": ["midge", "chironomid"],
    "stages": ["adult", "cluster"],
    "sizes": ["18", "20", "22", "24", "26"]
  }'::jsonb,
  '{
    "floatability": "high",
    "visibility": "low",
    "durability": "medium",
    "versatility": "high"
  }'::jsonb,
  'intermediate', 'medium', 0.88, 90, 79, NOW(), NOW()
),

(
  gen_random_uuid(), 'Prince Nymph', 'nymph', 'Prince',
  ARRAY['12', '14', '16', '18', '20'],
  '14', 'Brown', ARRAY['Gold', 'Black', 'White'],
  'Classic attractor nymph. Works well in most conditions and imitates various insects.',
  '{
    "weather": ["cloudy", "overcast", "rainy", "sunny"],
    "water_clarity": ["clear", "slightly_murky", "murky"],
    "water_level": ["normal", "high", "low"],
    "water_flow": ["moderate", "fast", "slow"],
    "time_of_day": ["morning", "midday", "afternoon"],
    "time_of_year": ["spring", "summer", "fall", "winter"],
    "water_temperature_range": {"min": 40, "max": 70},
    "air_temperature_range": {"min": 45, "max": 85},
    "wind_conditions": ["calm", "light", "moderate", "strong"],
    "light_conditions": ["bright", "overcast", "low_light"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain", "midwest", "southern"],
    "primary_regions": ["western", "eastern", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall", "winter"],
      "eastern": ["spring", "summer", "fall", "winter"],
      "mountain": ["spring", "summer", "fall", "winter"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["grayling", "char", "bass"],
    "size_preference": "medium"
  }'::jsonb,
  '{
    "insects": ["mayfly", "stonefly", "attractor"],
    "stages": ["nymph"],
    "sizes": ["12", "14", "16", "18"]
  }'::jsonb,
  '{
    "sink_rate": "medium",
    "visibility": "high",
    "durability": "high",
    "versatility": "high"
  }'::jsonb,
  'beginner', 'easy', 0.77, 190, 146, NOW(), NOW()
),

(
  gen_random_uuid(), 'Hare''s Ear Nymph', 'nymph', 'HE Nymph',
  ARRAY['12', '14', '16', '18', '20'],
  '16', 'Brown', ARRAY['Olive', 'Black', 'Natural'],
  'Natural-looking nymph pattern. Excellent for imitating various aquatic insects.',
  '{
    "weather": ["cloudy", "overcast", "rainy", "sunny"],
    "water_clarity": ["clear", "slightly_murky", "murky"],
    "water_level": ["normal", "high", "low"],
    "water_flow": ["moderate", "fast", "slow"],
    "time_of_day": ["morning", "midday", "afternoon"],
    "time_of_year": ["spring", "summer", "fall", "winter"],
    "water_temperature_range": {"min": 40, "max": 70},
    "air_temperature_range": {"min": 45, "max": 85},
    "wind_conditions": ["calm", "light", "moderate", "strong"],
    "light_conditions": ["bright", "overcast", "low_light"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain", "midwest", "southern"],
    "primary_regions": ["western", "eastern", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall", "winter"],
      "eastern": ["spring", "summer", "fall", "winter"],
      "mountain": ["spring", "summer", "fall", "winter"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["grayling", "char", "bass"],
    "size_preference": "medium"
  }'::jsonb,
  '{
    "insects": ["mayfly", "caddis", "stonefly"],
    "stages": ["nymph"],
    "sizes": ["12", "14", "16", "18"]
  }'::jsonb,
  '{
    "sink_rate": "medium",
    "visibility": "medium",
    "durability": "high",
    "versatility": "high"
  }'::jsonb,
  'beginner', 'easy', 0.83, 210, 174, NOW(), NOW()
),

(
  gen_random_uuid(), 'Mickey Finn', 'streamer', 'Finn',
  ARRAY['6', '8', '10', '12'],
  '10', 'Red', ARRAY['Yellow', 'White', 'Chartreuse'],
  'Classic streamer pattern. Excellent for aggressive fish and high water conditions.',
  '{
    "weather": ["cloudy", "overcast", "rainy"],
    "water_clarity": ["clear", "slightly_murky", "murky"],
    "water_level": ["normal", "high"],
    "water_flow": ["moderate", "fast"],
    "time_of_day": ["morning", "midday", "afternoon"],
    "time_of_year": ["spring", "summer", "fall"],
    "water_temperature_range": {"min": 45, "max": 70},
    "air_temperature_range": {"min": 50, "max": 85},
    "wind_conditions": ["calm", "light", "moderate"],
    "light_conditions": ["overcast", "low_light"]
  }'::jsonb,
  '{
    "regions": ["western", "eastern", "mountain", "midwest"],
    "primary_regions": ["western", "eastern"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall"],
      "eastern": ["spring", "summer", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["bass", "pike"],
    "size_preference": "large"
  }'::jsonb,
  '{
    "insects": ["baitfish", "attractor"],
    "stages": ["adult"],
    "sizes": ["6", "8", "10", "12"]
  }'::jsonb,
  '{
    "sink_rate": "fast",
    "visibility": "high",
    "durability": "high",
    "versatility": "medium"
  }'::jsonb,
  'beginner', 'easy', 0.72, 110, 79, NOW(), NOW()
),

(
  gen_random_uuid(), 'Parachute Ant', 'terrestrial', 'Para Ant',
  ARRAY['14', '16', '18', '20'],
  '16', 'Black', ARRAY['Brown', 'Red', 'Tan'],
  'Effective terrestrial pattern. Works great during ant falls and summer fishing.',
  '{
    "weather": ["sunny", "cloudy"],
    "water_clarity": ["clear", "slightly_murky"],
    "water_level": ["normal", "low"],
    "water_flow": ["slow", "moderate"],
    "time_of_day": ["midday", "afternoon"],
    "time_of_year": ["summer", "fall"],
    "water_temperature_range": {"min": 60, "max": 80},
    "air_temperature_range": {"min": 70, "max": 95},
    "wind_conditions": ["light", "moderate"],
    "light_conditions": ["bright"]
  }'::jsonb,
  '{
    "regions": ["western", "mountain", "midwest"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["summer", "fall"],
      "mountain": ["summer", "fall"]
    }
  }'::jsonb,
  '{
    "primary": ["trout"],
    "secondary": ["bass", "panfish"],
    "size_preference": "small"
  }'::jsonb,
  '{
    "insects": ["ant", "terrestrial"],
    "stages": ["adult"],
    "sizes": ["14", "16", "18", "20"]
  }'::jsonb,
  '{
    "floatability": "high",
    "visibility": "medium",
    "durability": "medium",
    "versatility": "medium"
  }'::jsonb,
  'beginner', 'easy', 0.68, 85, 58, NOW(), NOW()
);

-- ========================================
-- UPDATE CONFIDENCE SCORES
-- ========================================

UPDATE flies SET confidence_score = 
  CASE 
    WHEN success_rate > 0.8 THEN 95
    WHEN success_rate > 0.7 THEN 85
    WHEN success_rate > 0.6 THEN 75
    WHEN success_rate > 0.5 THEN 65
    ELSE 55
  END;

-- ========================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_flies_type ON flies(type);
CREATE INDEX IF NOT EXISTS idx_flies_size ON flies(size);
CREATE INDEX IF NOT EXISTS idx_flies_color ON flies(color);
CREATE INDEX IF NOT EXISTS idx_flies_success_rate ON flies(success_rate);
CREATE INDEX IF NOT EXISTS idx_flies_regional_effectiveness ON flies USING GIN(regional_effectiveness);
CREATE INDEX IF NOT EXISTS idx_flies_hatch_matching ON flies USING GIN(hatch_matching);
CREATE INDEX IF NOT EXISTS recursively_flies_best_conditions ON flies USING GIN(best_conditions);

-- ========================================
-- VERIFY THE MIGRATION
-- ========================================

-- Show summary of the new database
SELECT 
  COUNT(*) as total_flies,
  COUNT(DISTINCT type) as fly_types,
  COUNT(DISTINCT size) as size_variations,
  COUNT(DISTINCT color) as color_variations
FROM flies;

-- Show fly types and counts
SELECT 
  type,
  COUNT(*) as count,
  AVG(success_rate) as avg_success_rate,
  AVG(confidence_score) as avg_confidence
FROM flies 
GROUP BY type 
ORDER BY count DESC;

-- Show sample flies with comprehensive data
SELECT 
  name,
  type,
  size,
  color,
  best_conditions->'time_of_day' as time_of_day,
  best_conditions->'time_of_year' as time_of_year,
  best_conditions->'water_flow' as water_flow,
  best_conditions->'wind_conditions' as wind_conditions,
  best_conditions->'light_conditions' as light_conditions,
  regional_effectiveness->'regions' as regions,
  target_species->'primary' as target_species,
  hatch_matching->'insects' as hatch_insects,
  characteristics->'versatility' as versatility,
  success_rate,
  confidence_score
FROM flies 
ORDER BY success_rate DESC
LIMIT 10;

-- Check for any remaining flies with corrupted time_of_day data
SELECT name, best_conditions->'time_of_day' as time_of_day
FROM flies 
WHERE best_conditions->'time_of_day' ? 'spring' 
   OR best_conditions->'time_of_day' ? 'summer'
   OR best_conditions->'time_of_day' ? 'fall'
   OR best_conditions->'time_of_day' ? 'winter';

COMMIT;
