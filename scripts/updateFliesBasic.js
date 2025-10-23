const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://aflfbalfpjhznkbwatqf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY');

// Comprehensive fly database with enhanced best_conditions for current schema
const comprehensiveFlies = [
  {
    name: 'Adams',
    type: 'dry',
    size: '16',
    color: 'Gray',
    description: 'Classic dry fly pattern, excellent for mayfly hatches. Works as both dun and spinner.',
    best_conditions: {
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
    success_rate: 0.75,
    total_uses: 150,
    successful_uses: 112
  },

  {
    name: 'Elk Hair Caddis',
    type: 'dry',
    size: '14',
    color: 'Brown',
    description: 'Versatile dry fly for caddis hatches. Excellent floatability and natural movement.',
    best_conditions: {
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
    },
    success_rate: 0.80,
    total_uses: 200,
    successful_uses: 160
  },

  {
    name: 'Daves Hopper',
    type: 'terrestrial',
    size: '10',
    color: 'Yellow',
    description: 'Classic grasshopper imitation. Perfect for summer terrestrial fishing.',
    best_conditions: {
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
    success_rate: 0.70,
    total_uses: 120,
    successful_uses: 84
  },

  {
    name: 'Morrish Mouse',
    type: 'streamer',
    size: '6',
    color: 'Brown',
    description: 'Large mouse imitation for night fishing. Deadly on big trout during low light.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['night', 'dusk'],
      time_of_year: ['summer', 'fall'],
      water_temperature_range: { min: 50, max: 70 },
      air_temperature_range: { min: 60, max: 80 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['low_light', 'dark']
    },
    success_rate: 0.85,
    total_uses: 80,
    successful_uses: 68
  },

  {
    name: 'Pheasant Tail Nymph',
    type: 'nymph',
    size: '18',
    color: 'Brown',
    description: 'Classic nymph pattern. Imitates mayfly nymphs and works year-round.',
    best_conditions: {
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
    success_rate: 0.85,
    total_uses: 300,
    successful_uses: 255
  },

  {
    name: 'Pats Rubber Legs',
    type: 'nymph',
    size: '8',
    color: 'Brown',
    description: 'Large stonefly nymph imitation. Excellent for high water and cold conditions.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['high', 'normal'],
      water_flow: ['fast', 'moderate'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 65 },
      air_temperature_range: { min: 45, max: 80 },
      wind_conditions: ['calm', 'light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light', 'bright']
    },
    success_rate: 0.80,
    total_uses: 180,
    successful_uses: 144
  },

  {
    name: 'Zebra Midge',
    type: 'nymph',
    size: '22',
    color: 'Black',
    description: 'Tiny midge larva imitation. Essential for winter and selective fish.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'sunny'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['winter', 'spring', 'fall'],
      water_temperature_range: { min: 32, max: 55 },
      air_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['bright', 'overcast']
    },
    success_rate: 0.90,
    total_uses: 250,
    successful_uses: 225
  },

  {
    name: 'Woolly Bugger',
    type: 'streamer',
    size: '8',
    color: 'Black',
    description: 'Versatile streamer pattern. Imitates leeches, baitfish, and other large prey.',
    best_conditions: {
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
    success_rate: 0.75,
    total_uses: 220,
    successful_uses: 165
  },

  {
    name: 'Sculpin Streamer',
    type: 'streamer',
    size: '6',
    color: 'Olive',
    description: 'Realistic sculpin imitation. Deadly for large trout in deeper water.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 45, max: 70 },
      air_temperature_range: { min: 50, max: 85 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light']
    },
    success_rate: 0.85,
    total_uses: 100,
    successful_uses: 85
  },

  {
    name: 'RS2 Emerger',
    type: 'emerger',
    size: '18',
    color: 'Gray',
    description: 'Effective emerger pattern. Imitates insects transitioning from nymph to adult.',
    best_conditions: {
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
    },
    success_rate: 0.80,
    total_uses: 160,
    successful_uses: 128
  },

  {
    name: 'San Juan Worm',
    type: 'nymph',
    size: '14',
    color: 'Red',
    description: 'Simple but effective worm pattern. Works great in high, dirty water.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['high', 'normal'],
      water_flow: ['fast', 'moderate'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 65 },
      air_temperature_range: { min: 45, max: 80 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light']
    },
    success_rate: 0.70,
    total_uses: 140,
    successful_uses: 98
  },

  {
    name: 'Stimulator',
    type: 'dry',
    size: '10',
    color: 'Yellow',
    description: 'High-floating attractor pattern. Excellent for rough water and as a dropper indicator.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['fast', 'moderate'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 45, max: 75 },
      air_temperature_range: { min: 50, max: 90 },
      wind_conditions: ['calm', 'light', 'moderate', 'strong'],
      light_conditions: ['bright', 'overcast']
    },
    success_rate: 0.75,
    total_uses: 180,
    successful_uses: 135
  },

  // Fixed Chubby Chernobyl with proper conditions
  {
    name: 'Chubby Chernobyl',
    type: 'dry',
    size: '8',
    color: 'Yellow',
    description: 'Large, buoyant attractor pattern. Excellent for rough water and as a hopper imitation.',
    best_conditions: {
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
    success_rate: 0.65,
    total_uses: 120,
    successful_uses: 78
  },

  {
    name: 'Bead Head Pheasant Tail',
    type: 'nymph',
    size: '16',
    color: 'Brown',
    description: 'Weighted version of the classic Pheasant Tail. Sinks faster and stays in the strike zone.',
    best_conditions: {
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
    success_rate: 0.85,
    total_uses: 280,
    successful_uses: 238
  },

  // Additional diverse flies for better variety
  {
    name: 'Parachute Adams',
    type: 'dry',
    size: '18',
    color: 'Gray',
    description: 'Improved Adams with parachute hackle for better floatability.',
    best_conditions: {
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
    success_rate: 0.78,
    total_uses: 130,
    successful_uses: 101
  },

  {
    name: 'Blue Winged Olive',
    type: 'dry',
    size: '20',
    color: 'Olive',
    description: 'Essential mayfly pattern for spring and fall. Critical for selective trout.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['midday', 'afternoon'],
      time_of_year: ['spring', 'fall'],
      water_temperature_range: { min: 45, max: 65 },
      air_temperature_range: { min: 50, max: 75 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast', 'low_light']
    },
    success_rate: 0.82,
    total_uses: 170,
    successful_uses: 139
  },

  {
    name: 'Griffiths Gnat',
    type: 'dry',
    size: '24',
    color: 'Black',
    description: 'Tiny midge cluster pattern. Essential for selective fish during midge hatches.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['winter', 'spring', 'fall'],
      water_temperature_range: { min: 35, max: 60 },
      air_temperature_range: { min: 40, max: 70 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast', 'low_light']
    },
    success_rate: 0.88,
    total_uses: 90,
    successful_uses: 79
  },

  {
    name: 'Prince Nymph',
    type: 'nymph',
    size: '14',
    color: 'Brown',
    description: 'Classic attractor nymph. Works well in most conditions and imitates various insects.',
    best_conditions: {
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
    success_rate: 0.77,
    total_uses: 190,
    successful_uses: 146
  },

  {
    name: 'Hare\'s Ear Nymph',
    type: 'nymph',
    size: '16',
    color: 'Brown',
    description: 'Natural-looking nymph pattern. Excellent for imitating various aquatic insects.',
    best_conditions: {
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
    success_rate: 0.83,
    total_uses: 210,
    successful_uses: 174
  },

  {
    name: 'Mickey Finn',
    type: 'streamer',
    size: '10',
    color: 'Red',
    description: 'Classic streamer pattern. Excellent for aggressive fish and high water conditions.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 45, max: 70 },
      air_temperature_range: { min: 50, max: 85 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light']
    },
    success_rate: 0.72,
    total_uses: 110,
    successful_uses: 79
  },

  {
    name: 'Parachute Ant',
    type: 'terrestrial',
    size: '16',
    color: 'Black',
    description: 'Effective terrestrial pattern. Works great during ant falls and summer fishing.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['midday', 'afternoon'],
      time_of_year: ['summer', 'fall'],
      water_temperature_range: { min: 60, max: 80 },
      air_temperature_range: { min: 70, max: 95 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['bright']
    },
    success_rate: 0.68,
    total_uses: 85,
    successful_uses: 58
  }
];

async function updateDatabase() {
  try {
    console.log('🚀 Starting comprehensive fly database update...');
    
    // First, clear existing flies
    console.log('🗑️ Clearing existing flies...');
    const { error: deleteError } = await supabase
      .from('flies')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all flies
    
    if (deleteError) {
      console.error('Error clearing flies:', deleteError);
      return;
    }
    
    console.log('✅ Cleared existing flies');
    
    // Insert comprehensive flies
    console.log('📝 Inserting', comprehensiveFlies.length, 'comprehensive flies...');
    
    const { data, error } = await supabase
      .from('flies')
      .insert(comprehensiveFlies);
    
    if (error) {
      console.error('Error inserting flies:', error);
      return;
    }
    
    console.log('✅ Successfully inserted comprehensive flies!');
    
    // Verify the results
    const { data: flies, error: verifyError } = await supabase
      .from('flies')
      .select('name, type, size, color, success_rate')
      .limit(15);
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else {
      console.log('🎣 Sample flies after update:');
      flies.forEach(fly => {
        console.log('  -', fly.name, '(' + fly.type + ', size ' + fly.size + ', ' + fly.color + ', success: ' + (fly.success_rate * 100).toFixed(1) + '%)');
      });
      
      console.log('\n📊 Database Statistics:');
      const { data: allFlies } = await supabase
        .from('flies')
        .select('type');
      
      const typeCounts = {};
      allFlies.forEach(fly => {
        typeCounts[fly.type] = (typeCounts[fly.type] || 0) + 1;
      });
      
      console.log('Fly types:', typeCounts);
      console.log('Total flies:', allFlies.length);
    }
    
  } catch (error) {
    console.error('Update failed:', error);
  }
}

updateDatabase();
