// Supabase Configuration
// Replace these with your actual Supabase project details
export const SUPABASE_CONFIG = {
  url: 'https://aflfbalfpjhznkbwatqf.supabase.co', // e.g., 'https://your-project.supabase.co'
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY', // Your public anon key
};

// Instructions:
// 1. Go to your Supabase project dashboard
// 2. Navigate to Settings → API
// 3. Copy the Project URL and replace 'YOUR_SUPABASE_URL' above
// 4. Copy the anon/public key and replace 'YOUR_SUPABASE_ANON_KEY' above
// 5. Save this file

// Sample flies data for initial database population
export const SAMPLE_FLIES = [
  {
    name: 'Adams',
    type: 'dry',
    size: '16',
    color: 'Gray',
    description: 'Classic dry fly pattern, excellent for mayfly hatches',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 45, max: 70 },
    },
  },
  {
    name: 'Elk Hair Caddis',
    type: 'dry',
    size: '14',
    color: 'Brown',
    description: 'Versatile dry fly for caddis hatches',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      water_temperature_range: { min: 50, max: 75 },
    },
  },
  {
    name: 'Pheasant Tail Nymph',
    type: 'nymph',
    size: '18',
    color: 'Brown',
    description: 'Effective nymph pattern for subsurface fishing',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 40, max: 65 },
    },
  },
  {
    name: 'Woolly Bugger',
    type: 'streamer',
    size: '8',
    color: 'Black',
    description: 'Versatile streamer that imitates various aquatic creatures',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['normal', 'high', 'flooding'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      water_temperature_range: { min: 35, max: 70 },
    },
  },
  {
    name: 'Parachute Adams',
    type: 'dry',
    size: '20',
    color: 'Gray',
    description: 'High-visibility dry fly for difficult conditions',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 45, max: 70 },
    },
  },
  {
    name: 'Hare\'s Ear Nymph',
    type: 'nymph',
    size: '16',
    color: 'Brown',
    description: 'Natural-looking nymph pattern',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 40, max: 65 },
    },
  },
  {
    name: 'Royal Wulff',
    type: 'dry',
    size: '12',
    color: 'Multi',
    description: 'High-floating dry fly for rough water',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      time_of_day: ['morning', 'afternoon'],
      water_temperature_range: { min: 50, max: 75 },
    },
  },
  {
    name: 'Zebra Midge',
    type: 'nymph',
    size: '22',
    color: 'Black',
    description: 'Small midge pattern for selective fish',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      water_temperature_range: { min: 35, max: 60 },
    },
  },
];
