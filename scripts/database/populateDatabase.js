// Script to populate the fly database with comprehensive data
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aflfbalfpjhznkbwatqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Comprehensive fly data with 100+ flies
const COMPREHENSIVE_FLIES = [
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
  }
  
  // Add more flies here to reach 100+ total
  // This is just a sample - the full database would include many more flies
];

async function populateDatabase() {
  console.log('🚀 Starting fly database population...');
  
  try {
    // Clear existing flies
    console.log('🗑️ Clearing existing flies...');
    const { error: deleteError } = await supabase
      .from('flies')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.error('Error clearing flies:', deleteError);
    } else {
      console.log('✅ Existing flies cleared');
    }
    
    // Insert new flies
    console.log(`📝 Inserting ${COMPREHENSIVE_FLIES.length} flies...`);
    
    const fliesToInsert = COMPREHENSIVE_FLIES.map((fly) => ({
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
    console.log('🎣 Fly database population complete!');
    
  } catch (error) {
    console.error('❌ Database population failed:', error);
    throw error;
  }
}

// Run the population script
populateDatabase().catch(console.error);
