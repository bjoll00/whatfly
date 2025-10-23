/**
 * Lunar and Solunar Service
 * FREE calculations for moon phases and feeding periods
 * Based on astronomical calculations - no API required
 */

export interface MoonPhaseData {
  phase: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 
         'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  illumination: number; // 0-100%
  age: number; // Days since new moon (0-29.5)
  fishingQuality: 'excellent' | 'good' | 'fair' | 'poor';
  feedingActivity: 'very_high' | 'high' | 'moderate' | 'low';
}

export interface SolunarPeriods {
  date: Date;
  major: { start: Date; end: Date }[];
  minor: { start: Date; end: Date }[];
  rating: 'excellent' | 'good' | 'average' | 'poor';
}

export class LunarService {
  /**
   * Calculate current moon phase (FREE - no API needed)
   */
  static getMoonPhase(date: Date = new Date()): MoonPhaseData {
    // Moon cycle is 29.53 days
    const LUNAR_CYCLE = 29.530588853;
    
    // Known new moon date for reference (Jan 1, 2000)
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');
    
    // Calculate days since known new moon
    const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    
    // Calculate moon age (days into current cycle)
    const age = daysSince % LUNAR_CYCLE;
    
    // Calculate illumination percentage
    const illumination = (1 - Math.cos(2 * Math.PI * age / LUNAR_CYCLE)) / 2 * 100;
    
    // Determine phase
    let phase: MoonPhaseData['phase'];
    if (age < 1.84566) phase = 'new';
    else if (age < 7.38264) phase = 'waxing_crescent';
    else if (age < 9.22830) phase = 'first_quarter';
    else if (age < 14.76528) phase = 'waxing_gibbous';
    else if (age < 16.61094) phase = 'full';
    else if (age < 22.14792) phase = 'waning_gibbous';
    else if (age < 23.99358) phase = 'last_quarter';
    else if (age < 29.53059) phase = 'waning_crescent';
    else phase = 'new';
    
    // Assess fishing quality based on moon phase
    const fishingQuality = this.assessLunarFishing(phase, illumination);
    const feedingActivity = this.assessFeedingActivity(phase, age);
    
    return {
      phase,
      illumination,
      age,
      fishingQuality,
      feedingActivity
    };
  }
  
  /**
   * Assess fishing quality based on moon phase
   */
  private static assessLunarFishing(
    phase: MoonPhaseData['phase'],
    illumination: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    // New and full moons = best fishing
    if (phase === 'new' || phase === 'full') return 'excellent';
    
    // First and last quarter = good fishing
    if (phase === 'first_quarter' || phase === 'last_quarter') return 'good';
    
    // Waxing phases = better than waning
    if (phase.includes('waxing')) return 'good';
    
    return 'fair';
  }
  
  /**
   * Assess fish feeding activity
   */
  private static assessFeedingActivity(
    phase: MoonPhaseData['phase'],
    age: number
  ): 'very_high' | 'high' | 'moderate' | 'low' {
    // New moon (days 0-2) and Full moon (days 14-16) = highest activity
    if ((age >= 0 && age <= 2) || (age >= 14 && age <= 16)) {
      return 'very_high';
    }
    
    // Quarter moons = high activity
    if ((age >= 6 && age <= 9) || (age >= 21 && age <= 24)) {
      return 'high';
    }
    
    // Waxing periods generally better
    if (age >= 2 && age <= 14) {
      return 'moderate';
    }
    
    return 'low';
  }
  
  /**
   * Calculate sunrise time (FREE - no API)
   */
  static getSunrise(date: Date, latitude: number, longitude: number): Date {
    if (!date || !(date instanceof Date)) {
      date = new Date();
    }
    // Simplified sunrise calculation
    const dayOfYear = this.getDayOfYear(date);
    const longitudeHours = longitude / 15;
    
    // Approximate sunrise hour (6am baseline)
    const seasonalVariation = Math.sin((dayOfYear - 80) * 2 * Math.PI / 365) * 2;
    const latitudeVariation = (latitude - 40) * 0.1;
    
    const sunriseHour = 6 + seasonalVariation + latitudeVariation - longitudeHours;
    
    const sunrise = new Date(date);
    sunrise.setHours(Math.floor(sunriseHour));
    sunrise.setMinutes((sunriseHour % 1) * 60);
    
    return sunrise;
  }
  
  /**
   * Calculate sunset time (FREE - no API)
   */
  static getSunset(date: Date, latitude: number, longitude: number): Date {
    if (!date || !(date instanceof Date)) {
      date = new Date();
    }
    // Simplified sunset calculation
    const dayOfYear = this.getDayOfYear(date);
    const longitudeHours = longitude / 15;
    
    // Approximate sunset hour (6pm baseline)
    const seasonalVariation = Math.sin((dayOfYear - 80) * 2 * Math.PI / 365) * 2;
    const latitudeVariation = (latitude - 40) * 0.1;
    
    const sunsetHour = 18 + seasonalVariation + latitudeVariation - longitudeHours;
    
    const sunset = new Date(date);
    sunset.setHours(Math.floor(sunsetHour));
    sunset.setMinutes((sunsetHour % 1) * 60);
    
    return sunset;
  }
  
  /**
   * Calculate solunar feeding periods
   */
  static getSolunarPeriods(
    date: Date,
    latitude: number,
    longitude: number
  ): SolunarPeriods {
    if (!date || !(date instanceof Date)) {
      date = new Date();
    }
    const sunrise = this.getSunrise(date, latitude, longitude);
    const sunset = this.getSunset(date, latitude, longitude);
    
    // Major periods: 2 hours centered on sunrise/sunset
    const major = [
      {
        start: new Date(sunrise.getTime() - 60 * 60 * 1000),
        end: new Date(sunrise.getTime() + 60 * 60 * 1000)
      },
      {
        start: new Date(sunset.getTime() - 60 * 60 * 1000),
        end: new Date(sunset.getTime() + 60 * 60 * 1000)
      }
    ];
    
    // Minor periods: midday and midnight
    const midday = new Date(date);
    midday.setHours(12, 0, 0);
    
    const midnight = new Date(date);
    midnight.setHours(0, 0, 0);
    
    const minor = [
      {
        start: new Date(midday.getTime() - 30 * 60 * 1000),
        end: new Date(midday.getTime() + 30 * 60 * 1000)
      },
      {
        start: new Date(midnight.getTime() - 30 * 60 * 1000),
        end: new Date(midnight.getTime() + 30 * 60 * 1000)
      }
    ];
    
    // Calculate rating based on moon phase and periods
    const moonPhase = this.getMoonPhase(date);
    const rating = this.calculateSolunarRating(moonPhase, date, major);
    
    return {
      date,
      major,
      minor,
      rating
    };
  }
  
  /**
   * Get comprehensive solunar data including detailed periods and celestial events
   */
  static getComprehensiveSolunarData(date: Date = new Date(), latitude: number, longitude: number): {
    major_periods: Array<{
      start: string;
      end: string;
      duration: number;
      peak: string;
    }>;
    minor_periods: Array<{
      start: string;
      end: string;
      duration: number;
      peak: string;
    }>;
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moon_phase: string;
    moon_illumination: number;
    lunar_feeding_activity: string;
    current_period?: {
      type: 'major' | 'minor' | null;
      remaining: number;
      active: boolean;
    };
  } {
    const solunarPeriods = this.getSolunarPeriods(date, latitude, longitude);
    const moonPhase = this.getMoonPhase(date);
    const currentPeriod = this.isInSolunarPeriod(date, latitude, longitude);
    
    // Calculate sunrise/sunset
    const sunrise = this.getSunrise(date, latitude, longitude);
    const sunset = this.getSunset(date, latitude, longitude);
    
    // Calculate moonrise/moonset (simplified)
    const moonrise = this.calculateMoonrise(date, latitude, longitude);
    const moonset = this.calculateMoonset(date, latitude, longitude);
    
    return {
      major_periods: solunarPeriods.major.map(period => ({
        start: period.start.toISOString(),
        end: period.end.toISOString(),
        duration: (period.end.getTime() - period.start.getTime()) / (1000 * 60), // minutes
        peak: new Date(period.start.getTime() + (period.end.getTime() - period.start.getTime()) / 2).toISOString()
      })),
      minor_periods: solunarPeriods.minor.map(period => ({
        start: period.start.toISOString(),
        end: period.end.toISOString(),
        duration: (period.end.getTime() - period.start.getTime()) / (1000 * 60), // minutes
        peak: new Date(period.start.getTime() + (period.end.getTime() - period.start.getTime()) / 2).toISOString()
      })),
      sunrise: sunrise.toISOString(),
      sunset: sunset.toISOString(),
      moonrise: moonrise.toISOString(),
      moonset: moonset.toISOString(),
      moon_phase: moonPhase.phase,
      moon_illumination: moonPhase.illumination,
      lunar_feeding_activity: moonPhase.feedingActivity,
      current_period: currentPeriod.inPeriod ? {
        type: currentPeriod.type,
        remaining: currentPeriod.remaining || 0,
        active: true
      } : {
        type: null,
        remaining: 0,
        active: false
      }
    };
  }

  /**
   * Check if current time is within a solunar period
   */
  static isInSolunarPeriod(date: Date = new Date(), latitude: number, longitude: number): {
    inPeriod: boolean;
    type: 'major' | 'minor' | null;
    remaining?: number; // minutes remaining
  } {
    const periods = this.getSolunarPeriods(date, latitude, longitude);
    const now = date.getTime();
    
    // Check major periods
    for (const period of periods.major) {
      if (now >= period.start.getTime() && now <= period.end.getTime()) {
        const remaining = (period.end.getTime() - now) / (1000 * 60);
        return { inPeriod: true, type: 'major', remaining };
      }
    }
    
    // Check minor periods
    for (const period of periods.minor) {
      if (now >= period.start.getTime() && now <= period.end.getTime()) {
        const remaining = (period.end.getTime() - now) / (1000 * 60);
        return { inPeriod: true, type: 'minor', remaining };
      }
    }
    
    return { inPeriod: false, type: null };
  }
  
  /**
   * Calculate moonrise time (simplified approximation)
   */
  private static calculateMoonrise(date: Date, latitude: number, longitude: number): Date {
    if (!date || !(date instanceof Date)) {
      date = new Date();
    }
    
    // Simplified moonrise calculation
    // In reality, this would require complex astronomical calculations
    const moonrise = new Date(date);
    moonrise.setHours(6, 0, 0, 0); // Approximate morning moonrise
    return moonrise;
  }

  /**
   * Calculate moonset time (simplified approximation)
   */
  private static calculateMoonset(date: Date, latitude: number, longitude: number): Date {
    if (!date || !(date instanceof Date)) {
      date = new Date();
    }
    
    // Simplified moonset calculation
    // In reality, this would require complex astronomical calculations
    const moonset = new Date(date);
    moonset.setHours(18, 0, 0, 0); // Approximate evening moonset
    return moonset;
  }

  /**
   * Calculate overall solunar rating
   */
  private static calculateSolunarRating(
    moonPhase: MoonPhaseData,
    date: Date,
    majorPeriods: { start: Date; end: Date }[]
  ): 'excellent' | 'good' | 'average' | 'poor' {
    let score = 0;
    
    // Moon phase contribution (40%)
    if (moonPhase.fishingQuality === 'excellent') score += 40;
    else if (moonPhase.fishingQuality === 'good') score += 30;
    else if (moonPhase.fishingQuality === 'fair') score += 20;
    else score += 10;
    
    // Time of day contribution (60%)
    const hour = date.getHours();
    const inMajorPeriod = majorPeriods.some(p => 
      date >= p.start && date <= p.end
    );
    
    if (inMajorPeriod) {
      score += 60; // Dawn/dusk
    } else if (hour >= 10 && hour <= 14) {
      score += 30; // Midday
    } else {
      score += 15; // Other times
    }
    
    // Return rating
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  }
  
  /**
   * Get day of year (1-365)
   */
  private static getDayOfYear(date: Date): number {
    if (!date || !(date instanceof Date)) {
      date = new Date();
    }
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }
  
  /**
   * Get fishing insights based on lunar data
   */
  static getLunarFishingInsights(
    date: Date,
    latitude: number,
    longitude: number
  ): string[] {
    const insights: string[] = [];
    const moonPhase = this.getMoonPhase(date);
    const solunarPeriod = this.isInSolunarPeriod(date, latitude, longitude);
    const periods = this.getSolunarPeriods(date, latitude, longitude);
    
    // Moon phase insights
    if (moonPhase.phase === 'new') {
      insights.push('🌑 New moon - excellent night fishing with mouse patterns');
    } else if (moonPhase.phase === 'full') {
      insights.push('🌕 Full moon - fish feed actively throughout night');
    } else if (moonPhase.phase === 'first_quarter' || moonPhase.phase === 'last_quarter') {
      insights.push('🌓 Quarter moon - good feeding activity at dawn/dusk');
    }
    
    // Solunar period insights
    if (solunarPeriod.inPeriod) {
      if (solunarPeriod.type === 'major') {
        insights.push(`⭐ MAJOR feeding period now! ${Math.round(solunarPeriod.remaining!)} min remaining`);
      } else {
        insights.push(`✨ Minor feeding period now! ${Math.round(solunarPeriod.remaining!)} min remaining`);
      }
    } else {
      // Show next major period
      const now = date.getTime();
      const nextMajor = periods.major.find(p => p.start.getTime() > now);
      if (nextMajor) {
        const minutesUntil = (nextMajor.start.getTime() - now) / (1000 * 60);
        if (minutesUntil < 120) {
          insights.push(`⏰ Major feeding period in ${Math.round(minutesUntil)} minutes`);
        }
      }
    }
    
    // Overall rating insight
    if (periods.rating === 'excellent') {
      insights.push('🎣 Excellent solunar rating today!');
    } else if (periods.rating === 'poor') {
      insights.push('📉 Below average solunar rating - may need extra effort');
    }
    
    return insights;
  }
  
  /**
   * Get moon phase bonus for fly selection
   */
  static getMoonPhaseBonus(flyType: string, flyName: string): number {
    const moonPhase = this.getMoonPhase();
    
    // New moon = great for mouse patterns and dark flies
    if (moonPhase.phase === 'new') {
      if (flyName.toLowerCase().includes('mouse')) return 0.20;
      if (flyName.toLowerCase().includes('black')) return 0.10;
      if (flyType === 'streamer') return 0.10;
    }
    
    // Full moon = active feeding, try anything
    if (moonPhase.phase === 'full') {
      return 0.05; // Small bonus to everything
    }
    
    return 0;
  }
}

export const lunarService = LunarService;


