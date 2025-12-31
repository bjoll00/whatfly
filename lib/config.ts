const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase environment variables are not set. Define EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};

// OpenWeatherMap API Configuration
// Get your free API key from: https://openweathermap.org/api
const OWM_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY;

export const WEATHER_CONFIG = {
  apiKey: OWM_API_KEY || '',
  baseUrl: 'https://api.openweathermap.org/data/2.5',
  isConfigured: !!OWM_API_KEY,
};

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
    image: 'Caddis_fly.png',
    link: 'https://www.flyfishfood.com/products/hackle-stacker-caddis-tan',
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
