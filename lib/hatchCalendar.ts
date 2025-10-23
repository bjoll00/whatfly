/**
 * Utah Hatch Calendar
 * Based on USGS aquatic insect studies, Utah DWR data, and field observations
 * FREE data source - compiled from public records
 */

export interface HatchPattern {
  name: string;
  scientific?: string;
  emergence: {
    startMonth: number;  // 1-12
    startDay: number;
    peakMonth: number;
    peakDay: number;
    endMonth: number;
    endDay: number;
  };
  waterTempRange: [number, number];  // Fahrenheit
  optimalTimeOfDay: string[];
  rivers: string[];  // Where this hatch occurs
  flyPatterns: string[];  // Recommended fly patterns
  size: string;
  importance: 'critical' | 'major' | 'moderate' | 'minor';
  stages: Array<'nymph' | 'emerger' | 'dun' | 'spinner'>;
  waterConditions: string[]; // Preferred water conditions
  weatherConditions: string[]; // Preferred weather conditions
}

export interface ActiveHatch {
  insect: string;
  stage: 'nymph' | 'emerger' | 'dun' | 'spinner';
  size: string;
  intensity: 'light' | 'moderate' | 'heavy';
  time_period: string;
  water_temperature_range: {
    min: number;
    max: number;
  };
}

export interface SeasonalHatch {
  insect: string;
  months: string[];
  peak_months: string[];
  typical_sizes: string[];
  water_preferences: string[];
}

export interface LocalHatchInfo {
  region: string;
  river_system: string;
  seasonal_patterns: Array<{
    season: string;
    dominant_hatches: string[];
    water_conditions: string[];
  }>;
}

export const UTAH_HATCH_CALENDAR: Record<string, HatchPattern> = {
  // SPRING HATCHES
  'BWO_SPRING': {
    name: 'Blue Winged Olive (Spring)',
    scientific: 'Baetis spp.',
    emergence: {
      startMonth: 3, startDay: 1,
      peakMonth: 4, peakDay: 15,
      endMonth: 5, endDay: 31
    },
    waterTempRange: [45, 58],
    optimalTimeOfDay: ['midday', 'afternoon'],
    rivers: ['Provo', 'Weber', 'Logan', 'Green', 'Bear'],
    flyPatterns: ['BWO', 'Baetis', 'RS2', 'Pheasant Tail', 'Zebra Midge'],
    size: '#18-22',
    importance: 'critical',
    stages: ['nymph', 'emerger', 'dun', 'spinner'],
    waterConditions: ['clear', 'slightly_murky', 'moderate', 'fast'],
    weatherConditions: ['cloudy', 'overcast', 'rainy']
  },
  
  'MIDGE_YEAR_ROUND': {
    name: 'Midges (Year-Round)',
    scientific: 'Chironomidae',
    emergence: {
      startMonth: 1, startDay: 1,
      peakMonth: 3, peakDay: 15,
      endMonth: 12, endDay: 31
    },
    waterTempRange: [32, 70],
    optimalTimeOfDay: ['morning', 'midday', 'afternoon'],
    rivers: ['All'],
    flyPatterns: ['Zebra Midge', 'RS2', 'Disco Midge', 'Griffiths Gnat'],
    size: '#18-24',
    importance: 'critical'
  },
  
  'EARLY_BLACK_STONE': {
    name: 'Early Black Stonefly',
    scientific: 'Capnia spp.',
    emergence: {
      startMonth: 2, startDay: 15,
      peakMonth: 3, peakDay: 15,
      endMonth: 4, endDay: 15
    },
    waterTempRange: [38, 50],
    optimalTimeOfDay: ['midday', 'afternoon'],
    rivers: ['Provo', 'Weber', 'Logan'],
    flyPatterns: ['Black Stonefly', 'Pats Rubber Legs', 'Prince Nymph'],
    size: '#14-16',
    importance: 'major'
  },
  
  // LATE SPRING / EARLY SUMMER
  'PMD': {
    name: 'Pale Morning Dun',
    scientific: 'Ephemerella infrequens/inermis',
    emergence: {
      startMonth: 5, startDay: 15,
      peakMonth: 6, peakDay: 20,
      endMonth: 7, endDay: 31
    },
    waterTempRange: [55, 65],
    optimalTimeOfDay: ['morning', 'evening'],
    rivers: ['Provo', 'Weber', 'Green', 'Logan'],
    flyPatterns: ['PMD', 'Comparadun', 'Sparkle Dun', 'Pheasant Tail', 'Barr Emerger'],
    size: '#16-18',
    importance: 'critical'
  },
  
  'GOLDEN_STONE': {
    name: 'Golden Stonefly',
    scientific: 'Hesperoperla pacifica',
    emergence: {
      startMonth: 6, startDay: 1,
      peakMonth: 7, peakDay: 1,
      endMonth: 8, endDay: 15
    },
    waterTempRange: [55, 68],
    optimalTimeOfDay: ['evening', 'dusk'],
    rivers: ['Provo', 'Weber', 'Green'],
    flyPatterns: ['Stimulator', 'Pats Rubber Legs', 'Golden Stone'],
    size: '#6-10',
    importance: 'major'
  },
  
  'SALMONFLY': {
    name: 'Salmonfly',
    scientific: 'Pteronarcys californica',
    emergence: {
      startMonth: 5, startDay: 20,
      peakMonth: 6, peakDay: 10,
      endMonth: 7, endDay: 1
    },
    waterTempRange: [50, 60],
    optimalTimeOfDay: ['afternoon', 'evening'],
    rivers: ['Green', 'Weber'],
    flyPatterns: ['Chubby Chernobyl', 'Salmonfly Adult', 'Pats Rubber Legs'],
    size: '#4-8',
    importance: 'major'
  },
  
  'CADDIS': {
    name: 'Caddisfly',
    scientific: 'Trichoptera spp.',
    emergence: {
      startMonth: 4, startDay: 15,
      peakMonth: 6, peakDay: 15,
      endMonth: 10, endDay: 15
    },
    waterTempRange: [50, 70],
    optimalTimeOfDay: ['evening', 'dusk'],
    rivers: ['All'],
    flyPatterns: ['Elk Hair Caddis', 'X-Caddis', 'LaFontaine Sparkle Pupa', 'Caddis Emerger'],
    size: '#14-18',
    importance: 'critical'
  },
  
  // SUMMER HATCHES
  'HOPPER': {
    name: 'Grasshoppers',
    scientific: 'Acrididae',
    emergence: {
      startMonth: 7, startDay: 1,
      peakMonth: 8, peakDay: 15,
      endMonth: 9, endDay: 30
    },
    waterTempRange: [60, 75],
    optimalTimeOfDay: ['midday', 'afternoon'],
    rivers: ['Provo', 'Weber', 'Logan', 'Green', 'Bear'],
    flyPatterns: ['Daves Hopper', 'Parachute Hopper', 'Club Sandwich'],
    size: '#8-12',
    importance: 'critical'
  },
  
  'ANTS_BEETLES': {
    name: 'Ants & Beetles',
    scientific: 'Terrestrial insects',
    emergence: {
      startMonth: 6, startDay: 1,
      peakMonth: 8, peakDay: 1,
      endMonth: 9, endDay: 30
    },
    waterTempRange: [60, 75],
    optimalTimeOfDay: ['midday', 'afternoon'],
    rivers: ['All'],
    flyPatterns: ['Parachute Ant', 'Foam Beetle', 'Cinnamon Ant'],
    size: '#14-18',
    importance: 'major'
  },
  
  'TRICO': {
    name: 'Trico',
    scientific: 'Tricorythodes spp.',
    emergence: {
      startMonth: 7, startDay: 15,
      peakMonth: 8, peakDay: 15,
      endMonth: 9, endDay: 15
    },
    waterTempRange: [60, 70],
    optimalTimeOfDay: ['dawn', 'morning'],
    rivers: ['Provo', 'Weber', 'Green'],
    flyPatterns: ['Trico Spinner', 'Trico Parachute', 'Black Beauty'],
    size: '#20-24',
    importance: 'moderate'
  },
  
  // FALL HATCHES
  'BWO_FALL': {
    name: 'Blue Winged Olive (Fall)',
    scientific: 'Baetis spp.',
    emergence: {
      startMonth: 9, startDay: 1,
      peakMonth: 10, peakDay: 15,
      endMonth: 11, endDay: 30
    },
    waterTempRange: [45, 58],
    optimalTimeOfDay: ['midday', 'afternoon'],
    rivers: ['Provo', 'Weber', 'Logan', 'Green'],
    flyPatterns: ['BWO', 'Baetis', 'RS2', 'Pheasant Tail'],
    size: '#18-22',
    importance: 'critical'
  },
  
  'OCTOBER_CADDIS': {
    name: 'October Caddis',
    scientific: 'Dicosmoecus spp.',
    emergence: {
      startMonth: 9, startDay: 15,
      peakMonth: 10, peakDay: 15,
      endMonth: 11, endDay: 15
    },
    waterTempRange: [45, 55],
    optimalTimeOfDay: ['afternoon', 'evening'],
    rivers: ['Green', 'Provo', 'Weber'],
    flyPatterns: ['Orange Stimulator', 'October Caddis Adult', 'Rubber Leg Stone'],
    size: '#8-12',
    importance: 'major'
  },
  
  // WINTER
  'WINTER_MIDGE': {
    name: 'Winter Midge',
    scientific: 'Chironomidae',
    emergence: {
      startMonth: 11, startDay: 1,
      peakMonth: 1, peakDay: 15,
      endMonth: 3, endDay: 1
    },
    waterTempRange: [32, 45],
    optimalTimeOfDay: ['midday', 'afternoon'],
    rivers: ['Provo', 'Green', 'Weber'],
    flyPatterns: ['Zebra Midge', 'RS2', 'Ju-Ju Baetis', 'San Juan Worm'],
    size: '#20-24',
    importance: 'critical'
  }
};

/**
 * Check if a hatch is currently active
 */
export function isHatchActive(
  date: Date,
  waterTemp: number | undefined,
  hatch: HatchPattern
): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Check if date is within hatch period
  const dateValue = month * 100 + day;
  const startValue = hatch.emergence.startMonth * 100 + hatch.emergence.startDay;
  const endValue = hatch.emergence.endMonth * 100 + hatch.emergence.endDay;
  
  const dateInRange = dateValue >= startValue && dateValue <= endValue;
  
  // Check water temperature if available
  const tempInRange = !waterTemp || 
    (waterTemp >= hatch.waterTempRange[0] && waterTemp <= hatch.waterTempRange[1]);
  
  return dateInRange && tempInRange;
}

/**
 * Check if currently in peak hatch period
 */
export function isHatchPeak(date: Date, hatch: HatchPattern): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Consider 2 weeks before and after peak as "peak period"
  const dateValue = month * 100 + day;
  const peakValue = hatch.emergence.peakMonth * 100 + hatch.emergence.peakDay;
  
  return Math.abs(dateValue - peakValue) <= 14;
}

/**
 * Get all currently active hatches
 */
export function getActiveHatches(
  date: Date,
  waterTemp: number | undefined,
  location?: string
): HatchPattern[] {
  const activeHatches: HatchPattern[] = [];
  
  for (const hatch of Object.values(UTAH_HATCH_CALENDAR)) {
    if (isHatchActive(date, waterTemp, hatch)) {
      // Filter by location if specified
      if (!location || hatch.rivers.includes('All') || 
          hatch.rivers.some(river => location.includes(river))) {
        activeHatches.push(hatch);
      }
    }
  }
  
  // Sort by importance and peak status
  return activeHatches.sort((a, b) => {
    const aIsPeak = isHatchPeak(date, a);
    const bIsPeak = isHatchPeak(date, b);
    
    if (aIsPeak && !bIsPeak) return -1;
    if (!aIsPeak && bIsPeak) return 1;
    
    const importanceOrder = { critical: 0, major: 1, moderate: 2, minor: 3 };
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  });
}

/**
 * Get hatch-based fly bonus score
 */
export function getHatchBonus(flyName: string, activeHatches: HatchPattern[]): number {
  let maxBonus = 0;
  
  for (const hatch of activeHatches) {
    // Check if fly name matches any recommended patterns
    for (const pattern of hatch.flyPatterns) {
      if (flyName.toLowerCase().includes(pattern.toLowerCase()) ||
          pattern.toLowerCase().includes(flyName.toLowerCase())) {
        
        let bonus = 0;
        
        // Base bonus by importance
        switch (hatch.importance) {
          case 'critical': bonus = 0.25; break;
          case 'major': bonus = 0.15; break;
          case 'moderate': bonus = 0.10; break;
          case 'minor': bonus = 0.05; break;
        }
        
        maxBonus = Math.max(maxBonus, bonus);
      }
    }
  }
  
  return maxBonus;
}

/**
 * Get comprehensive hatch data for a specific location and date
 */
export function getComprehensiveHatchData(
  riverSystem: string,
  latitude: number,
  longitude: number,
  date: Date,
  waterTemperature?: number,
  timeOfDay?: string
): {
  active_hatches: ActiveHatch[];
  seasonal_hatches: SeasonalHatch[];
  local_hatch_info: LocalHatchInfo;
} {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const currentSeason = getSeasonFromDate(date);
  
  // Get active hatches based on current date and conditions
  const activeHatches: ActiveHatch[] = [];
  const seasonalHatches: SeasonalHatch[] = [];
  
  // Check each hatch pattern
  Object.values(UTAH_HATCH_CALENDAR).forEach(hatch => {
    // Check if this hatch is active for the current river system
    if (hatch.rivers.some(river => 
      river.toLowerCase().includes(riverSystem.toLowerCase()) || 
      riverSystem.toLowerCase().includes(river.toLowerCase())
    )) {
      
      // Check if we're in the emergence period
      const isInEmergence = isDateInRange(
        month, day,
        hatch.emergence.startMonth, hatch.emergence.startDay,
        hatch.emergence.endMonth, hatch.emergence.endDay
      );
      
      if (isInEmergence) {
        // Determine intensity based on how close we are to peak
        const daysFromPeak = Math.abs(
          getDaysFromStartOfYear(month, day) - 
          getDaysFromStartOfYear(hatch.emergence.peakMonth, hatch.emergence.peakDay)
        );
        
        let intensity: 'light' | 'moderate' | 'heavy' = 'light';
        if (daysFromPeak <= 7) intensity = 'heavy';
        else if (daysFromPeak <= 14) intensity = 'moderate';
        
        // Check water temperature compatibility
        const tempCompatible = !waterTemperature || 
          (waterTemperature >= hatch.waterTempRange[0] && waterTemperature <= hatch.waterTempRange[1]);
        
        // Check time of day compatibility
        const timeCompatible = !timeOfDay || hatch.optimalTimeOfDay.includes(timeOfDay);
        
        if (tempCompatible && timeCompatible) {
          // Add each stage of the hatch
          hatch.stages.forEach(stage => {
            activeHatches.push({
              insect: hatch.name,
              stage,
              size: hatch.size,
              intensity,
              time_period: hatch.optimalTimeOfDay.join(', '),
              water_temperature_range: {
                min: hatch.waterTempRange[0],
                max: hatch.waterTempRange[1]
              }
            });
          });
        }
      }
      
      // Add to seasonal hatches
      const months = [];
      for (let m = hatch.emergence.startMonth; m <= hatch.emergence.endMonth; m++) {
        months.push(getMonthName(m));
      }
      
      seasonalHatches.push({
        insect: hatch.name,
        months,
        peak_months: [getMonthName(hatch.emergence.peakMonth)],
        typical_sizes: [hatch.size],
        water_preferences: hatch.waterConditions
      });
    }
  });
  
  // Create local hatch info
  const localHatchInfo: LocalHatchInfo = {
    region: getRegionFromCoordinates(latitude, longitude),
    river_system: riverSystem,
    seasonal_patterns: [
      {
        season: currentSeason,
        dominant_hatches: activeHatches.map(h => h.insect),
        water_conditions: getWaterConditionsForSeason(currentSeason)
      }
    ]
  };
  
  return {
    active_hatches: activeHatches,
    seasonal_hatches: seasonalHatches,
    local_hatch_info: localHatchInfo
  };
}

// Helper functions
function isDateInRange(
  currentMonth: number, currentDay: number,
  startMonth: number, startDay: number,
  endMonth: number, endDay: number
): boolean {
  const currentDays = getDaysFromStartOfYear(currentMonth, currentDay);
  const startDays = getDaysFromStartOfYear(startMonth, startDay);
  const endDays = getDaysFromStartOfYear(endMonth, endDay);
  
  if (startDays <= endDays) {
    // Same year range
    return currentDays >= startDays && currentDays <= endDays;
  } else {
    // Cross-year range (e.g., Dec to Feb)
    return currentDays >= startDays || currentDays <= endDays;
  }
}

function getDaysFromStartOfYear(month: number, day: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let days = day - 1;
  for (let i = 0; i < month - 1; i++) {
    days += daysInMonth[i];
  }
  return days;
}

function getSeasonFromDate(date: Date): string {
  const month = date.getMonth() + 1;
  if (month >= 12 || month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  return 'fall';
}

function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

function getRegionFromCoordinates(latitude: number, longitude: number): string {
  // Utah regions based on coordinates
  if (latitude > 41.5) return 'Northern Utah';
  if (latitude < 38.0) return 'Southern Utah';
  if (longitude < -112.0) return 'Western Utah';
  if (longitude > -110.5) return 'Eastern Utah';
  return 'Central Utah';
}

function getWaterConditionsForSeason(season: string): string[] {
  switch (season) {
    case 'spring': return ['moderate', 'fast', 'clear'];
    case 'summer': return ['slow', 'moderate', 'clear', 'slightly_murky'];
    case 'fall': return ['moderate', 'clear'];
    case 'winter': return ['slow', 'clear'];
    default: return ['moderate', 'clear'];
  }
}

/**
 * Get hatch-based reasons
 */
export function getHatchReasons(flyName: string, activeHatches: HatchPattern[]): string[] {
  const reasons: string[] = [];
  
  for (const hatch of activeHatches) {
    for (const pattern of hatch.flyPatterns) {
      if (flyName.toLowerCase().includes(pattern.toLowerCase())) {
        if (isHatchPeak(new Date(), hatch)) {
          reasons.push(`Peak ${hatch.name} hatch right now`);
        } else {
          reasons.push(`Active ${hatch.name} hatch`);
        }
        break;
      }
    }
  }
  
  return reasons;
}

