const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://aflfbalfpjhznkbwatqf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY');

// Enhanced conditions for different fly types and patterns
const enhancedConditions = {
  // Dry flies
  'Adams': {
    weather: ['sunny', 'cloudy', 'overcast'],
    water_clarity: ['clear', 'slightly_murky'],
    water_level: ['normal', 'low'],
    water_flow: ['moderate', 'slow'],
    time_of_day: ['morning', 'afternoon', 'dusk'],
    time_of_year: ['spring', 'summer', 'fall'],
    water_temperature_range: { min: 45, max: 70 },
    air_temperature_range: { min: 50, max: 80 },
    wind_conditions: ['calm', 'light'],
    light_conditions: ['bright', 'overcast']
  },
  
  'Parachute Adams': {
    weather: ['sunny', 'cloudy', 'overcast'],
    water_clarity: ['clear', 'slightly_murky'],
    water_level: ['normal', 'low'],
    water_flow: ['moderate', 'slow'],
    time_of_day: ['morning', 'afternoon', 'dusk'],
    time_of_year: ['spring', 'summer', 'fall'],
    water_temperature_range: { min: 45, max: 70 },
    air_temperature_range: { min: 50, max: 80 },
    wind_conditions: ['calm', 'light'],
    light_conditions: ['bright', 'overcast']
  },

  'Royal Wulff': {
    weather: ['sunny', 'cloudy', 'overcast'],
    water_clarity: ['clear', 'slightly_murky', 'murky'],
    water_level: ['normal', 'high'],
    water_flow: ['fast', 'moderate'],
    time_of_day: ['morning', 'midday', 'afternoon'],
    time_of_year: ['spring', 'summer', 'fall'],
    water_temperature_range: { min: 45, max: 75 },
    air_temperature_range: { min: 50, max: 85 },
    wind_conditions: ['calm', 'light', 'moderate'],
    light_conditions: ['bright', 'overcast']
  },

  'Light Cahill': {
    weather: ['sunny', 'cloudy', 'overcast'],
    water_clarity: ['clear', 'slightly_murky'],
    water_level: ['normal', 'low'],
    water_flow: ['moderate', 'slow'],
    time_of_day: ['morning', 'afternoon', 'dusk'],
    time_of_year: ['spring', 'summer', 'fall'],
    water_temperature_range: { min: 50, max: 75 },
    air_temperature_range: { min: 55, max: 85 },
    wind_conditions: ['calm', 'light'],
    light_conditions: ['bright', 'overcast']
  },

  // Nymphs
  'Hare\'s Ear Nymph': {
    weather: ['cloudy', 'overcast', 'rainy', 'sunny'],
    water_clarity: ['clear', 'slightly_murky', 'murky'],
    water_level: ['normal', 'high', 'low'],
    water_flow: ['moderate', 'fast', 'slow'],
    time_of_day: ['morning', 'midday', 'afternoon'],
    time_of_year: ['spring', 'summer', 'fall', 'winter'],
    water_temperature_range: { min: 40, max: 70 },
    air_temperature_range: { min: 45, max: 85 },
    wind_conditions: ['calm', 'light', 'moderate', 'strong'],
    light_conditions: ['bright', 'overcast', 'low_light']
  },

  'Pheasant Tail Nymph': {
    weather: ['cloudy', 'overcast', 'rainy', 'sunny'],
    water_clarity: ['clear', 'slightly_murky', 'murky'],
    water_level: ['normal', 'high', 'low'],
    water_flow: ['moderate', 'fast', 'slow'],
    time_of_day: ['morning', 'midday', 'afternoon'],
    time_of_year: ['spring', 'summer', 'fall', 'winter'],
    water_temperature_range: { min: 35, max: 70 },
    air_temperature_range: { min: 40, max: 85 },
    wind_conditions: ['calm', 'light', 'moderate', 'strong'],
    light_conditions: ['bright', 'overcast', 'low_light']
  },

  // Streamers
  'Woolly Bugger': {
    weather: ['sunny', 'cloudy', 'overcast', 'rainy'],
    water_clarity: ['clear', 'slightly_murky', 'murky'],
    water_level: ['normal', 'high', 'low'],
    water_flow: ['moderate', 'fast', 'slow'],
    time_of_day: ['morning', 'midday', 'afternoon', 'dusk'],
    time_of_year: ['spring', 'summer', 'fall', 'winter'],
    water_temperature_range: { min: 40, max: 75 },
    air_temperature_range: { min: 45, max: 90 },
    wind_conditions: ['calm', 'light', 'moderate', 'strong'],
    light_conditions: ['bright', 'overcast', 'low_light']
  },

  'Chubby Chernobyl': {
    weather: ['sunny', 'cloudy'],
    water_clarity: ['clear', 'slightly_murky', 'murky'],
    water_level: ['normal', 'high'],
    water_flow: ['fast', 'moderate'],
    time_of_day: ['morning', 'afternoon'],
    time_of_year: ['summer', 'fall'],
    water_temperature_range: { min: 50, max: 80 },
    air_temperature_range: { min: 60, max: 95 },
    wind_conditions: ['light', 'moderate'],
    light_conditions: ['bright']
  },

  'Elk Hair Caddis': {
    weather: ['sunny', 'cloudy', 'overcast', 'rainy'],
    water_clarity: ['clear', 'slightly_murky', 'murky'],
    water_level: ['normal', 'high'],
    water_flow: ['moderate', 'fast', 'slow'],
    time_of_day: ['morning', 'afternoon', 'dusk'],
    time_of_year: ['spring', 'summer', 'fall'],
    water_temperature_range: { min: 50, max: 75 },
    air_temperature_range: { min: 55, max: 85 },
    wind_conditions: ['calm', 'light', 'moderate'],
    light_conditions: ['bright', 'overcast', 'low_light']
  }
};

// Generic conditions for fly types
const genericConditions = {
  'dry': {
    weather: ['sunny', 'cloudy', 'overcast'],
    water_clarity: ['clear', 'slightly_murky'],
    water_level: ['normal', 'low'],
    water_flow: ['moderate', 'slow'],
    time_of_day: ['morning', 'afternoon', 'dusk'],
    time_of_year: ['spring', 'summer', 'fall'],
    water_temperature_range: { min: 45, max: 75 },
    air_temperature_range: { min: 50, max: 85 },
    wind_conditions: ['calm', 'light'],
    light_conditions: ['bright', 'overcast']
  },
  
  'nymph': {
    weather: ['cloudy', 'overcast', 'rainy', 'sunny'],
    water_clarity: ['clear', 'slightly_murky', 'murky'],
    water_level: ['normal', 'high', 'low'],
    water_flow: ['moderate', 'fast', 'slow'],
    time_of_day: ['morning', 'midday', 'afternoon'],
    time_of_year: ['spring', 'summer', 'fall', 'winter'],
    water_temperature_range: { min: 35, max: 70 },
    air_temperature_range: { min: 40, max: 85 },
    wind_conditions: ['calm', 'light', 'moderate', 'strong'],
    light_conditions: ['bright', 'overcast', 'low_light']
  },
  
  'streamer': {
    weather: ['sunny', 'cloudy', 'overcast', 'rainy'],
    water_clarity: ['clear', 'slightly_murky', 'murky'],
    water_level: ['normal', 'high', 'low'],
    water_flow: ['moderate', 'fast', 'slow'],
    time_of_day: ['morning', 'midday', 'afternoon', 'dusk'],
    time_of_year: ['spring', 'summer', 'fall', 'winter'],
    water_temperature_range: { min: 40, max: 75 },
    air_temperature_range: { min: 45, max: 90 },
    wind_conditions: ['calm', 'light', 'moderate', 'strong'],
    light_conditions: ['bright', 'overcast', 'low_light']
  },
  
  'terrestrial': {
    weather: ['sunny', 'cloudy'],
    water_clarity: ['clear', 'slightly_murky'],
    water_level: ['normal', 'low'],
    water_flow: ['slow', 'moderate'],
    time_of_day: ['midday', 'afternoon'],
    time_of_year: ['summer', 'fall'],
    water_temperature_range: { min: 60, max: 80 },
    air_temperature_range: { min: 70, max: 95 },
    wind_conditions: ['light', 'moderate', 'strong'],
    light_conditions: ['bright']
  },
  
  'emerger': {
    weather: ['cloudy', 'overcast', 'rainy'],
    water_clarity: ['clear', 'slightly_murky'],
    water_level: ['normal', 'low'],
    water_flow: ['slow', 'moderate'],
    time_of_day: ['morning', 'afternoon', 'dusk'],
    time_of_year: ['spring', 'summer', 'fall'],
    water_temperature_range: { min: 45, max: 70 },
    air_temperature_range: { min: 50, max: 80 },
    wind_conditions: ['calm', 'light'],
    light_conditions: ['overcast', 'low_light']
  }
};

async function enhanceExistingFlies() {
  try {
    console.log('🚀 Starting to enhance existing flies with comprehensive conditions...');
    
    // Get all existing flies
    const { data: flies, error: fetchError } = await supabase
      .from('flies')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching flies:', fetchError);
      return;
    }
    
    console.log(`📝 Found ${flies.length} flies to enhance`);
    
    let updatedCount = 0;
    
    for (const fly of flies) {
      console.log(`\n🔄 Updating ${fly.name} (${fly.type})...`);
      
      // Get enhanced conditions for this specific fly or use generic conditions for its type
      const enhancedConditionsForFly = enhancedConditions[fly.name] || genericConditions[fly.type] || genericConditions['dry'];
      
      // Update the fly with enhanced conditions
      const { error: updateError } = await supabase
        .from('flies')
        .update({
          best_conditions: enhancedConditionsForFly
        })
        .eq('id', fly.id);
      
      if (updateError) {
        console.error(`❌ Error updating ${fly.name}:`, updateError);
      } else {
        console.log(`✅ Successfully updated ${fly.name}`);
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 Enhancement complete! Updated ${updatedCount} out of ${flies.length} flies`);
    
    // Verify the results
    const { data: sampleFlies, error: verifyError } = await supabase
      .from('flies')
      .select('name, type, best_conditions')
      .limit(5);
    
    if (verifyError) {
      console.error('Error verifying updates:', verifyError);
    } else {
      console.log('\n🎣 Sample flies after enhancement:');
      sampleFlies.forEach(fly => {
        const conditions = fly.best_conditions || {};
        console.log(`  - ${fly.name} (${fly.type})`);
        console.log(`    Weather: ${conditions.weather?.join(', ') || 'N/A'}`);
        console.log(`    Water Flow: ${conditions.water_flow?.join(', ') || 'N/A'}`);
        console.log(`    Wind Conditions: ${conditions.wind_conditions?.join(', ') || 'N/A'}`);
        console.log(`    Light Conditions: ${conditions.light_conditions?.join(', ') || 'N/A'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Enhancement failed:', error);
  }
}

enhanceExistingFlies();
