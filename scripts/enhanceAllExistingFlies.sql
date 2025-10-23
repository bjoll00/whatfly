-- ENHANCE ALL EXISTING FLIES WITH COMPREHENSIVE ATTRIBUTES
-- This script preserves all existing flies and adds comprehensive data
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
-- STEP 2: FIX CORRUPTED TIME_OF_DAY DATA
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

-- Fix all flies that have seasonal data in time_of_day field
UPDATE flies 
SET best_conditions = jsonb_set(
  best_conditions,
  '{time_of_day}',
  CASE 
    WHEN best_conditions->'time_of_day' ? 'spring' THEN '["morning", "afternoon", "dusk"]'::jsonb
    WHEN best_conditions->'time_of_day' ? 'summer' THEN '["morning", "midday", "afternoon"]'::jsonb
    WHEN best_conditions->'time_of_day' ? 'fall' THEN '["morning", "afternoon", "dusk"]'::jsonb
    WHEN best_conditions->'time_of_day' ? 'winter' THEN '["morning", "midday", "afternoon"]'::jsonb
    ELSE best_conditions->'time_of_day'
  END
)
WHERE best_conditions->'time_of_day' ? 'spring' 
   OR best_conditions->'time_of_day' ? 'summer'
   OR best_conditions->'time_of_day' ? 'fall'
   OR best_conditions->'time_of_day' ? 'winter';

-- ========================================
-- STEP 3: ADD COMPREHENSIVE CONDITIONS TO ALL FLIES
-- ========================================

-- Update all dry flies with comprehensive conditions
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
  '{time_of_day}', COALESCE(best_conditions->'time_of_day', '["morning", "afternoon", "dusk"]'::jsonb)
)
WHERE type = 'dry' AND best_conditions->'time_of_day' IS NOT NULL;

-- Update all nymphs with comprehensive conditions
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
  '{time_of_day}', COALESCE(best_conditions->'time_of_day', '["morning", "midday", "afternoon"]'::jsonb)
)
WHERE type = 'nymph' AND best_conditions->'time_of_day' IS NOT NULL;

-- Update all streamers with comprehensive conditions
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
  '{time_of_day}', COALESCE(best_conditions->'time_of_day', '["morning", "midday", "afternoon", "dusk"]'::jsonb)
)
WHERE type = 'streamer' AND best_conditions->'time_of_day' IS NOT NULL;

-- Update all terrestrials with comprehensive conditions
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
  '{time_of_day}', COALESCE(best_conditions->'time_of_day', '["midday", "afternoon"]'::jsonb)
)
WHERE type = 'terrestrial' AND best_conditions->'time_of_day' IS NOT NULL;

-- Update all wet flies with comprehensive conditions
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
                '{wind_conditions}', '["calm", "light", "moderate"]'::jsonb
              ),
              '{light_conditions}', '["overcast", "low_light"]'::jsonb
            ),
            '{air_temperature_range}', '{"min": 45, "max": 80}'::jsonb
          ),
          '{water_clarity}', '["clear", "slightly_murky", "murky"]'::jsonb
        ),
        '{water_level}', '["normal", "high"]'::jsonb
      ),
      '{time_of_year}', '["spring", "summer", "fall"]'::jsonb
    ),
    '{water_temperature_range}', '{"min": 40, "max": 70}'::jsonb
  ),
  '{time_of_day}', COALESCE(best_conditions->'time_of_day', '["morning", "afternoon", "dusk"]'::jsonb)
)
WHERE type = 'wet' AND best_conditions->'time_of_day' IS NOT NULL;

-- Update all attractor flies with comprehensive conditions
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
                  '{water_flow}', '["fast", "moderate"]'::jsonb
                ),
                '{wind_conditions}', '["calm", "light", "moderate", "strong"]'::jsonb
              ),
              '{light_conditions}', '["bright", "overcast"]'::jsonb
            ),
            '{air_temperature_range}', '{"min": 50, "max": 90}'::jsonb
          ),
          '{water_clarity}', '["clear", "slightly_murky", "murky"]'::jsonb
        ),
        '{water_level}', '["normal", "high"]'::jsonb
      ),
      '{time_of_year}', '["spring", "summer", "fall"]'::jsonb
    ),
    '{water_temperature_range}', '{"min": 45, "max": 75}'::jsonb
  ),
  '{time_of_day}', COALESCE(best_conditions->'time_of_day', '["morning", "midday", "afternoon"]'::jsonb)
)
WHERE type = 'attractor' AND best_conditions->'time_of_day' IS NOT NULL;

-- ========================================
-- STEP 4: ADD COMPREHENSIVE ATTRIBUTES TO ALL FLIES
-- ========================================

-- Add comprehensive attributes to all flies based on their type and characteristics
UPDATE flies 
SET 
  -- Add pattern names (alternative names)
  pattern_name = CASE 
    WHEN name = 'Adams' THEN 'Parachute Adams'
    WHEN name = 'Elk Hair Caddis' THEN 'X-Caddis'
    WHEN name = 'Chubby Chernobyl' THEN 'Chubby'
    WHEN name = 'Pheasant Tail Nymph' THEN 'PT Nymph'
    WHEN name = 'Woolly Bugger' THEN 'Bugger'
    WHEN name = 'Morrish Mouse' THEN 'Mouse Pattern'
    WHEN name = 'San Juan Worm' THEN 'SJW'
    WHEN name = 'Griffiths Gnat' THEN 'Midge Cluster'
    WHEN name = 'Royal Wulff' THEN 'Royal Wulff'
    WHEN name = 'Stimulator' THEN 'Stimmy'
    ELSE name
  END,
  
  -- Add sizes available
  sizes_available = CASE 
    WHEN type = 'dry' THEN ARRAY['12', '14', '16', '18', '20', '22']
    WHEN type = 'nymph' THEN ARRAY['12', '14', '16', '18', '20', '22']
    WHEN type = 'streamer' THEN ARRAY['4', '6', '8', '10', '12']
    WHEN type = 'terrestrial' THEN ARRAY['6', '8', '10', '12', '14']
    WHEN type = 'wet' THEN ARRAY['12', '14', '16', '18', '20']
    WHEN type = 'attractor' THEN ARRAY['8', '10', '12', '14', '16']
    ELSE ARRAY['12', '14', '16', '18']
  END,
  
  -- Add secondary colors
  secondary_colors = CASE 
    WHEN color = 'Gray' THEN ARRAY['Light Gray', 'Dark Gray']
    WHEN color = 'Brown' THEN ARRAY['Olive', 'Black', 'Natural']
    WHEN color = 'Black' THEN ARRAY['Red', 'Olive', 'Purple']
    WHEN color = 'Olive' THEN ARRAY['Brown', 'Black', 'Tan']
    WHEN color = 'Yellow' THEN ARRAY['Orange', 'Pink', 'White']
    WHEN color = 'Red' THEN ARRAY['Pink', 'Orange', 'Brown']
    WHEN color = 'White' THEN ARRAY['Yellow', 'Gray', 'Natural']
    ELSE ARRAY[color]
  END,
  
  -- Add descriptions
  description = CASE 
    WHEN type = 'dry' THEN 'Dry fly pattern for surface fishing. Excellent floatability and visibility.'
    WHEN type = 'nymph' THEN 'Nymph pattern for subsurface fishing. Imitates aquatic insects in their larval stage.'
    WHEN type = 'streamer' THEN 'Streamer pattern for aggressive fishing. Imitates baitfish and larger prey.'
    WHEN type = 'terrestrial' THEN 'Terrestrial pattern for land-based insects. Works great during insect falls.'
    WHEN type = 'wet' THEN 'Traditional wet fly pattern. Excellent for swinging and dead drifting.'
    WHEN type = 'attractor' THEN 'High-visibility attractor pattern. Great for search fishing and rough water.'
    ELSE 'Effective fly pattern for various fishing conditions.'
  END,
  
  -- Add regional effectiveness
  regional_effectiveness = CASE 
    WHEN type = 'dry' THEN '{"regions": ["western", "eastern", "mountain", "midwest"], "primary_regions": ["western", "mountain"], "seasonal_patterns": {"western": ["spring", "summer", "fall"], "eastern": ["spring", "summer", "fall"], "mountain": ["spring", "summer", "fall"]}}'::jsonb
    WHEN type = 'nymph' THEN '{"regions": ["western", "eastern", "mountain", "midwest", "southern"], "primary_regions": ["western", "eastern", "mountain"], "seasonal_patterns": {"western": ["spring", "summer", "fall", "winter"], "eastern": ["spring", "summer", "fall", "winter"], "mountain": ["spring", "summer", "fall", "winter"]}}'::jsonb
    WHEN type = 'streamer' THEN '{"regions": ["western", "eastern", "mountain", "midwest", "southern"], "primary_regions": ["western", "eastern", "mountain"], "seasonal_patterns": {"western": ["spring", "summer", "fall", "winter"], "eastern": ["spring", "summer", "fall", "winter"], "mountain": ["spring", "summer", "fall", "winter"]}}'::jsonb
    WHEN type = 'terrestrial' THEN '{"regions": ["western", "mountain", "midwest"], "primary_regions": ["western", "mountain"], "seasonal_patterns": {"western": ["summer", "fall"], "mountain": ["summer", "fall"]}}'::jsonb
    WHEN type = 'wet' THEN '{"regions": ["western", "eastern", "mountain"], "primary_regions": ["western", "eastern"], "seasonal_patterns": {"western": ["spring", "summer", "fall"], "eastern": ["spring", "summer", "fall"]}}'::jsonb
    WHEN type = 'attractor' THEN '{"regions": ["western", "eastern", "mountain", "midwest"], "primary_regions": ["western", "eastern"], "seasonal_patterns": {"western": ["spring", "summer", "fall"], "eastern": ["spring", "summer", "fall"]}}'::jsonb
    ELSE '{"regions": ["western", "eastern", "mountain"], "primary_regions": ["western"], "seasonal_patterns": {"western": ["spring", "summer", "fall"]}}'::jsonb
  END,
  
  -- Add target species
  target_species = CASE 
    WHEN type = 'streamer' THEN '{"primary": ["trout"], "secondary": ["bass", "pike", "grayling"], "size_preference": "large"}'::jsonb
    WHEN type = 'terrestrial' THEN '{"primary": ["trout"], "secondary": ["bass", "panfish"], "size_preference": "medium"}'::jsonb
    WHEN type = 'attractor' THEN '{"primary": ["trout"], "secondary": ["grayling", "bass"], "size_preference": "large"}'::jsonb
    ELSE '{"primary": ["trout"], "secondary": ["grayling", "char"], "size_preference": "medium"}'::jsonb
  END,
  
  -- Add hatch matching
  hatch_matching = CASE 
    WHEN type = 'dry' THEN '{"insects": ["mayfly", "caddis", "midge"], "stages": ["dun", "spinner", "adult"], "sizes": ["14", "16", "18", "20"]}'::jsonb
    WHEN type = 'nymph' THEN '{"insects": ["mayfly", "caddis", "stonefly", "midge"], "stages": ["nymph", "larva"], "sizes": ["12", "14", "16", "18"]}'::jsonb
    WHEN type = 'streamer' THEN '{"insects": ["baitfish", "leech", "crayfish"], "stages": ["adult"], "sizes": ["4", "6", "8", "10"]}'::jsonb
    WHEN type = 'terrestrial' THEN '{"insects": ["grasshopper", "ant", "beetle"], "stages": ["adult"], "sizes": ["8", "10", "12", "14"]}'::jsonb
    WHEN type = 'wet' THEN '{"insects": ["mayfly", "caddis", "emerger"], "stages": ["emerger", "wet"], "sizes": ["12", "14", "16", "18"]}'::jsonb
    WHEN type = 'attractor' THEN '{"insects": ["attractor", "mayfly"], "stages": ["adult", "attractor"], "sizes": ["8", "10", "12", "14"]}'::jsonb
    ELSE '{"insects": ["general"], "stages": ["adult"], "sizes": ["14", "16", "18"]}'::jsonb
  END,
  
  -- Add characteristics
  characteristics = CASE 
    WHEN type = 'dry' THEN '{"floatability": "high", "visibility": "high", "durability": "medium", "versatility": "high"}'::jsonb
    WHEN type = 'nymph' THEN '{"sink_rate": "medium", "visibility": "medium", "durability": "high", "versatility": "high"}'::jsonb
    WHEN type = 'streamer' THEN '{"sink_rate": "fast", "visibility": "high", "durability": "high", "versatility": "high"}'::jsonb
    WHEN type = 'terrestrial' THEN '{"floatability": "high", "visibility": "high", "durability": "high", "versatility": "medium"}'::jsonb
    WHEN type = 'wet' THEN '{"sink_rate": "medium", "visibility": "medium", "durability": "medium", "versatility": "high"}'::jsonb
    WHEN type = 'attractor' THEN '{"floatability": "high", "visibility": "high", "durability": "high", "versatility": "high"}'::jsonb
    ELSE '{"visibility": "medium", "durability": "medium", "versatility": "medium"}'::jsonb
  END,
  
  -- Add difficulty levels
  difficulty_level = CASE 
    WHEN type = 'streamer' AND (name LIKE '%Mouse%' OR name LIKE '%Sculpin%') THEN 'advanced'
    WHEN type = 'dry' AND (name LIKE '%Griffiths%' OR name LIKE '%Blue Winged%') THEN 'intermediate'
    WHEN type = 'nymph' AND (name LIKE '%Zebra%' OR name LIKE '%Midge%') THEN 'intermediate'
    ELSE 'beginner'
  END,
  
  -- Add tying difficulty
  tying_difficulty = CASE 
    WHEN type = 'streamer' AND (name LIKE '%Mouse%' OR name LIKE '%Sculpin%') THEN 'hard'
    WHEN type = 'dry' AND (name LIKE '%Griffiths%' OR name LIKE '%Blue Winged%') THEN 'medium'
    WHEN type = 'nymph' AND (name LIKE '%Zebra%' OR name LIKE '%Midge%') THEN 'medium'
    ELSE 'easy'
  END

WHERE best_conditions->'time_of_day' IS NOT NULL;

-- ========================================
-- STEP 5: UPDATE CONFIDENCE SCORES
-- ========================================

UPDATE flies SET confidence_score = 
  CASE 
    WHEN success_rate > 0.8 THEN 95
    WHEN success_rate > 0.7 THEN 85
    WHEN success_rate > 0.6 THEN 75
    WHEN success_rate > 0.5 THEN 65
    ELSE 55
  END
WHERE confidence_score IS NULL;

-- ========================================
-- STEP 6: CREATE INDEXES FOR BETTER PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_flies_type ON flies(type);
CREATE INDEX IF NOT EXISTS idx_flies_size ON flies(size);
CREATE INDEX IF NOT EXISTS idx_flies_color ON flies(color);
CREATE INDEX IF NOT EXISTS idx_flies_success_rate ON flies(success_rate);
CREATE INDEX IF NOT EXISTS idx_flies_regional_effectiveness ON flies USING GIN(regional_effectiveness);
CREATE INDEX IF NOT EXISTS idx_flies_hatch_matching ON flies USING GIN(hatch_matching);
CREATE INDEX IF NOT EXISTS idx_flies_best_conditions ON flies USING GIN(best_conditions);

-- ========================================
-- STEP 7: VERIFY THE ENHANCEMENT
-- ========================================

-- Show summary of the enhanced database
SELECT 
  COUNT(*) as total_flies,
  COUNT(DISTINCT type) as fly_types,
  COUNT(DISTINCT size) as size_variations,
  COUNT(DISTINCT color) as color_variations,
  COUNT(CASE WHEN best_conditions ? 'water_flow' THEN 1 END) as with_water_flow,
  COUNT(CASE WHEN best_conditions ? 'wind_conditions' THEN 1 END) as with_wind_conditions,
  COUNT(CASE WHEN best_conditions ? 'light_conditions' THEN 1 END) as with_light_conditions,
  COUNT(CASE WHEN regional_effectiveness IS NOT NULL THEN 1 END) as with_regional_data,
  COUNT(CASE WHEN target_species IS NOT NULL THEN 1 END) as with_target_species,
  COUNT(CASE WHEN hatch_matching IS NOT NULL THEN 1 END) as with_hatch_data,
  COUNT(CASE WHEN characteristics IS NOT NULL THEN 1 END) as with_characteristics
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
LIMIT 15;

-- Check for any remaining flies with corrupted time_of_day data
SELECT name, best_conditions->'time_of_day' as time_of_day
FROM flies 
WHERE best_conditions->'time_of_day' ? 'spring' 
   OR best_conditions->'time_of_day' ? 'summer'
   OR best_conditions->'time_of_day' ? 'fall'
   OR best_conditions->'time_of_day' ? 'winter';

-- Show flies by type with their new attributes
SELECT 
  type,
  name,
  sizes_available,
  secondary_colors,
  difficulty_level,
  tying_difficulty
FROM flies 
ORDER BY type, name
LIMIT 20;

COMMIT;
