const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://aflfbalfpjhznkbwatqf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY');

// Comprehensive fly database with all hierarchical algorithm requirements
const comprehensiveFlies = [
  // ========================================
  // DRY FLIES - Surface Fishing Specialists
  // ========================================
  
  {
    name: 'Adams',
    type: 'dry',
    pattern_name: 'Parachute Adams',
    sizes_available: ['12', '14', '16', '18', '20', '22'],
    primary_size: '16',
    color: 'Gray',
    secondary_colors: ['Light Gray', 'Dark Gray'],
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
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain', 'midwest'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling', 'char'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly', 'baetis', 'bwo'],
      stages: ['dun', 'spinner'],
      sizes: ['16', '18', '20', '22']
    },
    characteristics: {
      floatability: 'high',
      visibility: 'high',
      durability: 'medium',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium',
    success_rate: 0.75,
    total_uses: 150,
    successful_uses: 112
  },

  {
    name: 'Elk Hair Caddis',
    type: 'dry',
    pattern_name: 'X-Caddis',
    sizes_available: ['10', '12', '14', '16', '18'],
    primary_size: '14',
    color: 'Brown',
    secondary_colors: ['Tan', 'Olive', 'Black'],
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
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain', 'midwest', 'southern'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling', 'char', 'bass'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['caddis', 'trichoptera'],
      stages: ['adult', 'emerger'],
      sizes: ['12', '14', '16', '18']
    },
    characteristics: {
      floatability: 'high',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy',
    success_rate: 0.80,
    total_uses: 200,
    successful_uses: 160
  },

  {
    name: 'Daves Hopper',
    type: 'terrestrial',
    pattern_name: 'Parachute Hopper',
    sizes_available: ['6', '8', '10', '12'],
    primary_size: '10',
    color: 'Yellow',
    secondary_colors: ['Green', 'Brown', 'Tan'],
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
    regional_effectiveness: {
      regions: ['western', 'mountain', 'midwest'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['summer', 'fall'],
        mountain: ['summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass', 'panfish'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['grasshopper', 'terrestrial'],
      stages: ['adult'],
      sizes: ['6', '8', '10', '12']
    },
    characteristics: {
      floatability: 'high',
      visibility: 'high',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'medium',
    success_rate: 0.70,
    total_uses: 120,
    successful_uses: 84
  },

  {
    name: 'Morrish Mouse',
    type: 'streamer',
    pattern_name: 'Mouse Pattern',
    sizes_available: ['2', '4', '6', '8'],
    primary_size: '6',
    color: 'Brown',
    secondary_colors: ['Black', 'Tan', 'Gray'],
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
    regional_effectiveness: {
      regions: ['western', 'mountain', 'eastern'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['summer', 'fall'],
        mountain: ['summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['mouse', 'terrestrial'],
      stages: ['adult'],
      sizes: ['2', '4', '6', '8']
    },
    characteristics: {
      floatability: 'medium',
      sink_rate: 'slow',
      visibility: 'high',
      durability: 'high',
      versatility: 'low'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'hard',
    success_rate: 0.85,
    total_uses: 80,
    successful_uses: 68
  },

  // ========================================
  // NYMPHS - Subsurface Fishing Specialists
  // ========================================

  {
    name: 'Pheasant Tail Nymph',
    type: 'nymph',
    pattern_name: 'PT Nymph',
    sizes_available: ['12', '14', '16', '18', '20', '22'],
    primary_size: '18',
    color: 'Brown',
    secondary_colors: ['Olive', 'Black', 'Copper'],
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
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain', 'midwest', 'southern'],
      primary_regions: ['western', 'eastern', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall', 'winter'],
        eastern: ['spring', 'summer', 'fall', 'winter'],
        mountain: ['spring', 'summer', 'fall', 'winter']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling', 'char', 'bass'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly', 'baetis', 'bwo', 'pale morning dun'],
      stages: ['nymph'],
      sizes: ['14', '16', '18', '20', '22']
    },
    characteristics: {
      sink_rate: 'medium',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy',
    success_rate: 0.85,
    total_uses: 300,
    successful_uses: 255
  },

  {
    name: 'Pats Rubber Legs',
    type: 'nymph',
    pattern_name: 'Rubber Leg Stonefly',
    sizes_available: ['4', '6', '8', '10', '12'],
    primary_size: '8',
    color: 'Brown',
    secondary_colors: ['Black', 'Olive', 'Golden'],
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
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer'],
        mountain: ['spring', 'summer']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['stonefly', 'golden stone', 'salmonfly'],
      stages: ['nymph'],
      sizes: ['4', '6', '8', '10']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium',
    success_rate: 0.80,
    total_uses: 180,
    successful_uses: 144
  },

  {
    name: 'Zebra Midge',
    type: 'nymph',
    pattern_name: 'Midge Larva',
    sizes_available: ['18', '20', '22', '24', '26'],
    primary_size: '22',
    color: 'Black',
    secondary_colors: ['Red', 'Olive', 'Brown', 'Purple'],
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
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain', 'midwest'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['winter', 'spring', 'fall'],
        mountain: ['winter', 'spring', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling', 'char'],
      size_preference: 'small'
    },
    hatch_matching: {
      insects: ['midge', 'chironomid'],
      stages: ['nymph', 'larva'],
      sizes: ['18', '20', '22', '24', '26']
    },
    characteristics: {
      sink_rate: 'slow',
      visibility: 'low',
      durability: 'medium',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium',
    success_rate: 0.90,
    total_uses: 250,
    successful_uses: 225
  },

  // ========================================
  // STREAMERS - Aggressive Fishing Patterns
  // ========================================

  {
    name: 'Woolly Bugger',
    type: 'streamer',
    pattern_name: 'Bugger',
    sizes_available: ['4', '6', '8', '10', '12', '14'],
    primary_size: '8',
    color: 'Black',
    secondary_colors: ['Olive', 'Brown', 'White', 'Chartreuse'],
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
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain', 'midwest', 'southern'],
      primary_regions: ['western', 'eastern', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall', 'winter'],
        eastern: ['spring', 'summer', 'fall', 'winter'],
        mountain: ['spring', 'summer', 'fall', 'winter']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass', 'pike', 'grayling'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['leech', 'baitfish', 'crayfish'],
      stages: ['adult', 'nymph'],
      sizes: ['6', '8', '10', '12']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy',
    success_rate: 0.75,
    total_uses: 220,
    successful_uses: 165
  },

  {
    name: 'Sculpin Streamer',
    type: 'streamer',
    pattern_name: 'Sculpin',
    sizes_available: ['2', '4', '6', '8'],
    primary_size: '6',
    color: 'Olive',
    secondary_colors: ['Brown', 'Black', 'Tan'],
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
      secondary: ['bass', 'pike'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['sculpin', 'baitfish'],
      stages: ['adult'],
      sizes: ['2', '4', '6', '8']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'advanced',
    tying_difficulty: 'hard',
    success_rate: 0.85,
    total_uses: 100,
    successful_uses: 85
  },

  // ========================================
  // EMERGERS - Transition Stage Specialists
  // ========================================

  {
    name: 'RS2 Emerger',
    type: 'emerger',
    pattern_name: 'Rainy\'s Super 2',
    sizes_available: ['16', '18', '20', '22'],
    primary_size: '18',
    color: 'Gray',
    secondary_colors: ['Olive', 'Brown', 'Tan'],
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
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        mountain: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling', 'char'],
      size_preference: 'small'
    },
    hatch_matching: {
      insects: ['mayfly', 'baetis', 'bwo', 'pale morning dun'],
      stages: ['emerger'],
      sizes: ['16', '18', '20', '22']
    },
    characteristics: {
      floatability: 'medium',
      sink_rate: 'slow',
      visibility: 'medium',
      durability: 'medium',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium',
    success_rate: 0.80,
    total_uses: 160,
    successful_uses: 128
  },

  // ========================================
  // SPECIALIZED PATTERNS
  // ========================================

  {
    name: 'San Juan Worm',
    type: 'nymph',
    pattern_name: 'SJW',
    sizes_available: ['10', '12', '14', '16', '18'],
    primary_size: '14',
    color: 'Red',
    secondary_colors: ['Magenta', 'Orange', 'Brown'],
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
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain', 'midwest'],
      primary_regions: ['western', 'eastern'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall'],
        eastern: ['spring', 'summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass', 'panfish'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['worm', 'aquatic worm'],
      stages: ['adult'],
      sizes: ['10', '12', '14', '16']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'high',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy',
    success_rate: 0.70,
    total_uses: 140,
    successful_uses: 98
  },

  {
    name: 'Stimulator',
    type: 'dry',
    pattern_name: 'Stimmy',
    sizes_available: ['4', '6', '8', '10', '12', '14'],
    primary_size: '10',
    color: 'Yellow',
    secondary_colors: ['Orange', 'Red', 'Green'],
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
      secondary: ['grayling'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['stonefly', 'caddis', 'attractor'],
      stages: ['adult', 'attractor'],
      sizes: ['6', '8', '10', '12']
    },
    characteristics: {
      floatability: 'high',
      visibility: 'high',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium',
    success_rate: 0.75,
    total_uses: 180,
    successful_uses: 135
  },

  // Fixed Chubby Chernobyl with proper conditions
  {
    name: 'Chubby Chernobyl',
    type: 'dry',
    pattern_name: 'Chubby',
    sizes_available: ['4', '6', '8', '10', '12'],
    primary_size: '8',
    color: 'Yellow',
    secondary_colors: ['Orange', 'Pink', 'White'],
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
    regional_effectiveness: {
      regions: ['western', 'mountain'],
      primary_regions: ['western', 'mountain'],
      seasonal_patterns: {
        western: ['summer', 'fall'],
        mountain: ['summer', 'fall']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['bass'],
      size_preference: 'large'
    },
    hatch_matching: {
      insects: ['grasshopper', 'stonefly', 'attractor'],
      stages: ['adult', 'attractor'],
      sizes: ['6', '8', '10', '12']
    },
    characteristics: {
      floatability: 'high',
      visibility: 'high',
      durability: 'high',
      versatility: 'medium'
    },
    difficulty_level: 'intermediate',
    tying_difficulty: 'medium',
    success_rate: 0.65,
    total_uses: 120,
    successful_uses: 78
  },

  {
    name: 'Bead Head Pheasant Tail',
    type: 'nymph',
    pattern_name: 'BHPT',
    sizes_available: ['12', '14', '16', '18', '20'],
    primary_size: '16',
    color: 'Brown',
    secondary_colors: ['Olive', 'Black', 'Copper'],
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
    regional_effectiveness: {
      regions: ['western', 'eastern', 'mountain', 'midwest', 'southern'],
      primary_regions: ['western', 'eastern', 'mountain'],
      seasonal_patterns: {
        western: ['spring', 'summer', 'fall', 'winter'],
        eastern: ['spring', 'summer', 'fall', 'winter'],
        mountain: ['spring', 'summer', 'fall', 'winter']
      }
    },
    target_species: {
      primary: ['trout'],
      secondary: ['grayling', 'char', 'bass'],
      size_preference: 'medium'
    },
    hatch_matching: {
      insects: ['mayfly', 'baetis', 'bwo', 'pale morning dun'],
      stages: ['nymph'],
      sizes: ['14', '16', '18', '20']
    },
    characteristics: {
      sink_rate: 'fast',
      visibility: 'medium',
      durability: 'high',
      versatility: 'high'
    },
    difficulty_level: 'beginner',
    tying_difficulty: 'easy',
    success_rate: 0.85,
    total_uses: 280,
    successful_uses: 238
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
      .select('name, type, primary_size, color, success_rate')
      .limit(10);
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else {
      console.log('🎣 Sample flies after update:');
      flies.forEach(fly => {
        console.log('  -', fly.name, '(' + fly.type + ', size ' + fly.primary_size + ', ' + fly.color + ', success: ' + (fly.success_rate * 100).toFixed(1) + '%)');
      });
      
      console.log('\n📊 Database Statistics:');
      const { data: stats } = await supabase
        .from('flies')
        .select('type')
        .then(result => {
          const typeCounts = {};
          result.data.forEach(fly => {
            typeCounts[fly.type] = (typeCounts[fly.type] || 0) + 1;
          });
          return { data: typeCounts };
        });
      
      console.log('Fly types:', stats);
    }
    
  } catch (error) {
    console.error('Update failed:', error);
  }
}

updateDatabase();
