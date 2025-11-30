export interface FishingLog {
  id: string;
  user_id: string;
  date: string;
  location: string;
  weather_conditions: 'sunny' | 'cloudy' | 'overcast' | 'rainy' | 'stormy' | 'foggy';
  water_conditions: 'calm' | 'rippled' | 'choppy' | 'fast_moving' | 'turbulent' | 'still';
  water_temperature?: number;
  air_temperature?: number;
  wind_speed?: number;
  wind_direction?: string;
  water_clarity: 'clear' | 'slightly_murky' | 'murky' | 'very_murky';
  water_level: 'low' | 'normal' | 'high' | 'flooding';
  time_of_day: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'night';
  time_of_year: 'winter' | 'early_spring' | 'spring' | 'late_spring' | 'early_summer' | 'summer' | 'late_summer' | 'early_fall' | 'fall' | 'late_fall';
  flies_used: string[];
  successful_flies: string[];
  fish_caught: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Fly {
  id: string;
  name: string;
  type: 'dry' | 'wet' | 'nymph' | 'streamer' | 'terrestrial' | 'emerger' | 'attractor' | 'imitation';
  pattern_name?: string; // Alternative or common name
  sizes_available: string[]; // Array of available sizes
  primary_size: string; // Most common/recommended size
  color: string;
  secondary_colors?: string[]; // Additional color variations
  description?: string;
  image?: string; // Path to fly image
  link?: string; // URL to learn more about the fly
  
  // Insect-specific data (extracted from imitated_insect JSONB)
  insect_order?: string; // e.g., "Ephemeroptera", "Trichoptera"
  insect_category?: string; // e.g., "Nymph", "Dun", "Spinner"
  insect_behavior?: string; // e.g., "Sub-surface drift"
  insect_size_min?: number; // Minimum size from sizeRange
  insect_size_max?: number; // Maximum size from sizeRange
  
  // Enhanced conditions with more granular data
  best_conditions: {
    weather: string[];
    water_clarity: string[];
    water_level: string[];
    water_flow: string[]; // still, slow, moderate, fast, raging
    time_of_day: string[];
    time_of_year: string[]; // spring, summer, fall, winter
    water_temperature_range?: {
      min: number;
      max: number;
    };
    air_temperature_range?: {
      min: number;
      max: number;
    };
    wind_conditions?: string[]; // calm, light, moderate, strong
    light_conditions?: string[]; // bright, overcast, low_light, dark
  };
  
  // Regional effectiveness
  regional_effectiveness: {
    regions: string[]; // western, midwest, eastern, southern, mountain, coastal
    primary_regions: string[]; // Most effective regions
    seasonal_patterns?: {
      [region: string]: string[]; // Region-specific seasonal effectiveness
    };
  };
  
  // Target species
  target_species: {
    primary: string[]; // trout, bass, panfish, etc.
    secondary?: string[]; // Additional species this fly works for
    size_preference?: string; // small, medium, large fish
  };
  
  // Hatch matching
  hatch_matching?: {
    insects: string[]; // mayfly, caddis, stonefly, midge, etc.
    stages: string[]; // nymph, emerger, dun, spinner
    sizes: string[]; // Matching insect sizes
  };
  
  // Fly characteristics
  characteristics: {
    floatability?: 'high' | 'medium' | 'low'; // For dry flies
    sink_rate?: 'fast' | 'medium' | 'slow'; // For subsurface flies
    visibility?: 'high' | 'medium' | 'low';
    durability?: 'high' | 'medium' | 'low';
    versatility?: 'high' | 'medium' | 'low'; // Works in many conditions
  };
  
  // Performance metrics
  success_rate: number;
  total_uses: number;
  successful_uses: number;
  confidence_score?: number; // Algorithm-calculated confidence
  
  // Metadata
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  tying_difficulty?: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
}

export interface FlySuggestion {
  fly: Fly;
  confidence: number;
  reason: string;
  matching_factors?: string[];
}

export interface FishingConditions {
  date: string;
  location: string;
  latitude?: number;
  longitude?: number;
  location_address?: string;
  weather_conditions: 'sunny' | 'cloudy' | 'overcast' | 'rainy' | 'stormy' | 'foggy';
  water_conditions: 'calm' | 'rippled' | 'choppy' | 'fast_moving' | 'turbulent' | 'still';
  water_temperature_range: 'very_cold' | 'cold' | 'cool' | 'moderate' | 'warm' | 'hot';
  water_temperature?: number; // Optional specific temperature in degrees
  air_temperature_range: 'very_cold' | 'cold' | 'cool' | 'moderate' | 'warm' | 'hot';
  wind_speed: 'none' | 'light' | 'moderate' | 'strong' | 'very_strong';
  wind_direction: 'north' | 'northeast' | 'east' | 'southeast' | 'south' | 'southwest' | 'west' | 'northwest' | 'variable';
  water_clarity: 'clear' | 'slightly_murky' | 'murky' | 'very_murky';
  water_level: 'low' | 'normal' | 'high' | 'flooding';
  water_flow?: 'still' | 'slow' | 'moderate' | 'fast' | 'rapid';
  water_depth?: number;
  water_ph?: number;
  dissolved_oxygen?: number;
  time_of_day: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'night';
  time_of_year: 'winter' | 'early_spring' | 'spring' | 'late_spring' | 'early_summer' | 'summer' | 'late_summer' | 'early_fall' | 'fall' | 'late_fall';
  
  // Lunar conditions
  moon_phase?: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 
               'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  moon_illumination?: number; // 0-100%
  lunar_feeding_activity?: 'very_high' | 'high' | 'moderate' | 'low';
  solunar_periods?: {
    major_periods?: Array<{
      start: string;
      end: string;
      duration: number;
      peak: string;
    }>;
    minor_periods?: Array<{
      start: string;
      end: string;
      duration: number;
      peak: string;
    }>;
    sunrise?: string;
    sunset?: string;
    moonrise?: string;
    moonset?: string;
  };
  
  // Hatch chart data
  hatch_data?: {
    active_hatches?: Array<{
      insect: string;
      stage: 'nymph' | 'emerger' | 'dun' | 'spinner';
      size: string;
      intensity: 'light' | 'moderate' | 'heavy';
      time_period: string;
      water_temperature_range: {
        min: number;
        max: number;
      };
    }>;
    seasonal_hatches?: Array<{
      insect: string;
      months: string[];
      peak_months: string[];
      typical_sizes: string[];
      water_preferences: string[];
    }>;
    local_hatch_info?: {
      region: string;
      river_system: string;
      seasonal_patterns: Array<{
        season: string;
        dominant_hatches: string[];
        water_conditions: string[];
      }>;
    };
  };
  
  // Enhanced weather data
  weather_data?: {
    temperature?: number; // Current temperature in Fahrenheit
    humidity?: number; // Percentage
    pressure?: number; // Barometric pressure
    visibility?: number; // Miles
    uv_index?: number;
    cloud_cover?: number; // Percentage
    precipitation?: {
      current: number; // mm
      probability: number; // Percentage
      type: 'none' | 'rain' | 'snow' | 'sleet' | 'hail';
    };
    forecast?: Array<{
      date: string;
      high_temp: number;
      low_temp: number;
      condition: string;
      precipitation_chance: number;
    }>;
  };
  
  notes?: string;
  
  // Real-time water data from monitoring stations
  water_data?: {
    flowRate?: number; // cubic feet per second (cfs)
    waterLevel?: number; // feet above sea level
    waterTemperature?: number; // Fahrenheit
    gaugeHeight?: number; // feet
    turbidity?: number; // NTU
    dissolvedOxygen?: number; // mg/L
    pH?: number;
    conductivity?: number; // µS/cm
    stationId?: string;
    stationName?: string;
    lastUpdated?: string;
    dataSource?: 'USGS' | 'NOAA' | 'CUSTOM' | 'UTAH_DATABASE';
    dataQuality?: 'GOOD' | 'FAIR' | 'POOR' | 'UNKNOWN';
    isActive?: boolean;
  };
}

export interface SavedLocation {
  id: string;
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  weather_condition: string;
  weather_description: string;
  cloudiness: number;
  visibility: number;
  uv_index?: number;
  sunrise?: string;
  sunset?: string;
}

export interface WeatherConditions {
  weather_conditions: 'sunny' | 'cloudy' | 'overcast' | 'rainy' | 'stormy' | 'foggy';
  wind_speed: 'none' | 'light' | 'moderate' | 'strong' | 'very_strong';
  wind_direction: 'north' | 'northeast' | 'east' | 'southeast' | 'south' | 'southwest' | 'west' | 'northwest' | 'variable';
  air_temperature_range: 'very_cold' | 'cold' | 'cool' | 'moderate' | 'warm' | 'hot';
  humidity_level: 'low' | 'moderate' | 'high';
  pressure_level: 'low' | 'normal' | 'high';
}

export interface Feedback {
  id: string;
  user_id: string;
  type: 'bug_report' | 'feature_request' | 'general_feedback' | 'improvement_suggestion';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_review' | 'in_progress' | 'completed' | 'rejected';
  app_version?: string;
  device_info?: string;
  created_at: string;
  updated_at: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// User profile for social features
export interface Profile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  fishing_experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  username_changed_at?: string; // Track when username was last changed
  created_at: string;
  updated_at: string;
}

// Profile update payload (all fields optional except id is implicit)
export interface ProfileUpdate {
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  fishing_experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}