import { APP_CONFIG } from './appConfig';
import { fliesService } from './supabase';
import { FishingConditions, Fly, FlySuggestion } from './types';
import { UsageService } from './usageService';

export class EnhancedFlySuggestionService {
  // Enhanced fly suggestion algorithm with diversity and flexibility
  // IMPORTANT: This algorithm ONLY uses official flies from Supabase database
  // User input, custom flies, or manually added flies are completely ignored
  async getSuggestions(
    conditions: Partial<FishingConditions>,
    userId?: string
  ): Promise<{ suggestions: FlySuggestion[]; usageInfo?: any; canPerform: boolean; error?: string }> {
    try {
      console.log('🎣 Enhanced fly suggestions for conditions from context:', {
        location: conditions.location,
        latitude: conditions.latitude,
        longitude: conditions.longitude,
        hasWeatherData: !!conditions.weather_data,
        hasWaterData: !!conditions.water_data,
        hasHatchData: !!conditions.hatch_data,
        hasSolunarData: !!conditions.solunar_periods,
        weatherConditions: conditions.weather_conditions,
        waterConditions: conditions.water_conditions,
        timeOfDay: conditions.time_of_day,
        timeOfYear: conditions.time_of_year
      });
      
      // CRITICAL: Log real-time data availability for debugging
      if (conditions.weather_data) {
        console.log('🌤️ Real-time weather data available:', {
          temperature: conditions.weather_data.temperature,
          humidity: conditions.weather_data.humidity,
          pressure: conditions.weather_data.pressure,
          cloudCover: conditions.weather_data.cloud_cover
        });
      } else {
        console.warn('⚠️ No real-time weather_data in conditions - suggestions will use basic weather fields only');
      }
      
      if (conditions.water_data) {
        console.log('🌊 Real-time water data available:', {
          flowRate: conditions.water_data.flowRate,
          waterTemperature: conditions.water_data.waterTemperature,
          gaugeHeight: conditions.water_data.gaugeHeight,
          dataSource: conditions.water_data.dataSource,
          dataQuality: conditions.water_data.dataQuality
        });
      } else {
        console.warn('⚠️ No real-time water_data in conditions - suggestions will use basic water fields only');
      }
      console.log('📋 Algorithm: OFFICIAL DATABASE ONLY - Using global context data');
      
      // Check usage limits if user is provided and limits are enabled
      let usageInfo: any = null;
      let canPerform = true;
      
      // Validate that we have sufficient data from context
      if (!conditions.location || !conditions.latitude || !conditions.longitude) {
        console.error('❌ Insufficient location data from context:', {
          location: conditions.location,
          latitude: conditions.latitude,
          longitude: conditions.longitude
        });
        return {
          suggestions: [],
          usageInfo,
          canPerform: false,
          error: 'Insufficient location data. Please select a location on the map first.'
        };
      }
      
      if (userId && APP_CONFIG.ENABLE_USAGE_LIMITS) {
        const usageCheck = await UsageService.canPerformAction(userId, 'fly_suggestions');
        canPerform = usageCheck.canPerform;
        usageInfo = {
          usage: usageCheck.usage,
          limit: usageCheck.limit,
          canPerform: usageCheck.canPerform
        };
        
        if (!canPerform) {
          console.log('Usage limit exceeded for user:', userId);
          return {
            suggestions: [],
            usageInfo,
            canPerform: false
          };
        }
      }
      
      // Get ONLY official flies from Supabase database
      // This ensures no user-added or custom flies influence recommendations
      console.log('🎣 EnhancedFlySuggestionService: Fetching flies from database...');
      const flies = await fliesService.getFlies();
      
      if (!flies || flies.length === 0) {
        console.error('🎣 EnhancedFlySuggestionService: No flies found in database');
        return {
          suggestions: [],
          usageInfo,
          canPerform: false,
          error: 'No flies found in database. Please check database connection.'
        };
      }
      
      console.log(`🎣 EnhancedFlySuggestionService: Found ${flies.length} flies in database`);
      
      // Filter to ensure we only use official database flies
      // This is a safety check to prevent any custom/user-added flies
      const officialFlies = flies.filter(fly => {
        // Basic validation - only require id, name, and type
        const hasBasicFields = fly.id && fly.name && fly.type;
        const isNotCustom = !fly.name.toLowerCase().includes('custom') &&
                           !fly.name.toLowerCase().includes('user') &&
                           !fly.name.toLowerCase().includes('personal') &&
                           !fly.name.toLowerCase().includes('my ') &&
                           !fly.name.toLowerCase().includes('test') &&
                           !fly.name.toLowerCase().includes('temp');
        
        // Add default values for missing fields
        if (hasBasicFields && isNotCustom) {
          // Ensure fly has default values for required fields
          if (!fly.primary_size) fly.primary_size = fly.size || '16'; // Fallback to size field or default
          if (!fly.color) fly.color = 'Natural'; // Default color
          if (!fly.success_rate) fly.success_rate = 0; // Default success rate
          if (!fly.total_uses) fly.total_uses = 0; // Default total uses
          if (!fly.successful_uses) fly.successful_uses = 0; // Default successful uses
        }
        
        return hasBasicFields && isNotCustom;
      });
      
      console.log(`🎣 EnhancedFlySuggestionService: Filtered ${officialFlies.length} official flies from ${flies.length} total flies`);
      
      console.log(`✅ Using ${officialFlies.length} verified official flies`);
      
      // Score all OFFICIAL flies with enhanced algorithm
      // This ensures recommendations are purely data-driven from fishing conditions
      // Ensure we have a complete FishingConditions object with defaults
      const completeConditions: FishingConditions = {
        date: conditions.date || new Date().toISOString().split('T')[0],
        location: conditions.location || 'Unknown Location',
        latitude: conditions.latitude || 0,
        longitude: conditions.longitude || 0,
        location_address: conditions.location_address || 'Unknown Address',
        weather_conditions: conditions.weather_conditions || 'sunny',
        wind_speed: conditions.wind_speed || 'light',
        wind_direction: conditions.wind_direction || 'variable',
        air_temperature_range: conditions.air_temperature_range || 'moderate',
        water_conditions: conditions.water_conditions || 'calm',
        water_clarity: conditions.water_clarity || 'clear',
        water_level: conditions.water_level || 'normal',
        water_flow: conditions.water_flow || 'moderate',
        water_temperature_range: conditions.water_temperature_range || 'moderate',
        water_temperature: conditions.water_temperature,
        time_of_day: conditions.time_of_day || 'morning',
        time_of_year: conditions.time_of_year || 'summer',
        moon_phase: conditions.moon_phase,
        moon_illumination: conditions.moon_illumination,
        lunar_feeding_activity: conditions.lunar_feeding_activity,
        solunar_periods: conditions.solunar_periods,
        hatch_data: conditions.hatch_data,
        weather_data: conditions.weather_data,
        water_data: conditions.water_data,
        notes: conditions.notes
      };
      
      const scoredFlies = officialFlies.map(fly => this.scoreFlyEnhanced(fly, completeConditions));
      
      // Sort by confidence (highest first)
      scoredFlies.sort((a, b) => b.confidence - a.confidence);
      
      // Apply diversity algorithm to ensure variety
      const diverseSuggestions = this.applyDiversityAlgorithm(scoredFlies, completeConditions);
      
      // Take top 8 suggestions
      const topSuggestions = diverseSuggestions.slice(0, 8);
      
      console.log(`🎯 Generated ${topSuggestions.length} diverse suggestions`);
      
      // Update usage if user is provided
      if (userId && APP_CONFIG.ENABLE_USAGE_LIMITS) {
        await UsageService.incrementUsage(userId, 'fly_suggestions');
      }
      
      return {
        suggestions: topSuggestions,
        usageInfo,
        canPerform: true
      };
      
    } catch (error) {
      console.error('Error getting fly suggestions:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        conditions
      });
      
      return {
        suggestions: [],
        usageInfo: null,
        canPerform: false,
        error: error instanceof Error ? error.message : 'Failed to get fly suggestions'
      };
    }
  }
  
  // Enhanced scoring algorithm with reduced penalties and bonus system
  // IMPORTANT: This scoring is based PURELY on fishing conditions and fly characteristics
  // NO user preferences, custom data, or manual input influences the scoring
  private scoreFlyEnhanced(fly: Fly, conditions: FishingConditions): FlySuggestion {
    let score = 0;
    const reasons: string[] = [];
    
    // Base score for all flies (minimal to let condition matching dominate)
    score += 5;
    
    // === CORE MATCHING (High Priority but Flexible) ===
    
    // Weather conditions - High priority but flexible
    const weatherScore = this.scoreWeatherMatch(fly, conditions.weather_conditions || 'sunny', reasons);
    score += weatherScore;
    
    // Time of day - High priority but flexible
    const timeScore = this.scoreTimeOfDay(fly, conditions.time_of_day || 'morning', reasons);
    score += timeScore;
    
    // Season - High priority but flexible
    const seasonScore = this.scoreSeason(fly, conditions.time_of_year || 'summer', reasons);
    score += seasonScore;
    
    // === WATER CONDITIONS (Medium Priority) ===
    
    // Water clarity
    const clarityScore = this.scoreWaterClarity(fly, conditions.water_clarity || 'clear', reasons);
    score += clarityScore;
    
    // Water level
    const levelScore = this.scoreWaterLevel(fly, conditions.water_level || 'normal', reasons);
    score += levelScore;
    
    // Water flow
    const flowScore = this.scoreWaterFlow(fly, conditions.water_flow || 'moderate', reasons);
    score += flowScore;
    
    // === TEMPERATURE CONDITIONS (Medium Priority) ===
    
    // Water temperature
    const waterTempScore = this.scoreWaterTemperature(fly, conditions.water_temperature, conditions.time_of_year, reasons);
    score += waterTempScore;
    
    // Air temperature
    const airTempScore = this.scoreAirTemperature(fly, conditions.air_temperature_range, reasons);
    score += airTempScore;
    
    // === REGIONAL AND LOCATION FACTORS ===
    
    // Regional effectiveness
    const regionalScore = this.scoreRegionalEffectiveness(fly, conditions.latitude, conditions.longitude, reasons);
    score += regionalScore;
    
    // === HATCH DATA INTEGRATION (High Priority) ===
    
    // Active hatch matching
    const hatchScore = this.scoreHatchMatching(fly, conditions.hatch_data, reasons);
    score += hatchScore;
    
    // === LUNAR AND SOLUNAR DATA (Medium Priority) ===
    
    // Lunar phase influence
    const lunarScore = this.scoreLunarInfluence(fly, reasons, conditions.moon_phase, conditions.lunar_feeding_activity);
    score += lunarScore;
    
    // Solunar period bonus
    const solunarScore = this.scoreSolunarPeriods(fly, conditions.solunar_periods, reasons);
    score += solunarScore;
    
    // === ENHANCED WEATHER DATA (Medium Priority) ===
    
    // Wind conditions
    const windScore = this.scoreWindConditions(fly, reasons, conditions.wind_speed, conditions.wind_direction);
    score += windScore;
    
    // Precipitation and atmospheric conditions
    const atmosphericScore = this.scoreAtmosphericConditions(fly, conditions.weather_data, reasons);
    score += atmosphericScore;
    
    // === ENHANCED WATER DATA (Medium Priority) ===
    
    // Water quality indicators
    const waterQualityScore = this.scoreWaterQuality(fly, conditions.water_data, reasons);
    score += waterQualityScore;
    
    // === BONUS SYSTEM FOR DIVERSITY ===
    
    // Versatility bonus - flies that work in many conditions get bonus points
    const versatilityBonus = this.calculateVersatilityBonus(fly, reasons);
    score += versatilityBonus;
    
    // Fly type diversity bonus
    const typeBonus = this.calculateTypeBonus(fly, reasons);
    score += typeBonus;
    
    // === REAL-TIME DATA BONUS ===
    
    // Real-time water conditions bonus
    if (conditions.water_data) {
      const realTimeBonus = this.calculateRealTimeBonus(fly, conditions.water_data, reasons);
      score += realTimeBonus;
    }
    
    // === LUNAR AND SOLUNAR FACTORS ===
    
    // Moon phase influence
    if (conditions.moon_phase) {
      const lunarBonus = this.calculateLunarBonus(fly, conditions.moon_phase, reasons);
      score += lunarBonus;
    }
    
    // Solunar periods
    if (conditions.solunar_periods) {
      const solunarBonus = this.calculateSolunarBonus(fly, conditions.solunar_periods, reasons);
      score += solunarBonus;
    }
    
    // === FINAL ADJUSTMENTS ===
    
    // Ensure minimum score for all flies
    score = Math.max(score, 5);
    
    // Calculate confidence based on score and number of matches
    const confidence = this.calculateConfidence(score, reasons.length);
    
    return {
      fly,
      confidence,
      reason: reasons.join('; ')
    };
  }
  
  // Weather matching with flexible scoring
  private scoreWeatherMatch(fly: Fly, weather: string, reasons: string[]): number {
    const weatherConditions = fly.best_conditions.weather || [];
    
    if (weatherConditions.includes(weather)) {
      reasons.push(`Perfect for ${weather} weather`);
      return 60; // High score for exact match
    }
    
    // Check for similar weather conditions
    const similarWeather = this.getSimilarWeather(weather);
    if (similarWeather.some(w => weatherConditions.includes(w))) {
      reasons.push(`Good for ${weather} weather conditions`);
      return 30; // Moderate score for similar conditions
    }
    
    // Reduced penalty for weather mismatch
    reasons.push(`Not ideal for ${weather} weather`);
    return -15; // Reduced penalty
  }
  
  // Time of day matching with flexible scoring
  private scoreTimeOfDay(fly: Fly, timeOfDay: string, reasons: string[]): number {
    const timeConditions = fly.best_conditions.time_of_day || [];
    
    if (timeConditions.includes(timeOfDay)) {
      reasons.push(`Excellent for ${timeOfDay} fishing`);
      return 50; // High score for exact match
    }
    
    // Check for similar times
    const similarTimes = this.getSimilarTimes(timeOfDay);
    if (similarTimes.some(t => timeConditions.includes(t))) {
      reasons.push(`Good for ${timeOfDay} fishing`);
      return 25; // Moderate score for similar times
    }
    
    reasons.push(`Not ideal for ${timeOfDay} fishing`);
    return -10; // Reduced penalty
  }
  
  // Season matching with flexible scoring
  private scoreSeason(fly: Fly, season: string, reasons: string[]): number {
    const seasonConditions = fly.best_conditions.time_of_year || [];
    
    if (seasonConditions.includes(season)) {
      reasons.push(`Perfect for ${season} season`);
      return 45; // High score for exact match
    }
    
    // Check for similar seasons
    const similarSeasons = this.getSimilarSeasons(season);
    if (similarSeasons.some(s => seasonConditions.includes(s))) {
      reasons.push(`Good for ${season} season`);
      return 20; // Moderate score for similar seasons
    }
    
    reasons.push(`Not ideal for ${season} season`);
    return -8; // Reduced penalty
  }
  
  // Water clarity matching
  private scoreWaterClarity(fly: Fly, clarity: string, reasons: string[]): number {
    const clarityConditions = fly.best_conditions.water_clarity || [];
    
    if (clarityConditions.includes(clarity)) {
      reasons.push(`Effective in ${clarity} water`);
      return 20;
    }
    
    return -5; // Small penalty
    }
    
    // Water level matching
  private scoreWaterLevel(fly: Fly, level: string, reasons: string[]): number {
    const levelConditions = fly.best_conditions.water_level || [];
    
    if (levelConditions.includes(level)) {
      reasons.push(`Works well with ${level} water levels`);
      return 20;
    }
    
    return -5; // Small penalty
    }
    
    // Water flow matching
  private scoreWaterFlow(fly: Fly, flow: string, reasons: string[]): number {
    const flowConditions = fly.best_conditions.water_flow || [];
    
    if (flowConditions.includes(flow)) {
      reasons.push(`Effective in ${flow} water flow`);
      return 15;
    }
    
    return -3; // Small penalty
  }
  
  // Water temperature matching
  private scoreWaterTemperature(fly: Fly, temp: number | undefined, season: string | undefined, reasons: string[]): number {
    if (!temp || !fly.best_conditions.water_temperature_range) {
      return 0;
    }
    
    const { min, max } = fly.best_conditions.water_temperature_range;
    
        if (temp >= min && temp <= max) {
      reasons.push(`Ideal water temperature (${temp}°F)`);
      return 30;
    }
    
    // Check if temperature is close to range
    const range = max - min;
    const tolerance = range * 0.2; // 20% tolerance
    
    if (temp >= (min - tolerance) && temp <= (max + tolerance)) {
      reasons.push(`Good water temperature (${temp}°F)`);
      return 15;
    }
    
    return -8; // Small penalty
  }
  
  // Air temperature matching
  private scoreAirTemperature(fly: Fly, airTemp: string | undefined, reasons: string[]): number {
    if (!airTemp || !fly.best_conditions.air_temperature_range) {
      return 0;
    }
    
    // This would need more sophisticated matching based on the air temperature range
    // For now, return a small bonus
    reasons.push(`Good air temperature conditions`);
    return 10;
  }
  
  // Regional effectiveness scoring
  private scoreRegionalEffectiveness(fly: Fly, latitude: number | undefined, longitude: number | undefined, reasons: string[]): number {
    if (!latitude || !longitude) {
      return 0;
    }
    
    // Determine region based on coordinates
    const region = this.determineRegion(latitude, longitude);
    
    // Check if fly is effective in this region
    if (fly.regional_effectiveness?.regions?.includes(region)) {
      reasons.push(`Effective in ${region} region`);
      return 15;
    }
    
    return 0; // No penalty for regional mismatch
  }
  
  // Versatility bonus - flies that work in many conditions get bonus points
  private calculateVersatilityBonus(fly: Fly, reasons: string[]): number {
    let versatilityScore = 0;
    
    // Count how many conditions this fly works in
    const weatherCount = fly.best_conditions.weather?.length || 0;
    const timeCount = fly.best_conditions.time_of_day?.length || 0;
    const seasonCount = fly.best_conditions.time_of_year?.length || 0;
    const clarityCount = fly.best_conditions.water_clarity?.length || 0;
    
    const totalConditions = weatherCount + timeCount + seasonCount + clarityCount;
    
    if (totalConditions > 12) {
      versatilityScore = 25;
      reasons.push('Highly versatile fly');
    } else if (totalConditions > 8) {
      versatilityScore = 15;
      reasons.push('Versatile fly');
    } else if (totalConditions > 4) {
      versatilityScore = 8;
      reasons.push('Moderately versatile');
    }
    
    return versatilityScore;
  }
  
  // Fly type diversity bonus
  private calculateTypeBonus(fly: Fly, reasons: string[]): number {
    // Different fly types get different base bonuses
    switch (fly.type) {
      case 'dry':
        return 5; // Dry flies are popular
      case 'nymph':
        return 8; // Nymphs are very effective
      case 'streamer':
        return 6; // Streamers are good for aggressive fish
      case 'terrestrial':
        return 4; // Terrestrials are seasonal
      case 'wet':
        return 3; // Wet flies are less common
      default:
        return 2;
    }
  }
  
  // Real-time data bonus
  private calculateRealTimeBonus(fly: Fly, waterData: any, reasons: string[]): number {
    let bonus = 0;
    
    if (waterData.dataQuality === 'GOOD') {
      bonus += 10;
      reasons.push(`Real-time data from ${waterData.stationName || 'monitoring station'}`);
    }
    
    return bonus;
  }
  
  // Lunar bonus
  private calculateLunarBonus(fly: Fly, moonPhase: string, reasons: string[]): number {
    // Some flies work better during certain moon phases
    if (moonPhase === 'full' && fly.type === 'streamer') {
      reasons.push('Good for full moon fishing');
      return 8;
    }
    
    if (moonPhase === 'new' && fly.type === 'nymph') {
      reasons.push('Good for new moon fishing');
      return 6;
    }
    
    return 0;
  }
  
  // Solunar bonus
  private calculateSolunarBonus(fly: Fly, solunarPeriods: any, reasons: string[]): number {
    // During peak solunar periods, most flies work better
    if (solunarPeriods.isPeakPeriod) {
      reasons.push('Peak solunar period');
      return 12;
    }
    
    return 0;
  }
  
  // Calculate confidence based on score and number of matches
  private calculateConfidence(score: number, matchCount: number): number {
    // Base confidence on score
    let confidence = Math.min(score / 2, 95); // Cap at 95%
    
    // Bonus for multiple matches
    if (matchCount > 5) {
      confidence += 10;
    } else if (matchCount > 3) {
      confidence += 5;
    }
    
    // Ensure minimum confidence
    confidence = Math.max(confidence, 15);
    
    return Math.round(confidence);
  }
  
  // Apply diversity algorithm to ensure variety in suggestions
  private applyDiversityAlgorithm(scoredFlies: FlySuggestion[], conditions: FishingConditions): FlySuggestion[] {
    const diverseSuggestions: FlySuggestion[] = [];
    const usedTypes = new Set<string>();
    const usedSizes = new Set<string>();
    const usedColors = new Set<string>();
    
    // First pass: Add top fly from each type
    const typeGroups = new Map<string, FlySuggestion[]>();
    
    scoredFlies.forEach(suggestion => {
      const type = suggestion.fly.type;
      if (!typeGroups.has(type)) {
        typeGroups.set(type, []);
      }
      typeGroups.get(type)!.push(suggestion);
    });
    
    // Add best fly from each type
    typeGroups.forEach((flies, type) => {
      if (flies.length > 0) {
        const bestFly = flies[0];
        diverseSuggestions.push(bestFly);
        usedTypes.add(type);
        usedSizes.add(bestFly.fly.primary_size);
        usedColors.add(bestFly.fly.color);
      }
    });
    
    // Second pass: Add remaining flies with diversity considerations
    scoredFlies.forEach(suggestion => {
      if (diverseSuggestions.length >= 8) return;
      
      const fly = suggestion.fly;
      let diversityScore = 0;
      
      // Bonus for new type
      if (!usedTypes.has(fly.type)) {
        diversityScore += 20;
      }
      
      // Bonus for new size
      if (!usedSizes.has(fly.primary_size)) {
        diversityScore += 10;
      }
      
      // Bonus for new color
      if (!usedColors.has(fly.color)) {
        diversityScore += 5;
      }
      
      // Adjust confidence based on diversity
      const adjustedConfidence = Math.min(suggestion.confidence + diversityScore, 95);
      
      diverseSuggestions.push({
        ...suggestion,
        confidence: adjustedConfidence
      });
      
      usedTypes.add(fly.type);
      usedSizes.add(fly.primary_size);
      usedColors.add(fly.color);
    });
    
    return diverseSuggestions;
  }
  
  // Helper methods for similarity matching
  private getSimilarWeather(weather: string): string[] {
    const weatherGroups = {
      'sunny': ['cloudy'],
      'cloudy': ['sunny', 'overcast'],
      'overcast': ['cloudy'],
      'rainy': ['overcast']
    };
    
    return weatherGroups[weather as keyof typeof weatherGroups] || [];
  }
  
  private getSimilarTimes(timeOfDay: string): string[] {
    const timeGroups = {
      'dawn': ['morning'],
      'morning': ['dawn', 'midday'],
      'midday': ['morning', 'afternoon'],
      'afternoon': ['midday', 'dusk'],
      'dusk': ['afternoon', 'night'],
      'night': ['dusk']
    };
    
    return timeGroups[timeOfDay as keyof typeof timeGroups] || [];
  }
  
  private getSimilarSeasons(season: string): string[] {
    const seasonGroups = {
      'spring': ['summer'],
      'summer': ['spring', 'fall'],
      'fall': ['summer', 'winter'],
      'winter': ['fall']
    };
    
    return seasonGroups[season as keyof typeof seasonGroups] || [];
  }
  
  private determineRegion(latitude: number, longitude: number): string {
    // Simple region determination based on coordinates
    if (latitude > 40 && longitude < -100) {
      return 'western';
    } else if (latitude > 40 && longitude > -100) {
      return 'eastern';
    } else if (latitude < 40) {
      return 'southern';
    } else {
      return 'mountain';
    }
  }

  // === NEW COMPREHENSIVE DATA SCORING METHODS ===
  
  /**
   * Score fly based on active hatch matching
   * High priority - flies matching active hatches get significant bonus
   */
  private scoreHatchMatching(fly: Fly, hatchData: any, reasons: string[]): number {
    if (!hatchData || !hatchData.active_hatches || hatchData.active_hatches.length === 0) {
      return 0;
    }
    
    let score = 0;
    
    for (const activeHatch of hatchData.active_hatches) {
      // Check if fly name or pattern matches the active hatch
      const flyName = fly.name?.toLowerCase() || '';
      const flyPattern = fly.pattern_name?.toLowerCase() || '';
      const hatchName = activeHatch.insect?.toLowerCase() || '';
      
      // Direct name matching
      if (flyName.includes(hatchName) || hatchName.includes(flyName) ||
          flyPattern.includes(hatchName) || hatchName.includes(flyPattern)) {
        
        // High bonus for exact hatch matching
        let bonus = 15;
        
        // Intensity bonus
        if (activeHatch.intensity === 'heavy') bonus += 10;
        else if (activeHatch.intensity === 'moderate') bonus += 5;
        
        // Size matching bonus
        if (fly.primary_size === activeHatch.size) bonus += 5;
        
        score += bonus;
        reasons.push(`🎣 Matches active ${activeHatch.intensity} ${activeHatch.insect} hatch (${activeHatch.stage})`);
      }
      
      // Check hatch matching in fly characteristics
      if (fly.hatch_matching?.insects) {
        for (const flyInsect of fly.hatch_matching.insects) {
          if (flyInsect.toLowerCase().includes(hatchName) || hatchName.includes(flyInsect.toLowerCase())) {
            score += 10;
            reasons.push(`🦟 Fly designed for ${flyInsect} - active ${activeHatch.insect} hatch`);
          }
        }
      }
    }
    
    return score;
  }
  
  /**
   * Score fly based on lunar phase influence
   * Some flies work better during specific moon phases
   */
  private scoreLunarInfluence(fly: Fly, reasons: string[], moonPhase?: string, feedingActivity?: string): number {
    if (!moonPhase || !feedingActivity) return 0;
    
    let score = 0;
    
    // High feeding activity bonus for all flies
    if (feedingActivity === 'very_high') {
      score += 8;
      reasons.push('🌕 Very high lunar feeding activity');
    } else if (feedingActivity === 'high') {
      score += 5;
      reasons.push('🌙 High lunar feeding activity');
    }
    
    // Moon phase specific bonuses
    if (moonPhase === 'full' || moonPhase === 'new') {
      // Full and new moons are often good for fishing
      score += 3;
      reasons.push(`🌕 ${moonPhase} moon phase`);
      
      // Dry flies often work well on full moons
      if (fly.type === 'dry') {
        score += 2;
        reasons.push('🌕 Dry fly bonus for full moon');
      }
    }
    
    return score;
  }
  
  /**
   * Score fly based on solunar periods
   * Major and minor solunar periods increase fish activity
   */
  private scoreSolunarPeriods(fly: Fly, solunarPeriods: any, reasons: string[]): number {
    if (!solunarPeriods) return 0;
    
    let score = 0;
    
    // Check if we're in a solunar period
    if (solunarPeriods.current_period?.active) {
      const periodType = solunarPeriods.current_period.type;
      const remaining = solunarPeriods.current_period.remaining || 0;
      
      if (periodType === 'major') {
        score += 12;
        reasons.push(`🎯 In major solunar period (${Math.round(remaining)} min remaining)`);
      } else if (periodType === 'minor') {
        score += 6;
        reasons.push(`🎯 In minor solunar period (${Math.round(remaining)} min remaining)`);
      }
    }
    
    // Bonus for flies that work well during active periods
    if (solunarPeriods.current_period?.active) {
      // Streamers and attractors often work well during solunar periods
      if (fly.type === 'streamer' || fly.type === 'attractor') {
        score += 3;
        reasons.push('🎯 Streamer/attractor bonus during solunar period');
      }
    }
    
    return score;
  }
  
  /**
   * Score fly based on wind conditions
   * Wind affects fly presentation and selection
   */
  private scoreWindConditions(fly: Fly, reasons: string[], windSpeed?: string, windDirection?: string): number {
    if (!windSpeed) return 0;
    
    let score = 0;
    
    // Wind speed considerations
    if (windSpeed === 'light' || windSpeed === 'none') {
      // Light winds favor dry flies
      if (fly.type === 'dry') {
        score += 5;
        reasons.push('💨 Light wind favors dry fly presentation');
      }
    } else if (windSpeed === 'moderate' || windSpeed === 'strong') {
      // Strong winds favor subsurface flies
      if (fly.type === 'nymph' || fly.type === 'streamer') {
        score += 4;
        reasons.push('💨 Wind favors subsurface fly presentation');
      }
      
      // Heavy flies work better in wind
      if (fly.characteristics?.sink_rate === 'fast') {
        score += 2;
        reasons.push('💨 Heavy fly works well in wind');
      }
    }
    
    return score;
  }
  
  /**
   * Score fly based on atmospheric conditions
   * Precipitation, pressure, and other weather factors
   */
  private scoreAtmosphericConditions(fly: Fly, weatherData: any, reasons: string[]): number {
    if (!weatherData) return 0;
    
    let score = 0;
    
    // Precipitation effects
    if (weatherData.precipitation?.type === 'rain') {
      if (weatherData.precipitation.probability > 50) {
        // Rain often triggers insect activity
        if (fly.type === 'dry' || fly.type === 'emerger') {
          score += 6;
          reasons.push('🌧️ Rain triggers insect activity - dry/emerger flies');
        }
      }
    }
    
    // Barometric pressure effects
    if (weatherData.pressure) {
      if (weatherData.pressure < 1000) {
        // Low pressure often increases fish activity
        score += 4;
        reasons.push('📉 Low pressure increases fish activity');
      } else if (weatherData.pressure > 1020) {
        // High pressure can make fish more selective
        if (fly.type === 'nymph' || fly.type === 'imitation') {
          score += 3;
          reasons.push('📈 High pressure - precise imitations work better');
        }
      }
    }
    
    // Cloud cover effects
    if (weatherData.cloud_cover > 70) {
      // Overcast conditions often favor dry flies
      if (fly.type === 'dry') {
        score += 3;
        reasons.push('☁️ Overcast conditions favor dry flies');
      }
    }
    
    return score;
  }
  
  /**
   * Score fly based on water quality indicators
   * Water quality affects fly selection and presentation
   */
  private scoreWaterQuality(fly: Fly, waterData: any, reasons: string[]): number {
    if (!waterData) return 0;
    
    let score = 0;
    
    // Dissolved oxygen levels
    if (waterData.dissolvedOxygen) {
      if (waterData.dissolvedOxygen > 8) {
        // High oxygen - good for active feeding
        if (fly.type === 'dry' || fly.type === 'streamer') {
          score += 4;
          reasons.push('💨 High oxygen levels favor active flies');
        }
      } else if (waterData.dissolvedOxygen < 5) {
        // Low oxygen - fish may be sluggish
        if (fly.type === 'nymph' || fly.characteristics?.sink_rate === 'slow') {
          score += 3;
          reasons.push('💨 Low oxygen - slow presentations work better');
        }
      }
    }
    
    // pH levels
    if (waterData.pH) {
      if (waterData.pH >= 6.5 && waterData.pH <= 8.5) {
        // Optimal pH range
        score += 2;
        reasons.push('⚗️ Optimal water pH for fishing');
      }
    }
    
    // Turbidity effects
    if (waterData.turbidity) {
      if (waterData.turbidity > 30) {
        // Murky water - bright flies work better
        if (fly.color && (fly.color.toLowerCase().includes('bright') || 
                         fly.color.toLowerCase().includes('chartreuse') ||
                         fly.color.toLowerCase().includes('orange'))) {
          score += 3;
          reasons.push('🌊 Murky water - bright fly visibility');
        }
      } else if (waterData.turbidity < 5) {
        // Clear water - natural flies work better
        if (fly.color && (fly.color.toLowerCase().includes('natural') ||
                         fly.color.toLowerCase().includes('olive') ||
                         fly.color.toLowerCase().includes('brown'))) {
          score += 3;
          reasons.push('🌊 Clear water - natural fly colors');
        }
      }
    }
    
    return score;
  }
}

export const enhancedFlySuggestionService = new EnhancedFlySuggestionService();