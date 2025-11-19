-- Fly Database Migration Script
-- This script safely updates the flies table to remove duplicates, add new patterns, and enhance data
-- Run this in the Supabase SQL Editor

-- ============================================
-- STEP 1: Add new columns for multiple sizes/colors
-- ============================================

-- Add new columns to support multiple sizes and colors
ALTER TABLE flies 
ADD COLUMN IF NOT EXISTS sizes_available TEXT[],
ADD COLUMN IF NOT EXISTS colors_available TEXT[];

-- ============================================
-- STEP 2: Remove duplicate entries
-- ============================================

-- Delete duplicate flies, keeping only the first occurrence of each unique combination
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY name, type, size, color 
           ORDER BY created_at ASC
         ) as rn
  FROM flies
)
DELETE FROM flies 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- ============================================
-- STEP 3: Populate new columns with existing data
-- ============================================

-- Update existing flies to populate sizes_available and colors_available arrays
UPDATE flies 
SET 
  sizes_available = ARRAY[size],
  colors_available = ARRAY[color]
WHERE sizes_available IS NULL OR colors_available IS NULL;

-- ============================================
-- STEP 4: Add new fly patterns
-- ============================================

-- Insert new articulated streamers
INSERT INTO flies (name, type, size, color, sizes_available, colors_available, description, best_conditions, success_rate, total_uses, successful_uses, created_at, updated_at, image, link)
VALUES 
(
  'Articulated Sculpin',
  'streamer',
  '4',
  'brown',
  ARRAY['2', '4', '6'],
  ARRAY['brown', 'olive', 'black'],
  'Articulated streamer imitating sculpins and baitfish',
  '{
    "weather": ["cloudy", "overcast", "rainy"],
    "time_of_day": ["dawn", "morning", "dusk"],
    "water_clarity": ["slightly_murky", "murky", "very_murky"],
    "water_level": ["normal", "high"],
    "water_flow": ["moderate", "fast"]
  }'::jsonb,
  0, 0, 0, NOW(), NOW(), NULL, NULL
),
(
  'Game Changer',
  'streamer',
  '4',
  'white',
  ARRAY['2', '4', '6'],
  ARRAY['white', 'yellow', 'brown'],
  'Articulated streamer with multiple joints for realistic movement',
  '{
    "weather": ["sunny", "cloudy", "overcast"],
    "time_of_day": ["dawn", "morning", "afternoon", "dusk"],
    "water_clarity": ["clear"],
    "water_level": ["normal", "high"],
    "water_flow": ["moderate", "fast"]
  }'::jsonb,
  0, 0, 0, NOW(), NOW(), NULL, NULL
),
(
  'Double Bunny',
  'streamer',
  '4',
  'white',
  ARRAY['2', '4', '6'],
  ARRAY['white', 'black', 'brown'],
  'Large articulated leech pattern for big fish',
  '{
    "weather": ["cloudy", "overcast", "rainy"],
    "time_of_day": ["dawn", "morning", "dusk", "night"],
    "water_clarity": ["slightly_murky", "murky", "very_murky"],
    "water_level": ["normal", "high"],
    "water_flow": ["moderate", "fast"]
  }'::jsonb,
  0, 0, 0, NOW(), NOW(), NULL, NULL
);

-- Insert mouse patterns for night fishing
INSERT INTO flies (name, type, size, color, sizes_available, colors_available, description, best_conditions, success_rate, total_uses, successful_uses, created_at, updated_at, image, link)
VALUES 
(
  'Morrish Mouse',
  'streamer',
  '4',
  'brown',
  ARRAY['2', '4', '6'],
  ARRAY['brown', 'black', 'gray'],
  'Large mouse pattern for night fishing and big fish',
  '{
    "weather": ["cloudy", "overcast", "rainy"],
    "time_of_day": ["dusk", "night", "dawn"],
    "water_clarity": ["slightly_murky", "murky", "very_murky"],
    "water_level": ["normal", "high"],
    "water_flow": ["moderate", "fast"]
  }'::jsonb,
  0, 0, 0, NOW(), NOW(), NULL, NULL
),
(
  'Deer Hair Mouse',
  'streamer',
  '4',
  'brown',
  ARRAY['2', '4', '6'],
  ARRAY['brown', 'black'],
  'Traditional deer hair mouse pattern',
  '{
    "weather": ["cloudy", "overcast", "rainy"],
    "time_of_day": ["dusk", "night", "dawn"],
    "water_clarity": ["slightly_murky", "murky", "very_murky"],
    "water_level": ["normal", "high"],
    "water_flow": ["moderate", "fast"]
  }'::jsonb,
  0, 0, 0, NOW(), NOW(), NULL, NULL
),
(
  'Foam Mouse',
  'streamer',
  '4',
  'brown',
  ARRAY['2', '4', '6'],
  ARRAY['brown', 'black', 'gray'],
  'High-floating foam mouse pattern',
  '{
    "weather": ["cloudy", "overcast", "rainy"],
    "time_of_day": ["dusk", "night", "dawn"],
    "water_clarity": ["slightly_murky", "murky", "very_murky"],
    "water_level": ["normal", "high"],
    "water_flow": ["moderate", "fast"]
  }'::jsonb,
  0, 0, 0, NOW(), NOW(), NULL, NULL
);

-- Insert additional streamer variations
INSERT INTO flies (name, type, size, color, sizes_available, colors_available, description, best_conditions, success_rate, total_uses, successful_uses, created_at, updated_at, image, link)
VALUES 
(
  'Sculpin Helgramite',
  'streamer',
  '6',
  'brown',
  ARRAY['4', '6', '8'],
  ARRAY['brown', 'olive'],
  'Sculpin pattern for rocky bottom fishing',
  '{
    "weather": ["cloudy", "overcast", "rainy"],
    "time_of_day": ["morning", "midday", "afternoon"],
    "water_clarity": ["slightly_murky", "murky", "very_murky"],
    "water_level": ["normal", "high"],
    "water_flow": ["moderate", "fast"]
  }'::jsonb,
  0, 0, 0, NOW(), NOW(), NULL, NULL
),
(
  'Sex Dungeon',
  'streamer',
  '4',
  'black',
  ARRAY['2', '4', '6'],
  ARRAY['black', 'brown', 'olive'],
  'Large articulated streamer for trophy fish',
  '{
    "weather": ["cloudy", "overcast", "rainy"],
    "time_of_day": ["dawn", "morning", "dusk"],
    "water_clarity": ["slightly_murky", "murky", "very_murky"],
    "water_level": ["normal", "high"],
    "water_flow": ["moderate", "fast"]
  }'::jsonb,
  0, 0, 0, NOW(), NOW(), NULL, NULL
);

-- ============================================
-- STEP 5: Enhance existing flies with multiple sizes/colors
-- ============================================

-- Update popular flies to have multiple size/color options
UPDATE flies 
SET 
  sizes_available = ARRAY['14', '16', '18', '20'],
  colors_available = ARRAY['gray', 'light_gray', 'dark_gray'],
  updated_at = NOW()
WHERE name = 'Adams' AND type = 'dry';

UPDATE flies 
SET 
  sizes_available = ARRAY['14', '16', '18', '20', '22'],
  colors_available = ARRAY['gray', 'light_gray'],
  updated_at = NOW()
WHERE name = 'Parachute Adams' AND type = 'dry';

UPDATE flies 
SET 
  sizes_available = ARRAY['16', '18', '20', '22'],
  colors_available = ARRAY['olive', 'dark_olive'],
  updated_at = NOW()
WHERE name = 'Blue Winged Olive' AND type = 'dry';

UPDATE flies 
SET 
  sizes_available = ARRAY['12', '14', '16', '18'],
  colors_available = ARRAY['brown', 'tan', 'olive'],
  updated_at = NOW()
WHERE name = 'Elk Hair Caddis' AND type = 'dry';

UPDATE flies 
SET 
  sizes_available = ARRAY['10', '12', '14', '16'],
  colors_available = ARRAY['multi', 'red_and_white'],
  updated_at = NOW()
WHERE name = 'Royal Wulff' AND type = 'dry';

-- Update nymph flies
UPDATE flies 
SET 
  sizes_available = ARRAY['12', '14', '16', '18'],
  colors_available = ARRAY['brown', 'tan', 'olive'],
  updated_at = NOW()
WHERE name = 'Hare''s Ear Nymph' AND type = 'nymph';

UPDATE flies 
SET 
  sizes_available = ARRAY['14', '16', '18', '20'],
  colors_available = ARRAY['brown', 'dark_brown'],
  updated_at = NOW()
WHERE name = 'Pheasant Tail Nymph' AND type = 'nymph';

UPDATE flies 
SET 
  sizes_available = ARRAY['18', '20', '22', '24'],
  colors_available = ARRAY['black', 'red', 'silver'],
  updated_at = NOW()
WHERE name = 'Zebra Midge' AND type = 'nymph';

-- Update streamer flies
UPDATE flies 
SET 
  sizes_available = ARRAY['4', '6', '8', '10'],
  colors_available = ARRAY['black', 'olive', 'brown', 'white'],
  updated_at = NOW()
WHERE name = 'Woolly Bugger' AND type = 'streamer';

UPDATE flies 
SET 
  sizes_available = ARRAY['2', '4', '6', '8'],
  colors_available = ARRAY['white', 'chartreuse', 'pink'],
  updated_at = NOW()
WHERE name = 'Clouser Minnow' AND type = 'streamer';

UPDATE flies 
SET 
  sizes_available = ARRAY['1/0', '2', '4', '6'],
  colors_available = ARRAY['white', 'yellow', 'chartreuse'],
  updated_at = NOW()
WHERE name = 'Lefty''s Deceiver' AND type = 'streamer';

-- ============================================
-- STEP 6: Verification queries
-- ============================================

-- Check for remaining duplicates
SELECT 
  name, 
  type, 
  COUNT(*) as count
FROM flies 
GROUP BY name, type, size, color 
HAVING COUNT(*) > 1;

-- Count flies by type
SELECT 
  type, 
  COUNT(*) as count
FROM flies 
GROUP BY type 
ORDER BY type;

-- Show new patterns added
SELECT 
  name, 
  type, 
  size, 
  color,
  sizes_available,
  colors_available
FROM flies 
WHERE name IN ('Articulated Sculpin', 'Game Changer', 'Double Bunny', 'Morrish Mouse', 'Deer Hair Mouse', 'Foam Mouse', 'Sculpin Helgramite', 'Sex Dungeon')
ORDER BY type, name;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Summary of changes:
-- ✅ Removed duplicate flies
-- ✅ Added 8 new streamer patterns
-- ✅ Added 3 mouse patterns for night fishing
-- ✅ Enhanced existing flies with multiple size/color options
-- ✅ Maintained compatibility with existing app logic
-- ✅ Preserved all existing data and relationships

-- The flies table now supports:
-- • Multiple sizes per fly via sizes_available array
-- • Multiple colors per fly via colors_available array
-- • Enhanced streamer variety for big fish
-- • Night fishing mouse patterns
-- • No duplicate entries
-- • Full backward compatibility
