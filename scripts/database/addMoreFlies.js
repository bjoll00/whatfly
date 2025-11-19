// Script to add more flies to the existing database schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aflfbalfpjhznkbwatqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Additional flies that work with the current schema
const ADDITIONAL_FLIES = [
  // DRY FLIES
  {
    name: 'Elk Hair Caddis',
    type: 'dry',
    size: '14',
    color: 'Brown',
    description: 'Versatile dry fly for caddis hatches. Excellent floatability and visibility.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 50, max: 75 }
    }
  },
  {
    name: 'Blue Winged Olive',
    type: 'dry',
    size: '18',
    color: 'Olive',
    description: 'Essential mayfly pattern for spring and fall. Small, delicate, and highly effective.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 40, max: 65 }
    }
  },
  {
    name: 'Parachute Adams',
    type: 'dry',
    size: '16',
    color: 'Gray',
    description: 'High-visibility dry fly for difficult conditions. Excellent for selective fish.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 45, max: 70 }
    }
  },
  {
    name: 'Royal Wulff',
    type: 'dry',
    size: '12',
    color: 'Multi',
    description: 'High-floating dry fly for rough water. Excellent visibility and floatability.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 50, max: 75 }
    }
  },
  {
    name: 'Chernobyl Ant',
    type: 'dry',
    size: '8',
    color: 'Black',
    description: 'Large terrestrial pattern for summer. Excellent for aggressive fish.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 60, max: 80 }
    }
  },
  {
    name: 'Griffith\'s Gnat',
    type: 'dry',
    size: '20',
    color: 'Gray',
    description: 'Small midge pattern for selective fish. Excellent for winter and early spring.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 35, max: 60 }
    }
  },
  {
    name: 'Yellow Humpy',
    type: 'dry',
    size: '14',
    color: 'Yellow',
    description: 'High-floating attractor pattern. Excellent for rough water and aggressive fish.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 50, max: 75 }
    }
  },
  {
    name: 'Quill Gordon',
    type: 'dry',
    size: '16',
    color: 'Gray',
    description: 'Classic eastern mayfly pattern. Excellent for spring hatches.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 45, max: 65 }
    }
  },
  {
    name: 'Hendrickson',
    type: 'dry',
    size: '14',
    color: 'Dark Gray',
    description: 'Important eastern spring mayfly. Excellent for selective trout.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      time_of_day: ['afternoon', 'dusk'],
      water_temperature_range: { min: 50, max: 70 }
    }
  },
  {
    name: 'March Brown',
    type: 'dry',
    size: '12',
    color: 'Brown',
    description: 'Large spring mayfly pattern. Excellent for early season fishing.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['afternoon', 'dusk'],
      water_temperature_range: { min: 45, max: 65 }
    }
  },
  {
    name: 'Light Cahill',
    type: 'dry',
    size: '14',
    color: 'Cream',
    description: 'Classic summer mayfly pattern. Excellent for evening hatches.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['afternoon', 'dusk'],
      water_temperature_range: { min: 60, max: 75 }
    }
  },
  {
    name: 'Sulphur',
    type: 'dry',
    size: '16',
    color: 'Yellow',
    description: 'Important summer mayfly. Excellent for selective trout in clear water.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      time_of_day: ['afternoon', 'dusk'],
      water_temperature_range: { min: 60, max: 75 }
    }
  },
  {
    name: 'Trico',
    type: 'dry',
    size: '22',
    color: 'Black',
    description: 'Small summer mayfly. Excellent for selective trout in clear streams.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 60, max: 75 }
    }
  },
  {
    name: 'Mahogany Dun',
    type: 'dry',
    size: '16',
    color: 'Mahogany',
    description: 'Fall mayfly pattern. Excellent for autumn fishing.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['afternoon', 'dusk'],
      water_temperature_range: { min: 45, max: 65 }
    }
  },
  {
    name: 'BWO Spinner',
    type: 'dry',
    size: '18',
    color: 'Olive-Gray',
    description: 'Spent mayfly pattern. Excellent for fall and spring fishing.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['afternoon', 'dusk'],
      water_temperature_range: { min: 40, max: 65 }
    }
  },
  {
    name: 'Rusty Spinner',
    type: 'dry',
    size: '14',
    color: 'Rust',
    description: 'Spent mayfly pattern. Excellent for evening fishing.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['dusk'],
      water_temperature_range: { min: 50, max: 75 }
    }
  },
  {
    name: 'Stimulator',
    type: 'dry',
    size: '12',
    color: 'Orange',
    description: 'Versatile attractor pattern. Excellent for rough water and aggressive fish.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 50, max: 75 }
    }
  },
  {
    name: 'Terrestrial Ant',
    type: 'terrestrial',
    size: '16',
    color: 'Black',
    description: 'Classic ant imitation for summer fishing.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 60, max: 80 }
    }
  },
  {
    name: 'Beetle',
    type: 'terrestrial',
    size: '14',
    color: 'Black',
    description: 'Beetle imitation for summer fishing.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 60, max: 80 }
    }
  },
  {
    name: 'Hopper',
    type: 'terrestrial',
    size: '10',
    color: 'Tan',
    description: 'Large grasshopper imitation for summer fishing.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 60, max: 80 }
    }
  },
  {
    name: 'Flying Ant',
    type: 'terrestrial',
    size: '16',
    color: 'Black',
    description: 'Flying ant imitation for summer swarms.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['afternoon', 'dusk'],
      water_temperature_range: { min: 65, max: 80 }
    }
  },
  {
    name: 'Cricket',
    type: 'terrestrial',
    size: '12',
    color: 'Black',
    description: 'Cricket imitation for summer fishing.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 60, max: 80 }
    }
  },
  
  // NYMPHS
  {
    name: 'Pheasant Tail Nymph',
    type: 'nymph',
    size: '18',
    color: 'Brown',
    description: 'Effective nymph pattern for subsurface fishing.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 40, max: 65 }
    }
  },
  {
    name: 'Hare\'s Ear Nymph',
    type: 'nymph',
    size: '16',
    color: 'Brown',
    description: 'Natural-looking nymph pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 40, max: 65 }
    }
  },
  {
    name: 'Bead Head Pheasant Tail',
    type: 'nymph',
    size: '16',
    color: 'Brown',
    description: 'Weighted version for deeper water.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 65 }
    }
  },
  {
    name: 'Prince Nymph',
    type: 'nymph',
    size: '12',
    color: 'Black',
    description: 'Classic attractor nymph pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Bead Head Prince',
    type: 'nymph',
    size: '12',
    color: 'Black',
    description: 'Weighted prince nymph.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Zebra Midge',
    type: 'nymph',
    size: '20',
    color: 'Black',
    description: 'Small midge pattern for selective fish.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 60 }
    }
  },
  {
    name: 'Copper John',
    type: 'nymph',
    size: '16',
    color: 'Copper',
    description: 'Heavy, flashy nymph pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Barr\'s Emerger',
    type: 'nymph',
    size: '18',
    color: 'Gray',
    description: 'Emerging mayfly pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 40, max: 65 }
    }
  },
  {
    name: 'San Juan Worm',
    type: 'nymph',
    size: '14',
    color: 'Red',
    description: 'Simple worm imitation for all conditions.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high', 'flooding'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 75 }
    }
  },
  {
    name: 'Squirmy Worm',
    type: 'nymph',
    size: '12',
    color: 'Pink',
    description: 'Animated worm pattern for active fish.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 40, max: 70 }
    }
  },
  {
    name: 'RS2',
    type: 'nymph',
    size: '20',
    color: 'Gray',
    description: 'Realistic mayfly emerger pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 40, max: 65 }
    }
  },
  {
    name: 'Pheasant Tail Soft Hackle',
    type: 'nymph',
    size: '16',
    color: 'Brown',
    description: 'Soft hackle version of pheasant tail.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 40, max: 65 }
    }
  },
  {
    name: 'Bead Head Hare\'s Ear',
    type: 'nymph',
    size: '14',
    color: 'Brown',
    description: 'Weighted hare\'s ear nymph.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 65 }
    }
  },
  {
    name: 'Micro Mayfly',
    type: 'nymph',
    size: '20',
    color: 'Olive',
    description: 'Small mayfly nymph for selective fish.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 40, max: 65 }
    }
  },
  {
    name: 'Bead Head Caddis Pupa',
    type: 'nymph',
    size: '14',
    color: 'Olive',
    description: 'Weighted caddis pupa pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 40, max: 70 }
    }
  },
  {
    name: 'Flashback Pheasant Tail',
    type: 'nymph',
    size: '16',
    color: 'Brown',
    description: 'Flashback version for added visibility.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 65 }
    }
  },
  {
    name: 'French Nymph',
    type: 'nymph',
    size: '14',
    color: 'Brown',
    description: 'European-style heavy nymph.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Perdigon',
    type: 'nymph',
    size: '16',
    color: 'Black',
    description: 'Spanish-style heavy nymph pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Barr\'s Graphic Caddis',
    type: 'nymph',
    size: '14',
    color: 'Olive',
    description: 'Realistic caddis larva pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 40, max: 70 }
    }
  },
  {
    name: 'Bead Head Zebra Midge',
    type: 'nymph',
    size: '18',
    color: 'Black',
    description: 'Weighted zebra midge for deeper water.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 60 }
    }
  },
  {
    name: 'Pheasant Tail Jig',
    type: 'nymph',
    size: '14',
    color: 'Brown',
    description: 'Jig hook version for better presentation.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 65 }
    }
  },
  {
    name: 'Bead Head Serendipity',
    type: 'nymph',
    size: '16',
    color: 'Gray',
    description: 'Simple, effective midge pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 60 }
    }
  },
  
  // STREAMERS
  {
    name: 'Woolly Bugger',
    type: 'streamer',
    size: '8',
    color: 'Black',
    description: 'Versatile streamer that imitates various aquatic creatures.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['normal', 'high', 'flooding'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Bunny Leech',
    type: 'streamer',
    size: '6',
    color: 'Black',
    description: 'Rabbit fur leech imitation.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Clouser Minnow',
    type: 'streamer',
    size: '6',
    color: 'Chartreuse',
    description: 'Effective baitfish imitation.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 40, max: 75 }
    }
  },
  {
    name: 'Muddler Minnow',
    type: 'streamer',
    size: '8',
    color: 'Brown',
    description: 'Classic streamer pattern.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 40, max: 75 }
    }
  },
  {
    name: 'Zonker',
    type: 'streamer',
    size: '6',
    color: 'Olive',
    description: 'Rabbit strip streamer.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Sculpin',
    type: 'streamer',
    size: '4',
    color: 'Olive',
    description: 'Bottom-dwelling fish imitation.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 35, max: 65 }
    }
  },
  {
    name: 'Mickey Finn',
    type: 'streamer',
    size: '8',
    color: 'Red',
    description: 'Classic attractor streamer.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 40, max: 75 }
    }
  },
  {
    name: 'Marabou Leech',
    type: 'streamer',
    size: '6',
    color: 'Black',
    description: 'Marabou leech imitation.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Bead Head Woolly Bugger',
    type: 'streamer',
    size: '8',
    color: 'Black',
    description: 'Weighted woolly bugger for deeper water.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['normal', 'high', 'flooding'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Sparkle Minnow',
    type: 'streamer',
    size: '6',
    color: 'Silver',
    description: 'Flashy baitfish imitation.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 40, max: 75 }
    }
  },
  {
    name: 'Matuka',
    type: 'streamer',
    size: '6',
    color: 'Olive',
    description: 'New Zealand streamer pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Slump Buster',
    type: 'streamer',
    size: '6',
    color: 'Olive',
    description: 'Simple, effective streamer pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Sex Dungeon',
    type: 'streamer',
    size: '4',
    color: 'Olive',
    description: 'Large articulated streamer for big fish.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 40, max: 70 }
    }
  },
  {
    name: 'Game Changer',
    type: 'streamer',
    size: '4',
    color: 'Olive',
    description: 'Articulated streamer with realistic action.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 40, max: 70 }
    }
  },
  {
    name: 'Double Bunny',
    type: 'streamer',
    size: '4',
    color: 'Olive',
    description: 'Double rabbit strip streamer.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Bead Head Bugger',
    type: 'streamer',
    size: '8',
    color: 'Black',
    description: 'Weighted bugger for deeper water.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['normal', 'high', 'flooding'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 35, max: 70 }
    }
  },
  {
    name: 'Sculpin Helmet',
    type: 'streamer',
    size: '4',
    color: 'Olive',
    description: 'Heavy sculpin imitation with helmet head.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 35, max: 65 }
    }
  },
  {
    name: 'Dolly Llama',
    type: 'streamer',
    size: '4',
    color: 'Olive',
    description: 'Articulated streamer for big fish.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 40, max: 70 }
    }
  },
  {
    name: 'Bead Head Zonker',
    type: 'streamer',
    size: '6',
    color: 'Olive',
    description: 'Weighted zonker for deeper water.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 35, max: 70 }
    }
  }
];

async function addMoreFlies() {
  console.log('🚀 Adding more flies to the database...');
  
  try {
    console.log(`📝 Inserting ${ADDITIONAL_FLIES.length} additional flies...`);
    
    const fliesToInsert = ADDITIONAL_FLIES.map((fly) => ({
      ...fly,
      success_rate: 0.5,
      total_uses: 0,
      successful_uses: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { data, error } = await supabase
      .from('flies')
      .insert(fliesToInsert)
      .select();
    
    if (error) {
      console.error('❌ Error inserting flies:', error);
      throw error;
    }
    
    console.log(`✅ Successfully inserted ${data?.length || 0} flies!`);
    
    // Check total count
    const { count } = await supabase
      .from('flies')
      .select('*', { count: 'exact', head: true });
    
    console.log(`🎣 Total flies in database: ${count}`);
    console.log('🎣 Fly database expansion complete!');
    
  } catch (error) {
    console.error('❌ Adding flies failed:', error);
    throw error;
  }
}

// Run the script
addMoreFlies().catch(console.error);
