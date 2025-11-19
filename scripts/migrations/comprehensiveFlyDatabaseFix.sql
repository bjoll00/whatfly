-- COMPREHENSIVE FLY DATABASE FIX
-- This script fixes corrupted time_of_day data and adds comprehensive conditions
-- Run this in the Supabase SQL editor

-- ========================================
-- FIX CORRUPTED TIME_OF_DAY DATA
-- ========================================

-- Fix Chubby Chernobyl (most problematic fly)
UPDATE flies 
SET best_conditions = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    best_conditions,
                    '{time_of_day}', '["morning", "afternoon"]'::jsonb
                  ),
                  '{time_of_year}', '["summer", "fall"]'::jsonb
                ),
                '{water_flow}', '["fast", "moderate"]'::jsonb
              ),
              '{wind_conditions}', '["light", "moderate"]'::jsonb
            ),
            '{light_conditions}', '["bright"]'::jsonb
          ),
          '{air_temperature_range}', '{"min": 60, "max": 95}'::jsonb
        ),
        '{water_clarity}', '["clear", "slightly_murky", "murky"]'::jsonb
      ),
      '{water_temperature_range}', '{"min": 50, "max": 80}'::jsonb
    ),
    '{water_level}', '["normal", "high"]'::jsonb
  ),
  '{weather}', '["sunny", "cloudy"]'::jsonb
)
WHERE name = 'Chubby Chernobyl';

-- Fix other flies with corrupted time_of_day data
UPDATE flies 
SET best_conditions = jsonb_set(best_conditions, '{time_of_day}', '["morning", "afternoon", "dusk"]'::jsonb)
WHERE name = 'Adams' AND best_conditions->'time_of_day' ? 'spring';

UPDATE flies 
SET best_conditions = jsonb_set(best_conditions, '{time_of_day}', '["morning", "afternoon", "dusk"]'::jsonb)
WHERE name = 'Parachute Adams' AND best_conditions->'time_of_day' ? 'spring';

UPDATE flies 
SET best_conditions = jsonb_set(best_conditions, '{time_of_day}', '["morning", "midday", "afternoon"]'::jsonb)
WHERE name = 'Royal Wulff' AND best_conditions->'time_of_day' ? 'spring';

UPDATE flies 
SET best_conditions = jsonb_set(best_conditions, '{time_of_day}', '["morning", "midday", "afternoon"]'::jsonb)
WHERE name = 'Hare''s Ear Nymph' AND best_conditions->'time_of_day' ? 'spring';

-- ========================================
-- ADD COMPREHENSIVE CONDITIONS TO ALL FLIES
-- ========================================

-- Update Adams with comprehensive conditions
UPDATE flies 
SET best_conditions = '{
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
}'::jsonb
WHERE name = 'Adams';

-- Update Elk Hair Caddis with comprehensive conditions
UPDATE flies 
SET best_conditions = '{
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
}'::jsonb
WHERE name = 'Elk Hair Caddis';

-- Update Woolly Bugger with comprehensive conditions
UPDATE flies 
SET best_conditions = '{
  "weather": ["sunny", "cloudy", "overcast", "rainy"],
  "water_clarity": ["clear", "slightly_murky", "murky"],
  "water_level": ["normal", "high", "low"],
  "water_flow": ["moderate", "fast", "slow"],
  "time_of_day": ["morning", "midday", "afternoon", "dusk"],
  "time_of_year": ["spring", "summer", "fall", "winter"],
  "water_temperature_range": {"min": 40, "max": 75},
  "air_temperature_range": {"min": 45, "max": 90},
  "wind_conditions": ["calm", "light", "moderate", "strong"],
  "more_conditions": ["bright", "overcast", "low_light"]
}'::jsonb
WHERE name = 'Woolly Bugger';

-- Update Pheasant Tail Nymph with comprehensive conditions
UPDATE flies 
SET best_conditions = '{
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
}'::jsonb
WHERE name = 'Pheasant Tail Nymph';

-- Update Zebra Midge with comprehensive conditions
UPDATE flies 
SET best_conditions = '{
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
}'::jsonb
WHERE name = 'Zebra Midge';

-- Update Stimulator with comprehensive conditions
UPDATE flies 
SET best_conditions = '{
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
}'::jsonb
WHERE name = 'Stimulator';

-- Update Hare's Ear Nymph with comprehensive conditions
UPDATE flies 
SET best_conditions = '{
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
}'::jsonb
WHERE name = 'Hare''s Ear Nymph';

-- Update Prince Nymph with comprehensive conditions
UPDATE flies 
SET best_conditions = '{
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
}'::jsonb
WHERE name = 'Prince Nymph';

-- Update Bead Head Pheasant Tail with comprehensive conditions
UPDATE flies 
SET best_conditions = '{
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
}'::jsonb
WHERE name = 'Bead Head Pheasant Tail';

-- Update San Juan Worm with comprehensive conditions
UPDATE flies 
SET best_conditions = '{
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
}'::jsonb
WHERE name = 'San Juan Worm';

-- Update Morrish Mouse with comprehensive conditions
UPDATE flies 
SET best_conditions = '{
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
}'::jsonb
WHERE name = 'Morrish Mouse';

-- Update RS2 Emerger with comprehensive conditions
UPDATE flies 
SET best_conditions = '{
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
}'::jsonb
WHERE name = 'RS2';

-- ========================================
-- ADD COMPREHENSIVE CONDITIONS TO REMAINING FLIES
-- ========================================

-- Update all remaining dry flies with generic comprehensive conditions
UPDATE flies 
SET best_conditions = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  best_conditions,
                  '{water_flow}', '["moderate", "slow"]'::jsonb
                ),
                '{wind_conditions}', '["calm", "light"]'::jsonb
              ),
              '{light_conditions}', '["bright", "overcast"]'::jsonb
            ),
            '{air_temperature_range}', '{"min": 50, "max": 85}'::jsonb
          ),
          '{water_clarity}', '["clear", "slightly_murky"]'::jsonb
        ),
        '{water_level}', '["normal", "low"]'::jsonb
      ),
      '{time_of_year}', '["spring", "summer", "fall"]'::jsonb
    ),
    '{water_temperature_range}', '{"min": 45, "max": 75}'::jsonb
  ),
  '{time_of_day}', '["morning", "afternoon", "dusk"]'::jsonb
)
WHERE type = 'dry' 
  AND name NOT IN ('Adams', 'Elk Hair Caddis', 'Chubby Chernobyl', 'Stimulator')
  AND best_conditions->'time_of_day' IS NOT NULL;

-- Update all remaining nymphs with generic comprehensive conditions
UPDATE flies 
SET best_conditions = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  best_conditions,
                  '{water_flow}', '["moderate", "fast", "slow"]'::jsonb
                ),
                '{wind_conditions}', '["calm", "light", "moderate", "strong"]'::jsonb
              ),
              '{light_conditions}', '["bright", "overcast", "low_light"]'::jsonb
            ),
            '{air_temperature_range}', '{"min": 40, "max": 85}'::jsonb
          ),
          '{water_clarity}', '["clear", "slightly_murky", "murky"]'::jsonb
        ),
        '{water_level}', '["normal", "high", "low"]'::jsonb
      ),
      '{time_of_year}', '["spring", "summer", "fall", "winter"]'::jsonb
    ),
    '{water_temperature_range}', '{"min": 35, "max": 70}'::jsonb
  ),
  '{time_of_day}', '["morning", "midday", "afternoon"]'::jsonb
)
WHERE type = 'nymph' 
  AND name NOT IN ('Pheasant Tail Nymph', 'Zebra Midge', 'Hare''s Ear Nymph', 'Prince Nymph', 'Bead Head Pheasant Tail', 'San Juan Worm', 'RS2')
  AND best_conditions->'time_of_day' IS NOT NULL;

-- Update all remaining streamers with generic comprehensive conditions
UPDATE flies 
SET best_conditions = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  best_conditions,
                  '{water_flow}', '["moderate", "fast", "slow"]'::jsonb
                ),
                '{wind_conditions}', '["calm", "light", "moderate", "strong"]'::jsonb
              ),
              '{light_conditions}', '["bright", "overcast", "low_light"]'::jsonb
            ),
            '{air_temperature_range}', '{"min": 45, "max": 90}'::jsonb
          ),
          '{water_clarity}', '["clear", "slightly_murky", "murky"]'::jsonb
        ),
        '{water_level}', '["normal", "high", "low"]'::jsonb
      ),
      '{time_of_year}', '["spring", "summer", "fall", "winter"]'::jsonb
    ),
    '{water_temperature_range}', '{"min": 40, "max": 75}'::jsonb
  ),
  '{time_of_day}', '["morning", "midday", "afternoon", "dusk"]'::jsonb
)
WHERE type = 'streamer' 
  AND name NOT IN ('Woolly Bugger', 'Morrish Mouse')
  AND best_conditions->'time_of_day' IS NOT NULL;

-- Update all terrestrials with generic comprehensive conditions
UPDATE flies 
SET best_conditions = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  best_conditions,
                  '{water_flow}', '["slow", "moderate"]'::jsonb
                ),
                '{wind_conditions}', '["light", "moderate", "strong"]'::jsonb
              ),
              '{light_conditions}', '["bright"]'::jsonb
            ),
            '{air_temperature_range}', '{"min": 70, "max": 95}'::jsonb
          ),
          '{water_clarity}', '["clear", "slightly_murky"]'::jsonb
        ),
        '{water_level}', '["normal", "low"]'::jsonb
      ),
      '{time_of_year}', '["summer", "fall"]'::jsonb
    ),
    '{water_temperature_range}', '{"min": 60, "max": 80}'::jsonb
  ),
  '{time_of_day}', '["midday", "afternoon"]'::jsonb
)
WHERE type = 'terrestrial'
  AND best_conditions->'time_of_day' IS NOT NULL;

-- ========================================
-- VERIFY THE FIXES
-- ========================================

-- Show summary of fixes
SELECT 
  name,
  type,
  best_conditions->'time_of_day' as time_of_day,
  best_conditions->'time_of_year' as time_of_year,
  best_conditions->'water_flow' as water_flow,
  best_conditions->'wind_conditions' as wind_conditions,
  best_conditions->'light_conditions' as light_conditions
FROM flies 
WHERE name IN ('Adams', 'Elk Hair Caddis', 'Chubby Chernobyl', 'Woolly Bugger', 'Pheasant Tail Nymph', 'Zebra Midge')
ORDER BY name;

-- Count flies with comprehensive conditions
SELECT 
  COUNT(*) as total_flies,
  COUNT(CASE WHEN best_conditions ? 'water_flow' THEN 1 END) as with_water_flow,
  COUNT(CASE WHEN best_conditions ? 'wind_conditions' THEN 1 END) as with_wind_conditions,
  COUNT(CASE WHEN best_conditions ? 'light_conditions' THEN 1 END) as with_light_conditions,
  COUNT(CASE WHEN best_conditions ? 'air_temperature_range' THEN 1 END) as with_air_temp_range
FROM flies;

-- Show any remaining flies with corrupted time_of_day data
SELECT name, best_conditions->'time_of_day' as time_of_day
FROM flies 
WHERE best_conditions->'time_of_day' ? 'spring' 
   OR best_conditions->'time_of_day' ? 'summer'
   OR best_conditions->'time_of_day' ? 'fall'
   OR best_conditions->'time_of_day' ? 'winter';

COMMIT;
