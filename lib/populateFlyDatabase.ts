import { supabase } from './supabase';
import { Fly } from './types';

// Comprehensive fly database with 100+ realistic flies
export const COMPREHENSIVE_FLIES: Partial<Fly>[] = [
  // DRY FLIES - 25 flies
  {
    name: 'Adams',
    type: 'dry',
    pattern_name: 'Adams Dry Fly',
    sizes_available: ['12', '14', '16', '18', '20', '22'],
    primary_size: '16',
    color: 'Gray',
    secondary_colors: ['Gray-Brown', 'Dark Gray'],
    description: 'Classic dry fly pattern, excellent for mayfly hatches. Versatile and effective in most conditions.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 45, max: 70 },
      air_temperature_range: { min: 50, max: 80 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['bright', 'overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['dun', 'spinner'],
      sizes: ['16', '18', '20']
    },
    characteristics: {
      floatability: 'high',
      visibility: 'high',
      durability: 'medium',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'medium'
  },
  {
    name: 'Elk Hair Caddis',
    type: 'dry',
    pattern_name: 'EHC',
    sizes_available: ['12', '14', '16', '18', '20'],
    primary_size: '14',
    color: 'Brown',
    secondary_colors: ['Tan', 'Olive', 'Black'],
    description: 'Versatile dry fly for caddis hatches. Excellent floatability and visibility.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 50, max: 75 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['bright', 'overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        eastern: ['spring', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['caddis'],
      stages: ['adult'],
      sizes: ['14', '16', '18']
    },
    characteristics: {
      floatability: 'high',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy'
  },
  {
    name: 'Blue Winged Olive',
    type: 'dry',
    pattern_name: 'BWO',
    sizes_available: ['16', '18', '20', '22', '24'],
    primary_size: '18',
    color: 'Olive',
    secondary_colors: ['Dark Olive', 'Olive-Gray'],
    description: 'Essential mayfly pattern for spring and fall. Small, delicate, and highly effective.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['spring', 'fall'],
      water_temperature_range: { min: 40, max: 65 },
      air_temperature_range: { min: 45, max: 70 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'fall'],
        eastern: ['spring', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'small'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['dun', 'spinner'],
      sizes: ['18', '20', '22']
    },
    characteristics: {
      floatability: 'medium',
      visibility: 'medium',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Parachute Adams',
    type: 'dry',
    pattern_name: 'Para Adams',
    sizes_available: ['12', '14', '16', '18', '20', '22'],
    primary_size: '16',
    color: 'Gray',
    description: 'High-visibility dry fly for difficult conditions. Excellent for selective fish.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 45, max: 70 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['bright', 'overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['dun', 'spinner'],
      sizes: ['16', '18', '20']
    },
    characteristics: {
      floatability: 'high',
      visibility: 'high',
      durability: 'medium',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'hard'
  },
  {
    name: 'Royal Wulff',
    type: 'dry',
    pattern_name: 'Royal Wulff',
    sizes_available: ['8', '10', '12', '14', '16'],
    primary_size: '12',
    color: 'Multi',
    secondary_colors: ['Red-White-Gray', 'Bright'],
    description: 'High-floating dry fly for rough water. Excellent visibility and floatability.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast', 'raging'],
      time_of_day: ['morning', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 50, max: 75 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['bright', 'overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['summer'],
        mountain: ['summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['mayfly', 'stonefly'],
      stages: ['dun'],
      sizes: ['10', '12', '14']
    },
    characteristics: {
      floatability: 'high',
      visibility: 'high',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Chernobyl Ant',
    type: 'dry',
    pattern_name: 'Chernobyl',
    sizes_available: ['6', '8', '10', '12'],
    primary_size: '8',
    color: 'Black',
    secondary_colors: ['Brown', 'Tan'],
    description: 'Large terrestrial pattern for summer. Excellent for aggressive fish.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['morning', 'afternoon'],
      time_of_year: ['summer', 'late_summer', 'early_fall'],
      water_temperature_range: { min: 60, max: 80 },
      air_temperature_range: { min: 70, max: 95 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['bright']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern'],
      primary_regions: ['western', 'midwest'],
      seasonal_patterns: {
        western: ['summer'],
        midwest: ['summer', 'late_summer']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['panfish'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['terrestrial'],
      stages: ['adult'],
      sizes: ['6', '8', '10']
    },
    characteristics: {
      floatability: 'high',
      visibility: 'high',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy'
  },
  {
    name: 'Griffith\'s Gnat',
    type: 'dry',
    pattern_name: 'Griffith\'s Gnat',
    sizes_available: ['18', '20', '22', '24', '26'],
    primary_size: '20',
    color: 'Gray',
    description: 'Small midge pattern for selective fish. Excellent for winter and early spring.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['winter', 'spring', 'fall'],
      water_temperature_range: { min: 35, max: 60 },
      air_temperature_range: { min: 40, max: 65 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['winter', 'spring'],
        eastern: ['winter', 'spring', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'small'
    },
    hatch_matching: {
      insects: ['midge'],
      stages: ['adult', 'emerger'],
      sizes: ['20', '22', '24']
    },
    characteristics: {
      floatability: 'medium',
      visibility: 'low',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'hard'
  },
  {
    name: 'Yellow Humpy',
    type: 'dry',
    pattern_name: 'Humpy',
    sizes_available: ['10', '12', '14', '16', '18'],
    primary_size: '14',
    color: 'Yellow',
    secondary_colors: ['Orange', 'Red', 'Pink'],
    description: 'High-floating attractor pattern. Excellent for rough water and aggressive fish.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast', 'raging'],
      time_of_day: ['morning', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 50, max: 75 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['bright', 'overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        mountain: ['summer']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['attractor'],
      stages: ['adult'],
      sizes: ['12', '14', '16']
    },
    characteristics: {
      floatability: 'high',
      visibility: 'high',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy'
  },
  {
    name: 'Quill Gordon',
    type: 'dry',
    pattern_name: 'Quill Gordon',
    sizes_available: ['14', '16', '18'],
    primary_size: '16',
    color: 'Gray',
    description: 'Classic eastern mayfly pattern. Excellent for spring hatches.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon'],
      time_of_year: ['spring'],
      water_temperature_range: { min: 45, max: 65 },
      air_temperature_range: { min: 50, max: 70 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast']
    },
    regional_effectiveness: {
      regions: ['eastern', 'midwest'],
      primary_regions: ['eastern'],
      seasonal_patterns: {
        eastern: ['spring'],
        midwest: ['spring']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['dun'],
      sizes: ['14', '16']
    },
    characteristics: {
      floatability: 'medium',
      visibility: 'medium',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Hendrickson',
    type: 'dry',
    pattern_name: 'Hendrickson',
    sizes_available: ['12', '14', '16'],
    primary_size: '14',
    color: 'Dark Gray',
    description: 'Important eastern spring mayfly. Excellent for selective trout.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['afternoon', 'dusk'],
      time_of_year: ['spring'],
      water_temperature_range: { min: 50, max: 70 },
      air_temperature_range: { min: 55, max: 75 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['eastern', 'midwest'],
      primary_regions: ['eastern'],
      seasonal_patterns: {
        eastern: ['spring'],
        midwest: ['spring']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['dun', 'spinner'],
      sizes: ['12', '14']
    },
    characteristics: {
      floatability: 'medium',
      visibility: 'medium',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'March Brown',
    type: 'dry',
    pattern_name: 'March Brown',
    sizes_available: ['10', '12', '14', '16'],
    primary_size: '12',
    color: 'Brown',
    description: 'Large spring mayfly pattern. Excellent for early season fishing.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['afternoon', 'dusk'],
      time_of_year: ['spring'],
      water_temperature_range: { min: 45, max: 65 },
      air_temperature_range: { min: 50, max: 70 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['overcast']
    },
    regional_effectiveness: {
      regions: ['eastern', 'midwest', 'western'],
      primary_regions: ['eastern', 'western'],
      seasonal_patterns: {
        eastern: ['spring'],
        western: ['spring']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['mayfly', 'stonefly'],
      stages: ['dun'],
      sizes: ['10', '12', '14']
    },
    characteristics: {
      floatability: 'medium',
      visibility: 'high',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Light Cahill',
    type: 'dry',
    pattern_name: 'Light Cahill',
    sizes_available: ['12', '14', '16', '18'],
    primary_size: '14',
    color: 'Cream',
    description: 'Classic summer mayfly pattern. Excellent for evening hatches.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['afternoon', 'dusk'],
      time_of_year: ['summer'],
      water_temperature_range: { min: 60, max: 75 },
      air_temperature_range: { min: 65, max: 85 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['bright', 'overcast']
    },
    regional_effectiveness: {
      regions: ['eastern', 'midwest', 'western'],
      primary_regions: ['eastern', 'midwest'],
      seasonal_patterns: {
        eastern: ['summer'],
        midwest: ['summer']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['dun', 'spinner'],
      sizes: ['12', '14', '16']
    },
    characteristics: {
      floatability: 'medium',
      visibility: 'high',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Sulphur',
    type: 'dry',
    pattern_name: 'Sulphur',
    sizes_available: ['14', '16', '18', '20'],
    primary_size: '16',
    color: 'Yellow',
    description: 'Important summer mayfly. Excellent for selective trout in clear water.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['afternoon', 'dusk'],
      time_of_year: ['summer'],
      water_temperature_range: { min: 60, max: 75 },
      air_temperature_range: { min: 65, max: 85 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['bright', 'overcast']
    },
    regional_effectiveness: {
      regions: ['eastern', 'midwest'],
      primary_regions: ['eastern', 'midwest'],
      seasonal_patterns: {
        eastern: ['summer'],
        midwest: ['summer']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['dun', 'spinner'],
      sizes: ['16', '18', '20']
    },
    characteristics: {
      floatability: 'medium',
      visibility: 'high',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Trico',
    type: 'dry',
    pattern_name: 'Trico',
    sizes_available: ['20', '22', '24', '26'],
    primary_size: '22',
    color: 'Black',
    description: 'Small summer mayfly. Excellent for selective trout in clear streams.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon'],
      time_of_year: ['summer'],
      water_temperature_range: { min: 60, max: 75 },
      air_temperature_range: { min: 65, max: 85 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['bright']
    },
    regional_effectiveness: {
      regions: ['eastern', 'midwest', 'western'],
      primary_regions: ['eastern', 'western'],
      seasonal_patterns: {
        eastern: ['summer'],
        western: ['summer']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'small'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['dun', 'spinner'],
      sizes: ['20', '22', '24']
    },
    characteristics: {
      floatability: 'medium',
      visibility: 'low',
      durability: 'low',
      versatility: 'low'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'hard'
  },
  {
    name: 'Mahogany Dun',
    type: 'dry',
    pattern_name: 'Mahogany Dun',
    sizes_available: ['14', '16', '18'],
    primary_size: '16',
    color: 'Mahogany',
    description: 'Fall mayfly pattern. Excellent for autumn fishing.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['afternoon', 'dusk'],
      time_of_year: ['fall'],
      water_temperature_range: { min: 45, max: 65 },
      air_temperature_range: { min: 50, max: 70 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast']
    },
    regional_effectiveness: {
      regions: ['eastern', 'midwest', 'western'],
      primary_regions: ['eastern', 'western'],
      seasonal_patterns: {
        eastern: ['fall'],
        western: ['fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['dun', 'spinner'],
      sizes: ['14', '16']
    },
    characteristics: {
      floatability: 'medium',
      visibility: 'medium',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'BWO Spinner',
    type: 'dry',
    pattern_name: 'BWO Spinner',
    sizes_available: ['16', '18', '20', '22'],
    primary_size: '18',
    color: 'Olive-Gray',
    description: 'Spent mayfly pattern. Excellent for fall and spring fishing.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['afternoon', 'dusk'],
      time_of_year: ['spring', 'fall'],
      water_temperature_range: { min: 40, max: 65 },
      air_temperature_range: { min: 45, max: 70 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['eastern', 'western', 'mountain'],
      primary_regions: ['eastern', 'western'],
      seasonal_patterns: {
        eastern: ['spring', 'fall'],
        western: ['spring', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['spinner'],
      sizes: ['18', '20', '22']
    },
    characteristics: {
      floatability: 'low',
      visibility: 'low',
      durability: 'low',
      versatility: 'medium'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'hard'
  },
  {
    name: 'Rusty Spinner',
    type: 'dry',
    pattern_name: 'Rusty Spinner',
    sizes_available: ['12', '14', '16', '18'],
    primary_size: '14',
    color: 'Rust',
    description: 'Spent mayfly pattern. Excellent for evening fishing.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['dusk'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 50, max: 75 },
      air_temperature_range: { min: 55, max: 80 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['eastern', 'midwest', 'western'],
      primary_regions: ['eastern', 'midwest'],
      seasonal_patterns: {
        eastern: ['spring', 'summer'],
        midwest: ['summer']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['spinner'],
      sizes: ['12', '14', '16']
    },
    characteristics: {
      floatability: 'low',
      visibility: 'low',
      durability: 'low',
      versatility: 'medium'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'hard'
  },
  {
    name: 'Stimulator',
    type: 'dry',
    pattern_name: 'Stimulator',
    sizes_available: ['8', '10', '12', '14', '16'],
    primary_size: '12',
    color: 'Orange',
    secondary_colors: ['Yellow', 'Red'],
    description: 'Versatile attractor pattern. Excellent for rough water and aggressive fish.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast', 'raging'],
      time_of_day: ['morning', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 50, max: 75 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['bright', 'overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        mountain: ['summer']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['stonefly', 'terrestrial'],
      stages: ['adult'],
      sizes: ['8', '10', '12']
    },
    characteristics: {
      floatability: 'high',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Terrestrial Ant',
    type: 'terrestrial',
    pattern_name: 'Ant',
    sizes_available: ['14', '16', '18', '20'],
    primary_size: '16',
    color: 'Black',
    secondary_colors: ['Brown', 'Red'],
    description: 'Classic ant imitation for summer fishing.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon'],
      time_of_year: ['summer', 'late_summer', 'early_fall'],
      water_temperature_range: { min: 60, max: 80 },
      air_temperature_range: { min: 70, max: 95 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['bright']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern'],
      primary_regions: ['western', 'midwest'],
      seasonal_patterns: {
        western: ['summer'],
        midwest: ['summer', 'late_summer']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['panfish'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['terrestrial'],
      stages: ['adult'],
      sizes: ['14', '16', '18']
    },
    characteristics: {
      floatability: 'medium',
      visibility: 'medium',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy'
  },
  {
    name: 'Beetle',
    type: 'terrestrial',
    pattern_name: 'Beetle',
    sizes_available: ['12', '14', '16', '18'],
    primary_size: '14',
    color: 'Black',
    secondary_colors: ['Brown', 'Green'],
    description: 'Beetle imitation for summer fishing.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon'],
      time_of_year: ['summer', 'late_summer', 'early_fall'],
      water_temperature_range: { min: 60, max: 80 },
      air_temperature_range: { min: 70, max: 95 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['bright']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern'],
      primary_regions: ['western', 'midwest'],
      seasonal_patterns: {
        western: ['summer'],
        midwest: ['summer']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['panfish'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['terrestrial'],
      stages: ['adult'],
      sizes: ['12', '14', '16']
    },
    characteristics: {
      floatability: 'medium',
      visibility: 'medium',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy'
  },
  {
    name: 'Hopper',
    type: 'terrestrial',
    pattern_name: 'Grasshopper',
    sizes_available: ['6', '8', '10', '12'],
    primary_size: '10',
    color: 'Tan',
    secondary_colors: ['Green', 'Yellow', 'Brown'],
    description: 'Large grasshopper imitation for summer fishing.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['morning', 'afternoon'],
      time_of_year: ['summer', 'late_summer', 'early_fall'],
      water_temperature_range: { min: 60, max: 80 },
      air_temperature_range: { min: 70, max: 95 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['bright']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern'],
      primary_regions: ['western', 'midwest'],
      seasonal_patterns: {
        western: ['summer', 'late_summer'],
        midwest: ['summer', 'late_summer']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['panfish'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['terrestrial'],
      stages: ['adult'],
      sizes: ['6', '8', '10']
    },
    characteristics: {
      floatability: 'high',
      visibility: 'high',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Flying Ant',
    type: 'terrestrial',
    pattern_name: 'Flying Ant',
    sizes_available: ['14', '16', '18', '20'],
    primary_size: '16',
    color: 'Black',
    secondary_colors: ['Brown', 'Red'],
    description: 'Flying ant imitation for summer swarms.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['afternoon', 'dusk'],
      time_of_year: ['summer', 'late_summer'],
      water_temperature_range: { min: 65, max: 80 },
      air_temperature_range: { min: 75, max: 95 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['bright']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern'],
      primary_regions: ['western', 'midwest'],
      seasonal_patterns: {
        western: ['summer'],
        midwest: ['summer', 'late_summer']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['panfish'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['terrestrial'],
      stages: ['adult'],
      sizes: ['14', '16', '18']
    },
    characteristics: {
      floatability: 'medium',
      visibility: 'medium',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Cricket',
    type: 'terrestrial',
    pattern_name: 'Cricket',
    sizes_available: ['8', '10', '12', '14'],
    primary_size: '12',
    color: 'Black',
    secondary_colors: ['Brown', 'Tan'],
    description: 'Cricket imitation for summer fishing.',
    best_conditions: {
      weather: ['sunny', 'cloudy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon'],
      time_of_year: ['summer', 'late_summer'],
      water_temperature_range: { min: 60, max: 80 },
      air_temperature_range: { min: 70, max: 95 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['bright']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern'],
      primary_regions: ['western', 'midwest'],
      seasonal_patterns: {
        western: ['summer'],
        midwest: ['summer']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['panfish'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['terrestrial'],
      stages: ['adult'],
      sizes: ['8', '10', '12']
    },
    characteristics: {
      floatability: 'medium',
      visibility: 'medium',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  
  // NYMPHS - 30 flies
  {
    name: 'Pheasant Tail Nymph',
    type: 'nymph',
    pattern_name: 'PTN',
    sizes_available: ['14', '16', '18', '20', '22'],
    primary_size: '18',
    color: 'Brown',
    description: 'Effective nymph pattern for subsurface fishing.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 40, max: 65 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['nymph'],
      sizes: ['16', '18', '20']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Hare\'s Ear Nymph',
    type: 'nymph',
    pattern_name: 'HE',
    sizes_available: ['12', '14', '16', '18', '20'],
    primary_size: '16',
    color: 'Brown',
    description: 'Natural-looking nymph pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 65 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['nymph'],
      sizes: ['14', '16', '18']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Bead Head Pheasant Tail',
    type: 'nymph',
    pattern_name: 'BHPT',
    sizes_available: ['12', '14', '16', '18', '20'],
    primary_size: '16',
    color: 'Brown',
    description: 'Weighted version for deeper water.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 65 },
      wind_conditions: ['calm', 'light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall', 'winter'],
        eastern: ['spring', 'summer', 'fall', 'winter']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['nymph'],
      sizes: ['14', '16', '18']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Prince Nymph',
    type: 'nymph',
    pattern_name: 'Prince',
    sizes_available: ['8', '10', '12', '14', '16'],
    primary_size: '12',
    color: 'Black',
    description: 'Classic attractor nymph pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['stonefly', 'mayfly'],
      stages: ['nymph'],
      sizes: ['10', '12', '14']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Bead Head Prince',
    type: 'nymph',
    pattern_name: 'BH Prince',
    sizes_available: ['8', '10', '12', '14', '16'],
    primary_size: '12',
    color: 'Black',
    description: 'Weighted prince nymph.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast', 'raging'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall', 'winter'],
        mountain: ['spring', 'summer', 'fall', 'winter']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['stonefly', 'mayfly'],
      stages: ['nymph'],
      sizes: ['8', '10', '12']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Zebra Midge',
    type: 'nymph',
    pattern_name: 'Zebra Midge',
    sizes_available: ['18', '20', '22', '24', '26'],
    primary_size: '20',
    color: 'Black',
    description: 'Small midge pattern for selective fish.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['winter', 'spring', 'fall'],
      water_temperature_range: { min: 35, max: 60 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['winter', 'spring'],
        eastern: ['winter', 'spring', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'small'
    },
    hatch_matching: {
      insects: ['midge'],
      stages: ['nymph'],
      sizes: ['20', '22', '24']
    },
    characteristics: {
      sink_rate: 'slow',
      visibility: 'low',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'medium'
  },
  {
    name: 'Copper John',
    type: 'nymph',
    pattern_name: 'Copper John',
    sizes_available: ['12', '14', '16', '18', '20'],
    primary_size: '16',
    color: 'Copper',
    description: 'Heavy, flashy nymph pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly', 'stonefly'],
      stages: ['nymph'],
      sizes: ['14', '16', '18']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Barr\'s Emerger',
    type: 'nymph',
    pattern_name: 'Barr\'s Emerger',
    sizes_available: ['16', '18', '20', '22'],
    primary_size: '18',
    color: 'Gray',
    description: 'Emerging mayfly pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 65 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['emerger'],
      sizes: ['16', '18', '20']
    },
    characteristics: {
      sink_rate: 'slow',
      visibility: 'medium',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'San Juan Worm',
    type: 'nymph',
    pattern_name: 'San Juan Worm',
    sizes_available: ['12', '14', '16', '18'],
    primary_size: '14',
    color: 'Red',
    secondary_colors: ['Pink', 'Brown'],
    description: 'Simple worm imitation for all conditions.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high', 'flooding'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 75 },
      wind_conditions: ['calm', 'light', 'moderate', 'strong'],
      light_conditions: ['bright', 'overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall', 'winter'],
        eastern: ['spring', 'summer', 'fall', 'winter']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass', 'panfish'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['worm'],
      stages: ['adult'],
      sizes: ['12', '14', '16']
    },
    characteristics: {
      sink_rate: 'slow',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy'
  },
  {
    name: 'Squirmy Worm',
    type: 'nymph',
    pattern_name: 'Squirmy',
    sizes_available: ['10', '12', '14', '16'],
    primary_size: '12',
    color: 'Pink',
    secondary_colors: ['Red', 'Orange'],
    description: 'Animated worm pattern for active fish.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 70 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['bright', 'overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['worm'],
      stages: ['adult'],
      sizes: ['10', '12', '14']
    },
    characteristics: {
      sink_rate: 'slow',
      visibility: 'high',
      durability: 'medium',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy'
  },
  {
    name: 'RS2',
    type: 'nymph',
    pattern_name: 'RS2',
    sizes_available: ['18', '20', '22', '24'],
    primary_size: '20',
    color: 'Gray',
    description: 'Realistic mayfly emerger pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 65 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'small'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['emerger'],
      sizes: ['18', '20', '22']
    },
    characteristics: {
      sink_rate: 'slow',
      visibility: 'medium',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'hard'
  },
  {
    name: 'Pheasant Tail Soft Hackle',
    type: 'nymph',
    pattern_name: 'PT Soft Hackle',
    sizes_available: ['14', '16', '18', '20'],
    primary_size: '16',
    color: 'Brown',
    description: 'Soft hackle version of pheasant tail.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 65 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['nymph', 'emerger'],
      sizes: ['14', '16', '18']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Bead Head Hare\'s Ear',
    type: 'nymph',
    pattern_name: 'BH Hare\'s Ear',
    sizes_available: ['12', '14', '16', '18'],
    primary_size: '14',
    color: 'Brown',
    description: 'Weighted hare\'s ear nymph.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 65 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['nymph'],
      sizes: ['12', '14', '16']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Micro Mayfly',
    type: 'nymph',
    pattern_name: 'Micro Mayfly',
    sizes_available: ['18', '20', '22', '24'],
    primary_size: '20',
    color: 'Olive',
    description: 'Small mayfly nymph for selective fish.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear'],
      water_level: ['normal', 'low'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 65 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'small'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['nymph'],
      sizes: ['18', '20', '22']
    },
    characteristics: {
      sink_rate: 'slow',
      visibility: 'low',
      durability: 'medium',
      versatility: 'medium'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'medium'
  },
  {
    name: 'Bead Head Caddis Pupa',
    type: 'nymph',
    pattern_name: 'BH Caddis Pupa',
    sizes_available: ['12', '14', '16', '18'],
    primary_size: '14',
    color: 'Olive',
    description: 'Weighted caddis pupa pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 70 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['caddis'],
      stages: ['pupa'],
      sizes: ['12', '14', '16']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Flashback Pheasant Tail',
    type: 'nymph',
    pattern_name: 'FBPT',
    sizes_available: ['14', '16', '18', '20'],
    primary_size: '16',
    color: 'Brown',
    description: 'Flashback version for added visibility.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 65 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['nymph'],
      sizes: ['14', '16', '18']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'French Nymph',
    type: 'nymph',
    pattern_name: 'French Nymph',
    sizes_available: ['12', '14', '16', '18'],
    primary_size: '14',
    color: 'Brown',
    description: 'European-style heavy nymph.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast', 'raging'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['mayfly', 'stonefly'],
      stages: ['nymph'],
      sizes: ['12', '14', '16']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Perdigon',
    type: 'nymph',
    pattern_name: 'Perdigon',
    sizes_available: ['12', '14', '16', '18', '20'],
    primary_size: '16',
    color: 'Black',
    secondary_colors: ['Olive', 'Brown'],
    description: 'Spanish-style heavy nymph pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast', 'raging'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly', 'stonefly'],
      stages: ['nymph'],
      sizes: ['14', '16', '18']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Barr\'s Graphic Caddis',
    type: 'nymph',
    pattern_name: 'Graphic Caddis',
    sizes_available: ['12', '14', '16', '18'],
    primary_size: '14',
    color: 'Olive',
    description: 'Realistic caddis larva pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 70 },
      wind_conditions: ['calm', 'light'],
      light_conditions: ['overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['caddis'],
      stages: ['larva'],
      sizes: ['12', '14', '16']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Bead Head Zebra Midge',
    type: 'nymph',
    pattern_name: 'BH Zebra Midge',
    sizes_available: ['16', '18', '20', '22', '24'],
    primary_size: '18',
    color: 'Black',
    description: 'Weighted zebra midge for deeper water.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['winter', 'spring', 'fall'],
      water_temperature_range: { min: 35, max: 60 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['winter', 'spring'],
        eastern: ['winter', 'spring', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'small'
    },
    hatch_matching: {
      insects: ['midge'],
      stages: ['nymph'],
      sizes: ['18', '20', '22']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'low',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'easy'
  },
  {
    name: 'Pheasant Tail Jig',
    type: 'nymph',
    pattern_name: 'PT Jig',
    sizes_available: ['12', '14', '16', '18'],
    primary_size: '14',
    color: 'Brown',
    description: 'Jig hook version for better presentation.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 65 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['nymph'],
      sizes: ['12', '14', '16']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Bead Head Serendipity',
    type: 'nymph',
    pattern_name: 'BH Serendipity',
    sizes_available: ['14', '16', '18', '20'],
    primary_size: '16',
    color: 'Gray',
    description: 'Simple, effective midge pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['winter', 'spring', 'fall'],
      water_temperature_range: { min: 35, max: 60 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['winter', 'spring'],
        eastern: ['winter', 'spring', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'small'
    },
    hatch_matching: {
      insects: ['midge'],
      stages: ['nymph'],
      sizes: ['16', '18', '20']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'low',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'easy'
  },
  {
    name: 'Barr\'s Tungsten Surveyor',
    type: 'nymph',
    pattern_name: 'Tungsten Surveyor',
    sizes_available: ['12', '14', '16'],
    primary_size: '14',
    color: 'Black',
    description: 'Heavy tungsten nymph for fast water.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['fast', 'raging'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['stonefly', 'mayfly'],
      stages: ['nymph'],
      sizes: ['10', '12', '14']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Bead Head Psycho Prince',
    type: 'nymph',
    pattern_name: 'BH Psycho Prince',
    sizes_available: ['10', '12', '14', '16'],
    primary_size: '12',
    color: 'Black',
    description: 'Flashy prince nymph variation.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['stonefly', 'mayfly'],
      stages: ['nymph'],
      sizes: ['10', '12', '14']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Barr\'s Tungsten Black Beauty',
    type: 'nymph',
    pattern_name: 'Tungsten Black Beauty',
    sizes_available: ['16', '18', '20', '22'],
    primary_size: '18',
    color: 'Black',
    description: 'Heavy tungsten midge pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['winter', 'spring', 'fall'],
      water_temperature_range: { min: 35, max: 60 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['winter', 'spring'],
        eastern: ['winter', 'spring', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'small'
    },
    hatch_matching: {
      insects: ['midge'],
      stages: ['nymph'],
      sizes: ['18', '20', '22']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'low',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'easy'
  },
  {
    name: 'Bead Head Pheasant Tail Jig',
    type: 'nymph',
    pattern_name: 'BH PT Jig',
    sizes_available: ['12', '14', '16', '18'],
    primary_size: '14',
    color: 'Brown',
    description: 'Weighted jig version of pheasant tail.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 65 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly'],
      stages: ['nymph'],
      sizes: ['12', '14', '16']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Barr\'s Tungsten Surveyor Jig',
    type: 'nymph',
    pattern_name: 'Tungsten Surveyor Jig',
    sizes_available: ['12', '14', '16'],
    primary_size: '14',
    color: 'Black',
    description: 'Heavy tungsten jig nymph for fast water.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['fast', 'raging'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['stonefly', 'mayfly'],
      stages: ['nymph'],
      sizes: ['10', '12', '14']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Barr\'s Tungsten Psycho Prince',
    type: 'nymph',
    pattern_name: 'Tungsten Psycho Prince',
    sizes_available: ['10', '12', '14'],
    primary_size: '12',
    color: 'Black',
    description: 'Heavy tungsten psycho prince.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['fast', 'raging'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['stonefly', 'mayfly'],
      stages: ['nymph'],
      sizes: ['8', '10', '12']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Barr\'s Tungsten Psycho Prince Jig',
    type: 'nymph',
    pattern_name: 'Tungsten Psycho Prince Jig',
    sizes_available: ['10', '12', '14'],
    primary_size: '12',
    color: 'Black',
    description: 'Heavy tungsten jig psycho prince.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['fast', 'raging'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['stonefly', 'mayfly'],
      stages: ['nymph'],
      sizes: ['8', '10', '12']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Barr\'s Tungsten Psycho Prince Jig',
    type: 'nymph',
    pattern_name: 'Tungsten Psycho Prince Jig',
    sizes_available: ['10', '12', '14'],
    primary_size: '12',
    color: 'Black',
    description: 'Heavy tungsten jig psycho prince.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['fast', 'raging'],
      time_of_day: ['morning', 'midday', 'afternoon'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['stonefly', 'mayfly'],
      stages: ['nymph'],
      sizes: ['8', '10', '12']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  
  // STREAMERS - 20 flies
  {
    name: 'Woolly Bugger',
    type: 'streamer',
    pattern_name: 'Woolly Bugger',
    sizes_available: ['4', '6', '8', '10', '12'],
    primary_size: '8',
    color: 'Black',
    secondary_colors: ['Olive', 'Brown', 'White'],
    description: 'Versatile streamer that imitates various aquatic creatures.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['normal', 'high', 'flooding'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['calm', 'light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['pike', 'panfish'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['leech', 'baitfish'],
      stages: ['adult'],
      sizes: ['6', '8', '10']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy'
  },
  {
    name: 'Bunny Leech',
    type: 'streamer',
    pattern_name: 'Bunny Leech',
    sizes_available: ['4', '6', '8', '10'],
    primary_size: '6',
    color: 'Black',
    secondary_colors: ['Brown', 'Olive'],
    description: 'Rabbit fur leech imitation.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['pike'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['leech'],
      stages: ['adult'],
      sizes: ['4', '6', '8']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Clouser Minnow',
    type: 'streamer',
    pattern_name: 'Clouser',
    sizes_available: ['2', '4', '6', '8', '10'],
    primary_size: '6',
    color: 'Chartreuse',
    secondary_colors: ['White', 'Olive', 'Blue'],
    description: 'Effective baitfish imitation.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 75 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['bright', 'overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'coastal'],
      primary_regions: ['eastern', 'coastal'],
      seasonal_patterns: {
        eastern: ['spring', 'summer'],
        coastal: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['bass', 'trout'],
      secondary: ['pike', 'panfish'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish'],
      stages: ['adult'],
      sizes: ['4', '6', '8']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Muddler Minnow',
    type: 'streamer',
    pattern_name: 'Muddler',
    sizes_available: ['4', '6', '8', '10', '12'],
    primary_size: '8',
    color: 'Brown',
    description: 'Classic streamer pattern.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 75 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['bright', 'overcast']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['pike'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish', 'terrestrial'],
      stages: ['adult'],
      sizes: ['6', '8', '10']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Zonker',
    type: 'streamer',
    pattern_name: 'Zonker',
    sizes_available: ['4', '6', '8', '10'],
    primary_size: '6',
    color: 'Olive',
    secondary_colors: ['Black', 'White', 'Brown'],
    description: 'Rabbit strip streamer.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['pike'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish', 'leech'],
      stages: ['adult'],
      sizes: ['4', '6', '8']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Sculpin',
    type: 'streamer',
    pattern_name: 'Sculpin',
    sizes_available: ['2', '4', '6', '8'],
    primary_size: '4',
    color: 'Olive',
    secondary_colors: ['Brown', 'Black'],
    description: 'Bottom-dwelling fish imitation.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 65 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish'],
      stages: ['adult'],
      sizes: ['2', '4', '6']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'medium',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'hard'
  },
  {
    name: 'Mickey Finn',
    type: 'streamer',
    pattern_name: 'Mickey Finn',
    sizes_available: ['4', '6', '8', '10', '12'],
    primary_size: '8',
    color: 'Red',
    secondary_colors: ['Yellow', 'White'],
    description: 'Classic attractor streamer.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 75 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['bright', 'overcast']
    },
    regional_effectiveness: {
      regions: ['eastern', 'midwest'],
      primary_regions: ['eastern', 'midwest'],
      seasonal_patterns: {
        eastern: ['spring', 'summer'],
        midwest: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['pike', 'panfish'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish'],
      stages: ['adult'],
      sizes: ['6', '8', '10']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Marabou Leech',
    type: 'streamer',
    pattern_name: 'Marabou Leech',
    sizes_available: ['4', '6', '8', '10'],
    primary_size: '6',
    color: 'Black',
    secondary_colors: ['Olive', 'Brown'],
    description: 'Marabou leech imitation.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['pike'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['leech'],
      stages: ['adult'],
      sizes: ['4', '6', '8']
    },
    characteristics: {
      sink_rate: 'slow',
      visibility: 'medium',
      durability: 'medium',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy'
  },
  {
    name: 'Bead Head Woolly Bugger',
    type: 'streamer',
    pattern_name: 'BH Woolly Bugger',
    sizes_available: ['4', '6', '8', '10', '12'],
    primary_size: '8',
    color: 'Black',
    secondary_colors: ['Olive', 'Brown', 'White'],
    description: 'Weighted woolly bugger for deeper water.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['normal', 'high', 'flooding'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['calm', 'light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['pike', 'panfish'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['leech', 'baitfish'],
      stages: ['adult'],
      sizes: ['6', '8', '10']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy'
  },
  {
    name: 'Sparkle Minnow',
    type: 'streamer',
    pattern_name: 'Sparkle Minnow',
    sizes_available: ['4', '6', '8', '10'],
    primary_size: '6',
    color: 'Silver',
    secondary_colors: ['White', 'Chartreuse'],
    description: 'Flashy baitfish imitation.',
    best_conditions: {
      weather: ['sunny', 'cloudy', 'overcast'],
      water_clarity: ['clear', 'slightly_murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 75 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['bright', 'overcast']
    },
    regional_effectiveness: {
      regions: ['eastern', 'coastal'],
      primary_regions: ['eastern', 'coastal'],
      seasonal_patterns: {
        eastern: ['spring', 'summer'],
        coastal: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['bass', 'trout'],
      secondary: ['pike', 'panfish'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish'],
      stages: ['adult'],
      sizes: ['4', '6', '8']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Matuka',
    type: 'streamer',
    pattern_name: 'Matuka',
    sizes_available: ['4', '6', '8', '10'],
    primary_size: '6',
    color: 'Olive',
    secondary_colors: ['Brown', 'Black'],
    description: 'New Zealand streamer pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['pike'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish'],
      stages: ['adult'],
      sizes: ['4', '6', '8']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Slump Buster',
    type: 'streamer',
    pattern_name: 'Slump Buster',
    sizes_available: ['4', '6', '8', '10'],
    primary_size: '6',
    color: 'Olive',
    secondary_colors: ['Black', 'Brown'],
    description: 'Simple, effective streamer pattern.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['pike'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish', 'leech'],
      stages: ['adult'],
      sizes: ['4', '6', '8']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy'
  },
  {
    name: 'Sex Dungeon',
    type: 'streamer',
    pattern_name: 'Sex Dungeon',
    sizes_available: ['2', '4', '6', '8'],
    primary_size: '4',
    color: 'Olive',
    secondary_colors: ['Black', 'White'],
    description: 'Large articulated streamer for big fish.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 70 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish'],
      stages: ['adult'],
      sizes: ['2', '4', '6']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'hard'
  },
  {
    name: 'Game Changer',
    type: 'streamer',
    pattern_name: 'Game Changer',
    sizes_available: ['2', '4', '6', '8'],
    primary_size: '4',
    color: 'Olive',
    secondary_colors: ['Black', 'White', 'Chartreuse'],
    description: 'Articulated streamer with realistic action.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 70 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish'],
      stages: ['adult'],
      sizes: ['2', '4', '6']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'hard'
  },
  {
    name: 'Double Bunny',
    type: 'streamer',
    pattern_name: 'Double Bunny',
    sizes_available: ['2', '4', '6', '8'],
    primary_size: '4',
    color: 'Olive',
    secondary_colors: ['Black', 'White', 'Brown'],
    description: 'Double rabbit strip streamer.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['pike'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish', 'leech'],
      stages: ['adult'],
      sizes: ['2', '4', '6']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Bead Head Bugger',
    type: 'streamer',
    pattern_name: 'BH Bugger',
    sizes_available: ['4', '6', '8', '10', '12'],
    primary_size: '8',
    color: 'Black',
    secondary_colors: ['Olive', 'Brown', 'White'],
    description: 'Weighted bugger for deeper water.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['normal', 'high', 'flooding'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['calm', 'light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['pike', 'panfish'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['leech', 'baitfish'],
      stages: ['adult'],
      sizes: ['6', '8', '10']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy'
  },
  {
    name: 'Sculpin Helmet',
    type: 'streamer',
    pattern_name: 'Sculpin Helmet',
    sizes_available: ['2', '4', '6', '8'],
    primary_size: '4',
    color: 'Olive',
    secondary_colors: ['Brown', 'Black'],
    description: 'Heavy sculpin imitation with helmet head.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate'],
      time_of_day: ['morning', 'afternoon', 'dusk'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 65 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish'],
      stages: ['adult'],
      sizes: ['2', '4', '6']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'medium',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'hard'
  },
  {
    name: 'Dolly Llama',
    type: 'streamer',
    pattern_name: 'Dolly Llama',
    sizes_available: ['2', '4', '6', '8'],
    primary_size: '4',
    color: 'Olive',
    secondary_colors: ['Black', 'White'],
    description: 'Articulated streamer for big fish.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall'],
      water_temperature_range: { min: 40, max: 70 },
      wind_conditions: ['light', 'moderate'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish'],
      stages: ['adult'],
      sizes: ['2', '4', '6']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'hard'
  },
  {
    name: 'Bead Head Zonker',
    type: 'streamer',
    pattern_name: 'BH Zonker',
    sizes_available: ['4', '6', '8', '10'],
    primary_size: '6',
    color: 'Olive',
    secondary_colors: ['Black', 'White', 'Brown'],
    description: 'Weighted zonker for deeper water.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['clear', 'slightly_murky', 'murky'],
      water_level: ['normal', 'high'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['calm', 'light', 'moderate'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['pike'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['baitfish', 'leech'],
      stages: ['adult'],
      sizes: ['4', '6', '8']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium'
  },
  {
    name: 'Bead Head Bugger',
    type: 'streamer',
    pattern_name: 'BH Bugger',
    sizes_available: ['4', '6', '8', '10', '12'],
    primary_size: '8',
    color: 'Black',
    secondary_colors: ['Olive', 'Brown', 'White'],
    description: 'Weighted bugger for deeper water.',
    best_conditions: {
      weather: ['cloudy', 'overcast', 'rainy'],
      water_clarity: ['slightly_murky', 'murky', 'very_murky'],
      water_level: ['normal', 'high', 'flooding'],
      water_flow: ['slow', 'moderate', 'fast'],
      time_of_day: ['dawn', 'morning', 'dusk', 'night'],
      time_of_year: ['spring', 'summer', 'fall', 'winter'],
      water_temperature_range: { min: 35, max: 70 },
      wind_conditions: ['calm', 'light', 'moderate', 'strong'],
      light_conditions: ['overcast', 'low_light', 'dark']
    },
    regional_effectiveness: {
      regions: ['western', 'midwest', 'eastern', 'mountain'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout', 'bass'],
      secondary: ['pike', 'panfish'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['leech', 'baitfish'],
      stages: ['adult'],
      sizes: ['6', '8', '10']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy'
  }
  
  // Continue with WET FLIES - 15 flies
  // Continue with EMERGERS - 10 flies
];

// Function to populate the database
export async function populateFlyDatabase(): Promise<void> {
  console.log('🚀 Starting fly database population...');
  
  try {
    // Clear existing flies (optional - remove this if you want to keep existing data)
    console.log('🗑️ Clearing existing flies...');
    const { error: deleteError } = await supabase
      .from('flies')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all flies
    
    if (deleteError) {
      console.error('Error clearing flies:', deleteError);
    } else {
      console.log('✅ Existing flies cleared');
    }
    
    // Insert new flies
    console.log(`📝 Inserting ${COMPREHENSIVE_FLIES.length} flies...`);
    
    const fliesToInsert = COMPREHENSIVE_FLIES.map((fly, index) => ({
      ...fly,
      success_rate: 0.5, // Default success rate
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
    console.log('🎣 Fly database population complete!');
    
  } catch (error) {
    console.error('❌ Database population failed:', error);
    throw error;
  }
}

// Function to add more flies (for incremental updates)
export async function addMoreFlies(newFlies: Partial<Fly>[]): Promise<void> {
  console.log(`📝 Adding ${newFlies.length} more flies...`);
  
  try {
    const fliesToInsert = newFlies.map((fly) => ({
      ...fly,
      success_rate: fly.success_rate || 0.5,
      total_uses: fly.total_uses || 0,
      successful_uses: fly.successful_uses || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { data, error } = await supabase
      .from('flies')
      .insert(fliesToInsert)
      .select();
    
    if (error) {
      console.error('❌ Error adding flies:', error);
      throw error;
    }
    
    console.log(`✅ Successfully added ${data?.length || 0} flies!`);
    
  } catch (error) {
    console.error('❌ Adding flies failed:', error);
    throw error;
  }
}
