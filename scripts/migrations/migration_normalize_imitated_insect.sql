-- NORMALIZE IMITATED_INSECT DATA - Add new columns
-- Run this in Supabase SQL editor to add columns for imitated_insect data
-- 
-- This migration extracts data from the imitated_insect JSONB column
-- into separate columns for better data structure and querying.

-- ========================================
-- STEP 1: ADD NEW COLUMNS FOR INSECT DATA
-- ========================================

ALTER TABLE flies 
ADD COLUMN IF NOT EXISTS insect_order TEXT,  -- e.g., "Ephemeroptera", "Trichoptera"
ADD COLUMN IF NOT EXISTS insect_category TEXT,  -- e.g., "Nymph", "Dun", "Spinner"
ADD COLUMN IF NOT EXISTS insect_behavior TEXT,  -- e.g., "Sub-surface drift"
ADD COLUMN IF NOT EXISTS insect_size_min INTEGER,  -- Minimum size from sizeRange
ADD COLUMN IF NOT EXISTS insect_size_max INTEGER;  -- Maximum size from sizeRange

-- ========================================
-- STEP 2: EXTRACT DATA FROM IMITATED_INSECT JSONB
-- ========================================

-- Extract insect_order
UPDATE flies
SET insect_order = imitated_insect->>'insectOrder'
WHERE imitated_insect IS NOT NULL 
  AND imitated_insect->>'insectOrder' IS NOT NULL
  AND insect_order IS NULL;

-- Extract insect_category
UPDATE flies
SET insect_category = imitated_insect->>'category'
WHERE imitated_insect IS NOT NULL 
  AND imitated_insect->>'category' IS NOT NULL
  AND insect_category IS NULL;

-- Extract insect_behavior
UPDATE flies
SET insect_behavior = imitated_insect->>'behavior'
WHERE imitated_insect IS NOT NULL 
  AND imitated_insect->>'behavior' IS NOT NULL
  AND insect_behavior IS NULL;

-- Extract insect_size_min from sizeRange
UPDATE flies
SET insect_size_min = (imitated_insect->'sizeRange'->>'min')::INTEGER
WHERE imitated_insect IS NOT NULL 
  AND imitated_insect->'sizeRange'->>'min' IS NOT NULL
  AND insect_size_min IS NULL;

-- Extract insect_size_max from sizeRange
UPDATE flies
SET insect_size_max = (imitated_insect->'sizeRange'->>'max')::INTEGER
WHERE imitated_insect IS NOT NULL 
  AND imitated_insect->'sizeRange'->>'max' IS NOT NULL
  AND insect_size_max IS NULL;

-- ========================================
-- DATA MAPPING SUMMARY
-- ========================================
-- The following data has been/will be extracted to existing columns:
-- 
-- ✅ sizes → sizes_available (via normalizeImitatedInsectData.js)
-- ✅ primarySize → primary_size (via normalizeImitatedInsectData.js)
-- ✅ summary → description (via normalizeImitatedInsectData.js)
-- ✅ patternName → pattern_name (via normalizeImitatedInsectData.js)
-- ✅ colorPalette → secondary_colors (via normalizeImitatedInsectData.js)
-- ✅ imitates → hatch_matching.insects (via normalizeImitatedInsectData.js)
-- ✅ lifeStages → hatch_matching.stages (via normalizeImitatedInsectData.js)
-- ✅ hatchSeasons → best_conditions.time_of_year (via normalizeImitatedInsectData.js)
-- ✅ hatchTimes → best_conditions.time_of_day (via normalizeImitatedInsectData.js)
-- ✅ waterPreferences → best_conditions.water_flow (via normalizeImitatedInsectData.js)
-- ✅ weatherPreferences → best_conditions.weather (via normalizeImitatedInsectData.js)
-- 
-- ✅ insectOrder → insect_order (this migration)
-- ✅ category → insect_category (this migration)
-- ✅ behavior → insect_behavior (this migration)
-- ✅ sizeRange.min → insect_size_min (this migration)
-- ✅ sizeRange.max → insect_size_max (this migration)
