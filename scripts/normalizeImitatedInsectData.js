/**
 * Normalize imitated_insect JSONB data into separate columns
 * 
 * This script extracts data from the imitated_insect JSONB column
 * and populates separate columns for better data structure and querying.
 * 
 * Run with: node scripts/normalizeImitatedInsectData.js
 */

try {
  require('dotenv').config();
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.warn('dotenv not installed; skipping automatic .env loading.');
  }
}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://aflfbalfpjhznkbwatqf.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4NzE3NywiZXhwIjoyMDcyODYzMTc3fQ.7qJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function normalizeImitatedInsectData() {
  console.log('🔄 NORMALIZING IMITATED_INSECT DATA');
  console.log('===================================\n');

  try {
    // Step 1: Add new columns if they don't exist
    console.log('1️⃣ Adding new columns to flies table...');
    
    // Note: We'll use SQL directly for column creation
    // For now, we'll update existing columns and create a migration SQL file
    
    // Step 2: Get all flies with imitated_insect data
    console.log('2️⃣ Fetching flies with imitated_insect data...');
    const { data: flies, error: fetchError } = await supabase
      .from('flies')
      .select('id, name, imitated_insect, sizes_available, primary_size, description, pattern_name, secondary_colors, hatch_matching, best_conditions');

    if (fetchError) {
      console.error('❌ Error fetching flies:', fetchError);
      return;
    }

    console.log(`   Found ${flies.length} flies to process\n`);

    let updated = 0;
    let skipped = 0;

    // Step 3: Extract and normalize data for each fly
    for (const fly of flies) {
      if (!fly.imitated_insect || typeof fly.imitated_insect !== 'object') {
        skipped++;
        continue;
      }

      const insect = fly.imitated_insect;
      const updates = {};
      let hasUpdates = false;

      // Extract sizes → sizes_available
      if (insect.sizes && Array.isArray(insect.sizes) && (!fly.sizes_available || fly.sizes_available.length === 0)) {
        updates.sizes_available = insect.sizes;
        hasUpdates = true;
      }

      // Extract primarySize → primary_size
      if (insect.primarySize && !fly.primary_size) {
        updates.primary_size = insect.primarySize;
        hasUpdates = true;
      }

      // Extract summary → description
      if (insect.summary && !fly.description) {
        updates.description = insect.summary;
        hasUpdates = true;
      }

      // Extract patternName → pattern_name
      if (insect.patternName && !fly.pattern_name) {
        updates.pattern_name = insect.patternName;
        hasUpdates = true;
      }

      // Extract colorPalette → secondary_colors
      if (insect.colorPalette && Array.isArray(insect.colorPalette) && (!fly.secondary_colors || fly.secondary_colors.length === 0)) {
        updates.secondary_colors = insect.colorPalette;
        hasUpdates = true;
      }

      // Extract hatch matching data → hatch_matching
      if (insect.imitates || insect.lifeStages || insect.sizes) {
        const hatchMatching = fly.hatch_matching || {};
        let hatchUpdated = false;

        if (insect.imitates && Array.isArray(insect.imitates) && (!hatchMatching.insects || hatchMatching.insects.length === 0)) {
          hatchMatching.insects = insect.imitates.map(i => i.toLowerCase());
          hatchUpdated = true;
        }

        if (insect.lifeStages && Array.isArray(insect.lifeStages) && (!hatchMatching.stages || hatchMatching.stages.length === 0)) {
          hatchMatching.stages = insect.lifeStages.map(s => s.toLowerCase());
          hatchUpdated = true;
        }

        if (insect.sizes && Array.isArray(insect.sizes) && (!hatchMatching.sizes || hatchMatching.sizes.length === 0)) {
          hatchMatching.sizes = insect.sizes;
          hatchUpdated = true;
        }

        if (hatchUpdated) {
          updates.hatch_matching = hatchMatching;
          hasUpdates = true;
        }
      }

      // Extract hatch seasons → best_conditions.time_of_year
      if (insect.hatchSeasons && Array.isArray(insect.hatchSeasons)) {
        const bestConditions = fly.best_conditions || {};
        if (!bestConditions.time_of_year || bestConditions.time_of_year.length === 0) {
          bestConditions.time_of_year = insect.hatchSeasons.map(s => s.toLowerCase());
          updates.best_conditions = bestConditions;
          hasUpdates = true;
        }
      }

      // Extract hatch times → best_conditions.time_of_day
      if (insect.hatchTimes && Array.isArray(insect.hatchTimes)) {
        const bestConditions = fly.best_conditions || {};
        if (!bestConditions.time_of_day || bestConditions.time_of_day.length === 0) {
          // Convert hatch times to time_of_day format
          const timeOfDayMap = {
            'dawn': 'dawn',
            'morning': 'morning',
            'midday': 'midday',
            'afternoon': 'afternoon',
            'dusk': 'dusk',
            'night': 'night',
          };
          
          const timeOfDay = insect.hatchTimes
            .map(t => {
              const lower = t.toLowerCase();
              return timeOfDayMap[lower] || lower;
            })
            .filter(Boolean);
          
          if (timeOfDay.length > 0) {
            bestConditions.time_of_day = timeOfDay;
            updates.best_conditions = bestConditions;
            hasUpdates = true;
          }
        }
      }

      // Extract water preferences → best_conditions.water_flow
      if (insect.waterPreferences && Array.isArray(insect.waterPreferences)) {
        const bestConditions = fly.best_conditions || {};
        if (!bestConditions.water_flow || bestConditions.water_flow.length === 0) {
          bestConditions.water_flow = insect.waterPreferences.map(w => w.toLowerCase());
          updates.best_conditions = bestConditions;
          hasUpdates = true;
        }
      }

      // Extract weather preferences → best_conditions.weather
      if (insect.weatherPreferences && Array.isArray(insect.weatherPreferences)) {
        const bestConditions = fly.best_conditions || {};
        if (!bestConditions.weather || bestConditions.weather.length === 0) {
          const weatherMap = {
            'sunny': 'sunny',
            'cloudy': 'cloudy',
            'overcast': 'overcast',
            'rainy': 'rainy',
            'stormy': 'stormy',
          };
          
          const weather = insect.weatherPreferences
            .map(w => {
              const lower = w.toLowerCase();
              return weatherMap[lower] || lower;
            })
            .filter(Boolean);
          
          if (weather.length > 0) {
            bestConditions.weather = weather;
            updates.best_conditions = bestConditions;
            hasUpdates = true;
          }
        }
      }

      // Update the fly if there are changes
      if (hasUpdates) {
        const { error: updateError } = await supabase
          .from('flies')
          .update(updates)
          .eq('id', fly.id);

        if (updateError) {
          console.error(`   ❌ Error updating ${fly.name}:`, updateError.message);
        } else {
          updated++;
          console.log(`   ✅ Updated ${fly.name}`);
        }
      } else {
        skipped++;
      }
    }

    console.log('\n✅ NORMALIZATION COMPLETE');
    console.log('========================');
    console.log(`Updated: ${updated} flies`);
    console.log(`Skipped: ${skipped} flies (no changes needed or no imitated_insect data)`);

    // Step 4: Create SQL migration for new columns
    console.log('\n3️⃣ Creating SQL migration file for new columns...');
    const migrationSQL = `-- NORMALIZE IMITATED_INSECT DATA - Add new columns
-- Run this in Supabase SQL editor to add columns for imitated_insect data

-- Add columns for insect-specific data
ALTER TABLE flies 
ADD COLUMN IF NOT EXISTS insect_order TEXT,  -- e.g., "Ephemeroptera", "Trichoptera"
ADD COLUMN IF NOT EXISTS insect_category TEXT,  -- e.g., "Nymph", "Dun", "Spinner"
ADD COLUMN IF NOT EXISTS insect_behavior TEXT,  -- e.g., "Sub-surface drift"
ADD COLUMN IF NOT EXISTS insect_size_min INTEGER,  -- Minimum size from sizeRange
ADD COLUMN IF NOT EXISTS insect_size_max INTEGER;  -- Maximum size from sizeRange

-- Note: The following data is already extracted to existing columns:
-- - sizes → sizes_available
-- - primarySize → primary_size
-- - summary → description
-- - patternName → pattern_name
-- - colorPalette → secondary_colors
-- - imitates → hatch_matching.insects
-- - lifeStages → hatch_matching.stages
-- - hatchSeasons → best_conditions.time_of_year
-- - hatchTimes → best_conditions.time_of_day
-- - waterPreferences → best_conditions.water_flow
-- - weatherPreferences → best_conditions.weather
`;

    const fs = require('fs');
    fs.writeFileSync('scripts/migration_normalize_imitated_insect.sql', migrationSQL);
    console.log('   ✅ Created: scripts/migration_normalize_imitated_insect.sql');

    // Step 5: Extract remaining data to new columns
    console.log('\n4️⃣ Extracting remaining data to new columns...');
    let extracted = 0;

    for (const fly of flies) {
      if (!fly.imitated_insect || typeof fly.imitated_insect !== 'object') {
        continue;
      }

      const insect = fly.imitated_insect;
      const newColumnUpdates = {};

      if (insect.insectOrder) {
        newColumnUpdates.insect_order = insect.insectOrder;
      }

      if (insect.category) {
        newColumnUpdates.insect_category = insect.category;
      }

      if (insect.behavior) {
        newColumnUpdates.insect_behavior = insect.behavior;
      }

      if (insect.sizeRange) {
        if (insect.sizeRange.min) {
          newColumnUpdates.insect_size_min = insect.sizeRange.min;
        }
        if (insect.sizeRange.max) {
          newColumnUpdates.insect_size_max = insect.sizeRange.max;
        }
      }

      if (Object.keys(newColumnUpdates).length > 0) {
        // Try to update (will fail if columns don't exist yet, that's okay)
        const { error } = await supabase
          .from('flies')
          .update(newColumnUpdates)
          .eq('id', fly.id);

        if (!error) {
          extracted++;
        }
      }
    }

    console.log(`   ✅ Extracted data for ${extracted} flies (columns may need to be created first)`);

    console.log('\n📋 NEXT STEPS:');
    console.log('1. Run the SQL migration in Supabase SQL editor:');
    console.log('   scripts/migration_normalize_imitated_insect.sql');
    console.log('2. Then run this script again to populate the new columns');
    console.log('3. Update TypeScript types to include new columns');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

normalizeImitatedInsectData();

