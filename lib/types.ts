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
  type: 'dry' | 'wet' | 'nymph' | 'streamer' | 'terrestrial';
  size: string;
  color: string;
  description?: string;
  image?: string; // Path to fly image
  link?: string; // URL to learn more about the fly
  best_conditions: {
    weather: string[];
    water_clarity: string[];
    water_level: string[];
    time_of_day: string[];
    time_of_year?: string[];
    water_temperature_range?: {
      min: number;
      max: number;
    };
  };
  success_rate: number;
  total_uses: number;
  successful_uses: number;
  created_at: string;
  updated_at: string;
}

export interface FlySuggestion {
  fly: Fly;
  confidence: number;
  reason: string;
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