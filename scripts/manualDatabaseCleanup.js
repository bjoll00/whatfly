// Manual database cleanup script - provides exact data for manual Supabase updates
console.log('🧹 MANUAL DATABASE CLEANUP GUIDE');
console.log('================================');
console.log('Due to Row Level Security (RLS) policies, we need to manually clean up the database.');
console.log('This script provides you with the exact data needed.\n');

// Missing patterns that need to be added
const missingPatterns = [
  {
    name: 'Articulated Sculpin',
    type: 'streamer',
    size: '4',
    color: 'brown',
    description: 'Articulated streamer imitating sculpins and baitfish',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      time_of_day: ['dawn', 'morning', 'dusk'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast']
    },
    success_rate: 0,
    total_uses: 0,
    successful_uses: 0
  },
  {
    name: 'Game Changer',
    type: 'streamer',
    size: '4',
    color: 'white',
    description: 'Articulated streamer with multiple joints for realistic movement',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast'],
      time_of_day: ['dawn', 'morning', 'afternoon', 'dusk'],
      water_clarity: ['clear'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast']
    },
    success_rate: 0,
    total_uses: 0,
    successful_uses: 0
  },
  {
    name: 'Double Bunny',
    type: 'streamer',
    size: '4',
    color: 'white',
    description: 'Large articulated leech pattern for big fish',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast']
    },
    success_rate: 0,
    total_uses: 0,
    successful_uses: 0
  },
  {
    name: 'Morrish Mouse',
    type: 'streamer',
    size: '4',
    color: 'brown',
    description: 'Large mouse pattern for night fishing and big fish',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      time_of_day: ['dusk', 'night', 'dawn'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast']
    },
    success_rate: 0,
    total_uses: 0,
    successful_uses: 0
  },
  {
    name: 'Deer Hair Mouse',
    type: 'streamer',
    size: '4',
    color: 'brown',
    description: 'Traditional deer hair mouse pattern',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      time_of_day: ['dusk', 'night', 'dawn'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast']
    },
    success_rate: 0,
    total_uses: 0,
    successful_uses: 0
  },
  {
    name: 'Foam Mouse',
    type: 'streamer',
    size: '4',
    color: 'brown',
    description: 'High-floating foam mouse pattern',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      time_of_day: ['dusk', 'night', 'dawn'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast']
    },
    success_rate: 0,
    total_uses: 0,
    successful_uses: 0
  }
];

console.log('📋 STEP 1: REMOVE DUPLICATES');
console.log('=============================');
console.log('Go to your Supabase dashboard and delete these duplicate flies:');
console.log('(Keep only 1 copy of each)\n');

const duplicates = [
  'Adams (delete 1 duplicate)',
  'Elk Hair Caddis (delete 1 duplicate)', 
  'Parachute Adams (delete 1 duplicate)',
  'Royal Wulff (delete 1 duplicate)',
  'Hare\'s Ear Nymph (delete 1 duplicate)',
  'Pheasant Tail Nymph (delete 1 duplicate)',
  'Zebra Midge (delete 1 duplicate)',
  'Woolly Bugger (delete 1 duplicate)'
];

duplicates.forEach(duplicate => {
  console.log(`• ${duplicate}`);
});

console.log('\n📋 STEP 2: ADD MISSING PATTERNS');
console.log('===============================');
console.log('Add these new fly patterns to your Supabase flies table:\n');

missingPatterns.forEach((pattern, index) => {
  console.log(`${index + 1}. ${pattern.name} (${pattern.type})`);
  console.log(`   Size: ${pattern.size}, Color: ${pattern.color}`);
  console.log(`   Description: ${pattern.description}`);
  console.log(`   Best Conditions: ${JSON.stringify(pattern.best_conditions, null, 2)}`);
  console.log('');
});

console.log('📋 STEP 3: MULTIPLE SIZES/COLORS (OPTIONAL)');
console.log('============================================');
console.log('For each fly, you can add multiple entries with different sizes/colors:');
console.log('Example for Adams:');
console.log('• Adams - Size: 14, Color: gray');
console.log('• Adams - Size: 16, Color: gray'); 
console.log('• Adams - Size: 18, Color: light_gray');
console.log('• Adams - Size: 20, Color: dark_gray');
console.log('');

console.log('📋 STEP 4: ALTERNATIVE - DISABLE RLS TEMPORARILY');
console.log('================================================');
console.log('If you prefer to automate this:');
console.log('1. Go to Supabase Dashboard > Authentication > Policies');
console.log('2. Find the flies table and temporarily disable RLS');
console.log('3. Run: node scripts/comprehensiveFlyDatabaseUpdate.js');
console.log('4. Re-enable RLS policies');
console.log('');

console.log('✅ MANUAL CLEANUP COMPLETE!');
console.log('After completing these steps, your database will have:');
console.log('• No duplicates');
console.log('• 6 new streamer patterns for big fish');
console.log('• 3 mouse patterns for night fishing');
console.log('• Enhanced streamer variety');
console.log('• Better condition data for improved suggestions');
