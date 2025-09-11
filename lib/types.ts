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
  best_conditions: {
    weather: string[];
    water_clarity: string[];
    water_level: string[];
    time_of_day: string[];
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
  weather_conditions: 'sunny' | 'cloudy' | 'overcast' | 'rainy' | 'stormy' | 'foggy';
  water_conditions: 'calm' | 'rippled' | 'choppy' | 'fast_moving' | 'turbulent' | 'still';
  water_temperature_range: 'very_cold' | 'cold' | 'cool' | 'moderate' | 'warm' | 'hot';
  air_temperature_range: 'very_cold' | 'cold' | 'cool' | 'moderate' | 'warm' | 'hot';
  wind_speed: 'none' | 'light' | 'moderate' | 'strong' | 'very_strong';
  wind_direction: 'north' | 'northeast' | 'east' | 'southeast' | 'south' | 'southwest' | 'west' | 'northwest' | 'variable';
  water_clarity: 'clear' | 'slightly_murky' | 'murky' | 'very_murky';
  water_level: 'low' | 'normal' | 'high' | 'flooding';
  time_of_day: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'night';
  time_of_year: 'winter' | 'early_spring' | 'spring' | 'late_spring' | 'early_summer' | 'summer' | 'late_summer' | 'early_fall' | 'fall' | 'late_fall';
}
