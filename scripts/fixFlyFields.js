/**
 * Fix missing fields in existing flies
 * Updates: type, primary_size, color, best_conditions
 * Run with: node scripts/fixFlyFields.js
 */

try {
  require('dotenv').config();
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.warn('dotenv not installed; skipping automatic .env loading.');
  }
}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://aflfbalfpjhznkbwatqf.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4NzE3NywiZXhwIjoyMDcyODYzMTc3fQ.7qJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Fly type mapping based on name patterns
function inferType(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('nymph') || lowerName.includes('pupa') || lowerName.includes('larva')) {
    return 'nymph';
  }
  if (lowerName.includes('streamer') || lowerName.includes('woolly') || lowerName.includes('bugger') || lowerName.includes('mouse')) {
    return 'streamer';
  }
  if (lowerName.includes('terrestrial') || lowerName.includes('hopper') || lowerName.includes('ant') || lowerName.includes('beetle')) {
    return 'terrestrial';
  }
  if (lowerName.includes('wet') || lowerName.includes('soft hackle')) {
    return 'wet';
  }
  // Default to dry for most flies
  return 'dry';
}

// Default best_conditions based on type
function getDefaultBestConditions(type) {
  const base = {
    weather: ['sunny', 'cloudy', 'overcast'],
    water_clarity: ['clear', 'slightly_murky'],
    water_level: ['normal'],
    water_flow: ['moderate', 'slow'],
    time_of_day: ['morning', 'afternoon'],
    time_of_year: ['spring', 'summer', 'fall'],
    wind_conditions: ['calm', 'light'],
    light_conditions: ['bright', 'overcast']
  };

  if (type === 'dry') {
    return {
      ...base,
      water_temperature_range: { min: 50, max: 75 },
      air_temperature_range: { min: 55, max: 85 }
    };
  }
  if (type === 'nymph') {
    return {
      ...base,
      weather: ['sunny', 'cloudy', 'overcast', 'rainy'],
      water_temperature_range: { min: 40, max: 70 },
      air_temperature_range: { min: 45, max: 80 }
    };
  }
  if (type === 'streamer') {
    return {
      ...base,
      weather: ['cloudy', 'overcast'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 45, max: 70 },
      air_temperature_range: { min: 50, max: 80 }
    };
  }
  if (type === 'terrestrial') {
    return {
      ...base,
      weather: ['sunny', 'cloudy'],
      time_of_day: ['midday', 'afternoon'],
      time_of_year: ['summer', 'fall'],
      water_temperature_range: { min: 60, max: 80 },
      air_temperature_range: { min: 70, max: 95 }
    };
  }
  
  return {
    ...base,
    water_temperature_range: { min: 50, max: 70 },
    air_temperature_range: { min: 55, max: 80 }
  };
}

async function fixFlyFields() {
  console.log('🔧 FIXING MISSING FLY FIELDS');
  console.log('============================\n');

  try {
    // Get all flies
    const { data: flies, error: fetchError } = await supabase
      .from('flies')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching flies:', fetchError);
      return;
    }

    console.log(`📊 Found ${flies.length} flies to check\n`);

    let updated = 0;
    let skipped = 0;

    for (const fly of flies) {
      const updates = {};
      let needsUpdate = false;

      // Fix type
      if (!fly.type) {
        updates.type = inferType(fly.name);
        needsUpdate = true;
        console.log(`  ${fly.name}: Setting type to "${updates.type}"`);
      }

      // Fix primary_size
      if (!fly.primary_size && fly.size) {
        updates.primary_size = fly.size;
        needsUpdate = true;
      } else if (!fly.primary_size) {
        updates.primary_size = '16'; // Default size
        needsUpdate = true;
      }

      // Fix color
      if (!fly.color) {
        updates.color = 'Natural'; // Default color
        needsUpdate = true;
      }

      // Fix best_conditions
      if (!fly.best_conditions || Object.keys(fly.best_conditions).length === 0) {
        const type = updates.type || fly.type || inferType(fly.name);
        updates.best_conditions = getDefaultBestConditions(type);
        needsUpdate = true;
        console.log(`  ${fly.name}: Adding default best_conditions for type "${type}"`);
      }

      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('flies')
          .update(updates)
          .eq('id', fly.id);

        if (updateError) {
          console.error(`  ❌ Error updating ${fly.name}:`, updateError.message);
        } else {
          updated++;
        }
      } else {
        skipped++;
      }
    }

    console.log('\n✅ UPDATE COMPLETE');
    console.log('==================');
    console.log(`Updated: ${updated} flies`);
    console.log(`Skipped: ${skipped} flies (already had all fields)`);

    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const { data: verifyFlies, error: verifyError } = await supabase
      .from('flies')
      .select('id, name, type, primary_size, color')
      .limit(5);

    if (!verifyError && verifyFlies) {
      console.log('\nSample flies after update:');
      verifyFlies.forEach(fly => {
        console.log(`  ✅ ${fly.name}: type=${fly.type}, size=${fly.primary_size}, color=${fly.color}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixFlyFields();

