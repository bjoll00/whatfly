import { APP_CONFIG } from './appConfig';
import { debugLogger } from './debugLogger';
import { fliesService } from './supabase';
import { FishingConditions, Fly, FlySuggestion } from './types';
import { UsageService } from './usageService';

export class FlySuggestionService {
  // Get fly suggestions based on fishing conditions
  // IMPORTANT: This algorithm ONLY uses official flies from Supabase database
  // User input, custom flies, or manually added flies are completely ignored
  async getSuggestions(
    conditions: Partial<FishingConditions>,
    userId?: string
  ): Promise<{ suggestions: FlySuggestion[]; usageInfo?: any; canPerform: boolean; error?: string }> {
    try {
      
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
          debugLogger.log('FLY_SERVICE', 'Usage limit exceeded', 'warn');
          return {
            suggestions: [],
            usageInfo,
            canPerform: false
          };
        }
      }
      
      // Get ONLY official flies from Supabase database
      // This ensures no user-added or custom flies influence recommendations
      const flies = await fliesService.getFlies();
      
      if (!flies || flies.length === 0) {
        console.error('🎣 FlySuggestionService: No flies returned from database');
        return {
          suggestions: [],
          usageInfo,
          canPerform: false,
          error: 'No flies found in database. Please check database connection.'
        };
      }
      
      // Log sample fly data to debug
      if (flies.length > 0) {
        console.log('🎣 FlySuggestionService: Sample fly data:', {
          firstFly: flies[0],
          flyKeys: Object.keys(flies[0]),
          totalFlies: flies.length
        });
      }
      
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
        
        if (!hasBasicFields) {
          console.log('🎣 FlySuggestionService: Fly missing basic fields:', { id: fly.id, name: fly.name, type: fly.type });
        }
        
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
      
      console.log(`🎣 FlySuggestionService: Filtered ${officialFlies.length} official flies from ${flies.length} total flies`);
      
      console.log(`✅ Using ${officialFlies.length} verified official flies (no user input)`);

      if (officialFlies.length === 0) {
        console.log('No official flies found in database');
        return {
          suggestions: [],
          usageInfo,
          canPerform: true
        };
      }

      // Score and rank ONLY official flies based purely on fishing conditions
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
      
      // Debug: Check if flies have required fields for scoring
      if (officialFlies.length > 0) {
        const sampleFly = officialFlies[0];
        console.log('🎣 FlySuggestionService: Sample fly for scoring:', {
          id: sampleFly.id,
          name: sampleFly.name,
          type: sampleFly.type,
          hasBestConditions: !!sampleFly.best_conditions,
          bestConditionsKeys: sampleFly.best_conditions ? Object.keys(sampleFly.best_conditions) : 'none',
          hasSuccessRate: sampleFly.success_rate !== undefined,
          successRate: sampleFly.success_rate
        });
      }
      
      // Debug: Log the conditions being used for scoring
      console.log('🎣 FlySuggestionService: Conditions being used for scoring:', {
        location: completeConditions.location,
        weather_conditions: completeConditions.weather_conditions,
        water_temperature: completeConditions.water_temperature,
        water_clarity: completeConditions.water_clarity,
        water_flow: completeConditions.water_flow,
        time_of_day: completeConditions.time_of_day,
        time_of_year: completeConditions.time_of_year,
        moon_phase: completeConditions.moon_phase,
        hasRealWeatherData: !!completeConditions.weather_data,
        hasRealWaterData: !!completeConditions.water_data,
        realWeatherTemp: completeConditions.weather_data?.temperature,
        realWaterTemp: completeConditions.water_data?.waterTemperature,
        realFlowRate: completeConditions.water_data?.flowRate
      });
      
      const suggestions = officialFlies.map(fly => this.scoreFly(fly, completeConditions));
      console.log('🎣 FlySuggestionService: Generated suggestions:', suggestions.length);
      
      // Debug: Check if any suggestions have valid scores
      if (suggestions.length > 0) {
        console.log('🎣 FlySuggestionService: Sample suggestion:', {
          flyName: suggestions[0].fly.name,
          score: suggestions[0].score,
          confidence: suggestions[0].confidence,
          reasons: suggestions[0].reasons?.slice(0, 3) // First 3 reasons
        });
      }
      
      // Limit suggestions for free users
      const maxSuggestions = userId && !usageInfo?.usage?.isPremium ? 3 : 5;
      
      // Apply diversity algorithm to ensure variety in suggestions
      const diverseSuggestions = this.applyDiversityAlgorithm(suggestions, completeConditions);
      
      // Sort by confidence (highest first) and return top suggestions
      let sortedSuggestions = diverseSuggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, maxSuggestions);
      
      // Fallback: If no valid suggestions, create basic ones from available flies
      if (sortedSuggestions.length === 0 && officialFlies.length > 0) {
        console.log('🎣 FlySuggestionService: No valid suggestions, creating fallback suggestions');
        sortedSuggestions = officialFlies.slice(0, maxSuggestions).map((fly, index) => ({
          fly,
          score: 10 - index, // Decreasing score
          confidence: Math.max(0.1, 0.8 - (index * 0.1)), // Decreasing confidence
          reasons: ['Available fly option', 'Basic recommendation']
        }));
      }
      
      console.log('🎣 FlySuggestionService: Final suggestions:', sortedSuggestions.length);
      
      // Increment usage if user is provided and limits are enabled
      if (userId && canPerform && APP_CONFIG.ENABLE_USAGE_LIMITS) {
        await UsageService.incrementUsage(userId, 'fly_suggestions');
      }
      
      return {
        suggestions: sortedSuggestions,
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
      
      // Return a more informative error response
      return {
        suggestions: [],
        usageInfo: null,
        canPerform: false,
        error: error instanceof Error ? error.message : 'Failed to get fly suggestions'
      };
    }
  }

  // Score a fly based on how well it matches the conditions
  // IMPORTANT: This scoring is based PURELY on fishing conditions and fly characteristics
  // NO user preferences, custom data, or manual input influences the scoring
  private scoreFly(fly: Fly, conditions: FishingConditions): FlySuggestion {
    let score = 5; // Very low base score so condition matching dominates
    let reasons: string[] = [];

    // ========================================
    // CONDITION-BASED SCORING ONLY
    // ========================================
    // All scoring is based on fishing conditions and fly characteristics
    // NO user preferences, custom data, or manual input influences scoring
    // This ensures recommendations are purely data-driven

    // REMOVED: Success rate and usage-based scoring to ensure diverse suggestions
    // All scoring is now based purely on fishing conditions and fly characteristics

    // ========================================
    // REAL-TIME WATER CONDITIONS - CRITICAL PRIORITY
    // ========================================
    if (conditions.water_data) {
      const waterConditions = conditions.water_data;
      
      // Real-time flow rate analysis (VERY HIGH PRIORITY)
      if (waterConditions.flowRate !== undefined) {
        const flowScore = this.scoreFlowRate(fly, waterConditions.flowRate, reasons);
        score += flowScore;
      }
      
      // Real-time water temperature (VERY HIGH PRIORITY)
      if (waterConditions.waterTemperature !== undefined) {
        const tempScore = this.scoreWaterTemp(fly, waterConditions.waterTemperature, conditions.time_of_year, reasons);
        score += tempScore;
      }
      
      // Gauge height consideration (MEDIUM PRIORITY)
      if (waterConditions.gaugeHeight !== undefined) {
        const gaugeScore = this.scoreGaugeHeight(fly, waterConditions.gaugeHeight, reasons);
        score += gaugeScore;
      }
      
      // Data quality bonus
      if (waterConditions.dataQuality === 'GOOD') {
        score += 10;
        reasons.push(`🎯 Real-time data from ${waterConditions.stationName || 'monitoring station'}`);
      }
    }

    // Weather conditions match - HIGH PRIORITY (reduced penalties for more flexibility)
    if (fly.best_conditions.weather.includes(conditions.weather_conditions)) {
      score += 60; // High score for weather match
      reasons.push(`Excellent for ${conditions.weather_conditions} weather`);
    } else {
      score -= 20; // Reduced penalty for weather mismatch
    }

    // Time of day match - HIGH PRIORITY with specific pattern bonuses
    const timeOfDayBonus = this.getTimeOfDayBonus(fly, conditions.time_of_day, reasons);
    score += timeOfDayBonus;
    
    // Debug: Log time of day matching for problematic flies
    if (fly.name.toLowerCase().includes('chubby')) {
      console.log(`🕐 Time of day matching for ${fly.name}:`, {
        flyTimeOfDay: fly.best_conditions.time_of_day,
        currentTimeOfDay: conditions.time_of_day,
        includes: fly.best_conditions.time_of_day.includes(conditions.time_of_day)
      });
    }
    
    if (fly.best_conditions.time_of_day.includes(conditions.time_of_day)) {
      score += 50; // High score for time of day match
      reasons.push(`Perfect for ${conditions.time_of_day} fishing`);
    } else {
      score -= 15; // Reduced penalty for time of day mismatch
    }

    // Time of year (season) match - HIGH PRIORITY
    if (conditions.time_of_year && fly.best_conditions.time_of_year) {
      if (fly.best_conditions.time_of_year.includes(conditions.time_of_year)) {
        score += 45; // High score for season match
        reasons.push(`Excellent for ${conditions.time_of_year} season`);
      } else {
        score -= 15; // Reduced penalty for season mismatch
      }
    }

    // Water temperature match - SEASONAL IMPORTANCE
    if (conditions.water_temperature && fly.best_conditions.water_temperature_range) {
      const { min, max } = fly.best_conditions.water_temperature_range;
      
      // Debug: Log temperature matching for problematic flies
      if (fly.name.toLowerCase().includes('chubby')) {
        console.log(`🌡️ Temperature matching for ${fly.name}:`, {
          currentTemp: conditions.water_temperature,
          flyTempRange: { min, max },
          inRange: conditions.water_temperature >= min && conditions.water_temperature <= max
        });
      }
      
      if (conditions.water_temperature >= min && conditions.water_temperature <= max) {
        score += 35; // Good score for temperature match
        reasons.push(`Ideal water temperature for this season`);
      } else {
        score -= 10; // Reduced penalty for temperature mismatch
      }
    }

    // Water clarity match (secondary importance)
    if (fly.best_conditions.water_clarity.includes(conditions.water_clarity)) {
      score += 15; // Moderate score for clarity match
      reasons.push(`Effective in ${conditions.water_clarity} water`);
    } else {
      score -= 5; // Reduced penalty for clarity mismatch
    }

    // Water level match (secondary importance)
    if (fly.best_conditions.water_level.includes(conditions.water_level)) {
      score += 15; // Moderate score for level match
      reasons.push(`Works well with ${conditions.water_level} water levels`);
    } else {
      score -= 5; // Reduced penalty for level mismatch
    }

    // Water flow match (new condition)
    if (conditions.water_flow) {
      const flowMatch = this.getFlowMatch(fly, conditions.water_flow);
      if (flowMatch > 0) {
        score += 20; // Moderate score for flow match
        reasons.push(`Effective in ${conditions.water_flow} water flow`);
      } else {
        score -= 8; // Moderate penalty for flow mismatch
      }
    }

    // Water depth consideration (new condition)
    if (conditions.water_depth) {
      const depthMatch = this.getDepthMatch(fly, conditions.water_depth);
      if (depthMatch > 0) {
        score += 15; // Moderate score for depth match
        reasons.push(`Suitable for ${conditions.water_depth}ft depth`);
      } else {
        score -= 5; // Small penalty for depth mismatch
      }
    }

    // Wind conditions (from weather data)
    if (conditions.wind_speed) {
      const windMatch = this.getWindMatch(fly, conditions.wind_speed);
      if (windMatch > 0) {
        score += 15; // Moderate score for wind match
        reasons.push(`Good for ${conditions.wind_speed} winds`);
      } else {
        score -= 5; // Small penalty for wind mismatch
      }
    }

    // Air temperature consideration (from weather data)
    if (conditions.air_temperature_range) {
      const tempMatch = this.getAirTempMatch(fly, conditions.air_temperature_range);
      if (tempMatch > 0) {
        score += 10; // Small score for air temp match
        reasons.push(`Effective in ${conditions.air_temperature_range} air temperatures`);
      }
    }

    // MEGA BONUS: Perfect weather and season match
    const weatherMatch = fly.best_conditions.weather.includes(conditions.weather_conditions);
    const seasonMatch = fly.best_conditions.time_of_day.includes(conditions.time_of_day);
    if (weatherMatch && seasonMatch) {
      score += 40; // Huge bonus for matching both weather and season
      reasons.push('Perfect weather and season combination');
    }

    // REMOVED: All success rate and usage-based bonuses to ensure pure condition-based scoring
    
    // Add validation penalties for completely inappropriate conditions
    let validationPenalty = 0;
    
    // Heavy penalty for flies with corrupted time_of_day data (seasonal values instead of time values)
    const hasSeasonalTimeOfDay = fly.best_conditions.time_of_day.some(t => 
      ['summer', 'fall', 'spring', 'winter', 'late_summer', 'early_fall'].includes(t)
    );
    if (hasSeasonalTimeOfDay) {
      validationPenalty -= 100; // Heavy penalty for corrupted data
      reasons.push('⚠️ Invalid time data - seasonal values in time_of_day');
    }
    
    // Heavy penalty for flies that are completely inappropriate for cold conditions
    if (conditions.water_temperature && conditions.water_temperature < 45) {
      const flyType = fly.type?.toLowerCase() || '';
      const flySize = parseInt(fly.primary_size) || 16;
      
      // Large dry flies are terrible in very cold water
      if (flyType === 'dry' && flySize <= 12) {
        validationPenalty -= 50;
        reasons.push('❌ Too cold for large dry flies');
      }
      
      // Chubby Chernobyl specifically is terrible in cold water
      if (fly.name.toLowerCase().includes('chubby') && conditions.water_temperature < 50) {
        validationPenalty -= 75;
        reasons.push('❌ Chubby Chernobyl ineffective in cold water');
      }
    }
    
    score += validationPenalty;
    
    // Add small random component to break ties and ensure diversity
    const randomComponent = (Math.random() - 0.5) * 10; // -5 to +5 points
    score += randomComponent;
    
    // === COMPREHENSIVE DATA SCORING ===
    
    // Hatch data scoring
    if (conditions.hatch_data?.active_hatches) {
      const hatchScore = this.scoreHatchMatching(fly, conditions.hatch_data, reasons);
      score += hatchScore;
    }
    
    // Lunar and solunar data scoring
    if (conditions.moon_phase || conditions.solunar_periods) {
      const lunarScore = this.scoreLunarInfluence(fly, reasons, conditions.moon_phase, conditions.lunar_feeding_activity);
      score += lunarScore;
      
      const solunarScore = this.scoreSolunarPeriods(fly, conditions.solunar_periods, reasons);
      score += solunarScore;
    }
    
    // Enhanced weather data scoring
    if (conditions.weather_data) {
      const atmosphericScore = this.scoreAtmosphericConditions(fly, conditions.weather_data, reasons);
      score += atmosphericScore;
    }
    
    // Enhanced water quality scoring
    if (conditions.water_data) {
      const waterQualityScore = this.scoreWaterQuality(fly, conditions.water_data, reasons);
      score += waterQualityScore;
    }

    // Ensure minimum confidence
    const confidence = Math.min(100, Math.max(5, score));

    // Debug: Enhanced logging for problematic flies
    if (fly.name.toLowerCase().includes('chubby')) {
      console.log(`🎯 CHUBBY CHERNOBYL DEBUG:`, {
        name: fly.name,
        finalScore: score,
        confidence: confidence,
        reasons: reasons,
        currentConditions: {
          timeOfDay: conditions.time_of_day,
          waterTemp: conditions.water_temperature,
          weather: conditions.weather_conditions,
          season: conditions.time_of_year
        }
      });
    }
    
    console.log(`Fly: ${fly.name}, Score: ${score}, Confidence: ${confidence}, Reasons: ${reasons.join(', ')}`);

    return {
      fly,
      confidence,
      reason: reasons.join(', ') || 'General recommendation',
    };
  }

  // Helper methods for new condition matching
  private getFlowMatch(fly: Fly, flow: string): number {
    // Determine fly effectiveness based on water flow
    const flyType = fly.type?.toLowerCase() || '';
    
    switch (flow) {
      case 'still':
        // Dry flies and small nymphs work well in still water
        if (flyType === 'dry' || flyType === 'nymph') return 1;
        break;
      case 'slow':
        // Most flies work well in slow water
        return 1;
      case 'moderate':
        // All flies work well in moderate flow
        return 1;
      case 'fast':
        // Streamers and weighted nymphs work well in fast water
        if (flyType === 'streamer' || flyType === 'nymph') return 1;
        break;
      case 'rapid':
        // Heavy streamers and weighted flies work best in rapid water
        if (flyType === 'streamer') return 1;
        if (flyType === 'nymph' && fly.primary_size.includes('heavy')) return 1;
        break;
    }
    
    return 0;
  }

  private getDepthMatch(fly: Fly, depth: number): number {
    // Determine fly effectiveness based on water depth
    const flyType = fly.type?.toLowerCase() || '';
    
    if (depth < 3) {
      // Shallow water - dry flies and small nymphs work well
      if (flyType === 'dry' || flyType === 'nymph') return 1;
    } else if (depth < 8) {
      // Medium depth - most flies work well
      return 1;
    } else {
      // Deep water - streamers and weighted nymphs work better
      if (flyType === 'streamer' || flyType === 'nymph') return 1;
    }
    
    return 0;
  }

  private getWindMatch(fly: Fly, windSpeed: string): number {
    // Determine fly effectiveness based on wind conditions
    const flyType = fly.type?.toLowerCase() || '';
    
    switch (windSpeed) {
      case 'none':
      case 'light':
        // Light winds - all flies work well, especially dry flies
        return 1;
      case 'moderate':
        // Moderate winds - heavier flies work better
        if (flyType === 'nymph' || flyType === 'streamer') return 1;
        break;
      case 'strong':
      case 'very_strong':
        // Strong winds - only heavy flies work well
        if (flyType === 'streamer' || (flyType === 'nymph' && fly.primary_size.includes('heavy'))) return 1;
        break;
    }
    
    return 0;
  }

  private getAirTempMatch(fly: Fly, airTemp: string): number {
    // Determine fly effectiveness based on air temperature
    const flyType = fly.type?.toLowerCase() || '';
    
    switch (airTemp) {
      case 'very_cold':
      case 'cold':
        // Cold air - fish are less active, use smaller flies
        if (flyType === 'nymph' || flyType === 'wet') return 1;
        break;
      case 'cool':
      case 'moderate':
        // Moderate temperatures - most flies work well
        return 1;
      case 'warm':
      case 'hot':
        // Warm air - dry flies and terrestrials work well
        if (flyType === 'dry' || flyType === 'terrestrial') return 1;
        break;
    }
    
    return 0;
  }

  // Learn from fishing results to improve suggestions
  // IMPORTANT: This only updates official flies in the database
  // User input or custom flies are completely ignored
  async learnFromResult(log: {
    flies_used: string[];
    successful_flies: string[];
    conditions: {
      weather_conditions: string;
      water_clarity: string;
      water_level: string;
      time_of_day: string;
    };
  }): Promise<void> {
    try {
      console.log('Learning from result:', log);
      console.log('📋 Learning: OFFICIAL DATABASE ONLY - No user input influence');
      
      // Get only official flies to match names to IDs
      const allFlies = await fliesService.getFlies();
      console.log('Found flies:', allFlies.length);
      
      // Filter to ensure we only update official flies
      const officialFlies = allFlies.filter(fly => {
        return fly.id && 
               fly.name && 
               fly.type && 
               fly.primary_size && 
               fly.color &&
               fly.best_conditions &&
               // Filter out any flies that might be user-generated or custom
               !fly.name.toLowerCase().includes('custom') &&
               !fly.name.toLowerCase().includes('user') &&
               !fly.name.toLowerCase().includes('personal') &&
               !fly.name.toLowerCase().includes('my ') &&
               !fly.name.toLowerCase().includes('test') &&
               !fly.name.toLowerCase().includes('temp') &&
               // Ensure the fly has proper official structure
               typeof fly.best_conditions === 'object' &&
               Array.isArray(fly.best_conditions.weather) &&
               Array.isArray(fly.best_conditions.time_of_day) &&
               Array.isArray(fly.best_conditions.water_clarity) &&
               Array.isArray(fly.best_conditions.water_level);
      });
      
      console.log(`✅ Using ${officialFlies.length} verified official flies for learning`);
      
      // Update success rates for flies used (only official flies)
      for (const flyName of log.flies_used) {
        const fly = officialFlies.find(f => f.name === flyName);
        console.log(`Looking for fly: ${flyName}, found:`, fly ? 'YES' : 'NO');
        
        if (fly) {
          const wasSuccessful = log.successful_flies.includes(flyName);
          console.log(`Updating fly ${flyName}: successful=${wasSuccessful} (${log.successful_flies.length} successful flies out of ${log.flies_used.length} used)`);
          await fliesService.updateFlySuccess(fly.id, wasSuccessful);
          console.log(`Updated fly ${flyName} successfully`);
        } else {
          console.warn(`Fly not found: ${flyName}`);
        }
      }
    } catch (error) {
      console.error('Error learning from result:', error);
    }
  }

  // Get popular flies for similar conditions
  async getPopularFlies(conditions: {
    weather_conditions: string;
    water_clarity: string;
    water_level: string;
    time_of_day: string;
  }, limit: number = 3): Promise<Fly[]> {
    try {
      const flies = await fliesService.getFliesByConditions({
        weather_conditions: conditions.weather_conditions,
        water_clarity: conditions.water_clarity,
        water_level: conditions.water_level,
        time_of_day: conditions.time_of_day,
      });

      return flies
        .filter(fly => fly.total_uses > 0)
        .sort((a, b) => b.success_rate - a.success_rate)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting popular flies:', error);
      return [];
    }
  }

  // Get most popular flies across all users (for trending/popular section)
  async getMostPopularFlies(limit: number = 10): Promise<Fly[]> {
    try {
      const flies = await fliesService.getFlies();
      
      return flies
        .filter(fly => fly.total_uses > 0)
        .sort((a, b) => b.total_uses - a.total_uses)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting most popular flies:', error);
      return [];
    }
  }

  // ========================================
  // REAL-TIME WATER CONDITION SCORING
  // ========================================
  
  /**
   * Score fly based on real-time flow rate
   */
  private scoreFlowRate(fly: Fly, flowRate: number, reasons: string[]): number {
    let score = 0;
    const flyType = fly.type?.toLowerCase() || '';
    
    // Very low flow (< 30 cfs) - Still water tactics
    if (flowRate < 30) {
      if (flyType === 'dry' || flyType === 'terrestrial') {
        score += 40;
        reasons.push(`💧 Perfect for low flow (${flowRate} cfs) - fish looking up`);
      } else if (flyType === 'nymph' && parseInt(fly.primary_size) >= 18) {
        score += 35;
        reasons.push(`💧 Small nymphs work great in low flow (${flowRate} cfs)`);
      } else {
        score -= 15;
      }
    }
    // Low flow (30-75 cfs) - Ideal conditions
    else if (flowRate < 75) {
      score += 45;
      reasons.push(`💧 Optimal flow rate (${flowRate} cfs) - all flies working`);
    }
    // Medium flow (75-150 cfs) - Great nymphing
    else if (flowRate < 150) {
      if (flyType === 'nymph') {
        score += 50;
        reasons.push(`💧 Excellent nymphing conditions (${flowRate} cfs)`);
      } else if (flyType === 'dry') {
        score += 30;
        reasons.push(`💧 Good dry fly conditions (${flowRate} cfs)`);
      } else {
        score += 25;
      }
    }
    // High flow (150-300 cfs) - Streamers shine
    else if (flowRate < 300) {
      if (flyType === 'streamer') {
        score += 60;
        reasons.push(`💧 High flow perfect for streamers (${flowRate} cfs)`);
      } else if (flyType === 'nymph' && parseInt(fly.primary_size) <= 14) {
        score += 45;
        reasons.push(`💧 Large nymphs effective in high flow (${flowRate} cfs)`);
      } else {
        score += 10;
      }
    }
    // Very high flow (> 300 cfs) - Big flies only
    else {
      if (flyType === 'streamer' && parseInt(fly.primary_size) <= 6) {
        score += 70;
        reasons.push(`💧 Very high flow demands large streamers (${flowRate} cfs)`);
      } else if (flyType === 'nymph' && parseInt(fly.primary_size) <= 10) {
        score += 40;
        reasons.push(`💧 Heavy nymphs for high flow (${flowRate} cfs)`);
      } else {
        score -= 20;
        reasons.push(`⚠️ Flow too high (${flowRate} cfs) for this fly`);
      }
    }
    
    return score;
  }
  
  /**
   * Score fly based on real-time water temperature
   */
  private scoreWaterTemp(fly: Fly, waterTemp: number, timeOfYear: string | undefined, reasons: string[]): number {
    let score = 0;
    const flyType = fly.type?.toLowerCase() || '';
    
    // Removed detailed logging to reduce console noise
    
    // Very cold water (< 35°F) - Midges and small nymphs
    if (waterTemp < 35) {
      if (flyType === 'nymph' && parseInt(fly.primary_size) >= 18) {
        score += 60;
        reasons.push(`❄️ Ice cold water (${waterTemp}°F) - tiny nymphs essential`);
      } else if (fly.name?.toLowerCase().includes('midge')) {
        score += 70;
        reasons.push(`❄️ Midge perfect for ${waterTemp}°F water`);
      } else {
        score -= 30;
        reasons.push(`❄️ Too cold (${waterTemp}°F) for this fly`);
      }
    }
    // Cold water (35-45°F) - Slow presentations
    else if (waterTemp < 45) {
      if (flyType === 'nymph') {
        score += 55;
        reasons.push(`🌡️ Cold water (${waterTemp}°F) - nymphs dominating`);
      } else if (flyType === 'streamer' && fly.name?.toLowerCase().includes('bugger')) {
        score += 40;
        reasons.push(`🌡️ Slow retrieves work at ${waterTemp}°F`);
      } else {
        score -= 10;
      }
    }
    // Cool water (45-55°F) - Prime conditions
    else if (waterTemp < 55) {
      score += 50;
      reasons.push(`🌡️ Prime temperature (${waterTemp}°F) - fish active`);
      
      // BWO hatch bonus
      if (fly.name?.toLowerCase().includes('blue wing') || fly.name?.toLowerCase().includes('bwo')) {
        score += 30;
        reasons.push(`🦋 BWO hatch likely at ${waterTemp}°F`);
      }
    }
    // Warm water (55-65°F) - Peak activity
    else if (waterTemp < 65) {
      score += 60;
      reasons.push(`🌡️ Perfect temperature (${waterTemp}°F) - fish feeding aggressively`);
      
      // Caddis and PMD bonus
      if (fly.name?.toLowerCase().includes('caddis') || fly.name?.toLowerCase().includes('pmd')) {
        score += 35;
        reasons.push(`🦋 Excellent hatch conditions at ${waterTemp}°F`);
      }
      
      // Terrestrials in summer
      if (flyType === 'terrestrial' && (timeOfYear?.includes('summer') || timeOfYear?.includes('fall'))) {
        score += 40;
        reasons.push(`🦗 Terrestrials active at ${waterTemp}°F`);
      }
    }
    // Hot water (65-70°F) - Morning/evening focus
    else if (waterTemp < 70) {
      if (flyType === 'dry' || flyType === 'terrestrial') {
        score += 40;
        reasons.push(`☀️ Warm water (${waterTemp}°F) - surface feeding likely`);
      } else if (flyType === 'streamer') {
        score += 45;
        reasons.push(`☀️ Warm water (${waterTemp}°F) - aggressive strikes`);
      } else {
        score += 20;
      }
    }
    // Too hot (> 70°F) - Fish stressed
    else {
      score -= 20;
      reasons.push(`⚠️ Water too warm (${waterTemp}°F) - fish less active`);
      
      // Early morning/late evening dry flies still work
      if (flyType === 'dry' && fly.primary_size && parseInt(fly.primary_size) >= 16) {
        score += 30;
        reasons.push(`🌅 Small dries work early/late despite ${waterTemp}°F`);
      }
    }
    
    return score;
  }
  
  /**
   * Score fly based on gauge height
   */
  private scoreGaugeHeight(fly: Fly, gaugeHeight: number, reasons: string[]): number {
    let score = 0;
    const flyType = fly.type?.toLowerCase() || '';
    
    // Very low (< 1.5 ft) - Fish spooky
    if (gaugeHeight < 1.5) {
      if (flyType === 'dry' && parseInt(fly.primary_size) >= 18) {
        score += 30;
        reasons.push(`📏 Low water (${gaugeHeight}ft) - small presentations`);
      } else {
        score -= 10;
      }
    }
    // Normal (1.5-3 ft) - Ideal
    else if (gaugeHeight < 3) {
      score += 35;
      reasons.push(`📏 Perfect gauge height (${gaugeHeight}ft)`);
    }
    // High (3-4 ft) - Nymphs and streamers
    else if (gaugeHeight < 4) {
      if (flyType === 'nymph' || flyType === 'streamer') {
        score += 40;
        reasons.push(`📏 High water (${gaugeHeight}ft) - subsurface feeding`);
      } else {
        score += 10;
      }
    }
    // Very high (> 4 ft) - Streamers only
    else {
      if (flyType === 'streamer') {
        score += 50;
        reasons.push(`📏 Very high water (${gaugeHeight}ft) - streamer time`);
      } else {
        score -= 15;
        reasons.push(`⚠️ Water too high (${gaugeHeight}ft) for this fly`);
      }
    }
    
    return score;
  }
  
  /**
   * Score fly based on time of day with specific pattern recognition
   */
  private getTimeOfDayBonus(fly: Fly, timeOfDay: string, reasons: string[]): number {
    let score = 0;
    const flyType = fly.type?.toLowerCase() || '';
    const flyName = fly.name?.toLowerCase() || '';
    const flySize = parseInt(fly.primary_size) || 16;
    
    switch (timeOfDay) {
      case 'dawn':
        // Dawn (5am-8am) - Early risers, spinner falls, midges
        if (flyName.includes('midge')) {
          score += 50;
          reasons.push(`🌅 Dawn midge hatches are legendary`);
        } else if (flyName.includes('spinner')) {
          score += 60;
          reasons.push(`🌅 Spinner falls peak at dawn`);
        } else if (flyName.includes('bwo') || flyName.includes('blue wing')) {
          score += 45;
          reasons.push(`🌅 BWOs love cool dawn conditions`);
        } else if (flyType === 'dry' && flySize >= 18) {
          score += 30;
          reasons.push(`🌅 Small dries effective at dawn`);
        } else if (flyType === 'nymph') {
          score += 25;
          reasons.push(`🌅 Pre-hatch nymphing at dawn`);
        }
        
        // Negative for mouse/large streamers
        if (flyName.includes('mouse')) {
          score -= 40;
          reasons.push(`⚠️ Too light for mouse patterns`);
        }
        break;
        
      case 'morning':
        // Morning (8am-12pm) - Active feeding, dry fly time
        if (flyType === 'dry') {
          score += 40;
          reasons.push(`☀️ Morning dry fly action`);
        } else if (flyName.includes('caddis')) {
          score += 45;
          reasons.push(`☀️ Morning caddis hatches common`);
        } else if (flyName.includes('pmd') || flyName.includes('pale morning')) {
          score += 55;
          reasons.push(`☀️ PMD hatches are named after mornings!`);
        } else if (flyType === 'terrestrial') {
          score += 35;
          reasons.push(`☀️ Terrestrials active in morning warmth`);
        } else if (flyType === 'nymph') {
          score += 20;
          reasons.push(`☀️ Nymphs always work in morning`);
        }
        
        // Mouse flies don't work in morning
        if (flyName.includes('mouse')) {
          score -= 35;
          reasons.push(`⚠️ Mouse patterns need darkness`);
        }
        break;
        
      case 'midday':
        // Midday (12pm-2pm) - Toughest time, go deep or small
        if (flyType === 'nymph' && flySize >= 16) {
          score += 40;
          reasons.push(`☀️ Small nymphs work midday when nothing else does`);
        } else if (flyName.includes('midge')) {
          score += 35;
          reasons.push(`☀️ Midges save the midday slump`);
        } else if (flyType === 'streamer') {
          score += 30;
          reasons.push(`☀️ Streamers can provoke midday strikes`);
        } else if (flyType === 'dry') {
          score -= 20;
          reasons.push(`⚠️ Tough time for dry flies (fish less active)`);
        }
        
        // Mouse flies terrible at midday
        if (flyName.includes('mouse')) {
          score -= 50;
          reasons.push(`⚠️ Mouse patterns need low light`);
        }
        break;
        
      case 'afternoon':
        // Afternoon (2pm-6pm) - Second wind, hatches resume
        if (flyName.includes('caddis')) {
          score += 45;
          reasons.push(`🌤️ Afternoon caddis hatches picking up`);
        } else if (flyType === 'terrestrial') {
          score += 50;
          reasons.push(`🌤️ Peak terrestrial activity in afternoon`);
        } else if (flyName.includes('hopper') || flyName.includes('grasshopper')) {
          score += 60;
          reasons.push(`🌤️ Hoppers most active in warm afternoons`);
        } else if (flyName.includes('ant')) {
          score += 55;
          reasons.push(`🌤️ Ant falls common in afternoon`);
        } else if (flyType === 'dry') {
          score += 35;
          reasons.push(`🌤️ Dry fly action resumes`);
        } else if (flyType === 'streamer') {
          score += 30;
          reasons.push(`🌤️ Streamers working as light changes`);
        }
        break;
        
      case 'dusk':
        // Dusk (6pm-8pm) - Prime time! Big flies, spinner falls
        if (flyName.includes('spinner')) {
          score += 70;
          reasons.push(`🌆 Spinner falls dominate at dusk`);
        } else if (flyType === 'streamer' && flySize <= 8) {
          score += 55;
          reasons.push(`🌆 Large streamers excel as light fades`);
        } else if (flyName.includes('caddis')) {
          score += 50;
          reasons.push(`🌆 Evening caddis emergence`);
        } else if (flyName.includes('stone') || flyName.includes('stonefly')) {
          score += 45;
          reasons.push(`🌆 Stoneflies active at dusk`);
        } else if (flyType === 'dry' && flySize <= 14) {
          score += 40;
          reasons.push(`🌆 Larger dries effective at dusk`);
        } else if (flyName.includes('mouse')) {
          score += 40;
          reasons.push(`🌆 Getting dark enough for mouse patterns`);
        }
        break;
        
      case 'night':
        // Night (8pm-5am) - MOUSE FLY TIME! Big streamers, large patterns
        if (flyName.includes('mouse')) {
          score += 100;
          reasons.push(`🌙 PRIME MOUSE PATTERN TIME - big fish hunting!`);
        } else if (flyName.includes('sculpin')) {
          score += 70;
          reasons.push(`🌙 Sculpin patterns mimic nocturnal baitfish`);
        } else if (flyType === 'streamer' && flySize <= 6) {
          score += 65;
          reasons.push(`🌙 Large dark streamers for night hunting`);
        } else if (flyName.includes('bugger') && (fly.color?.toLowerCase().includes('black') || fly.color?.toLowerCase().includes('dark'))) {
          score += 55;
          reasons.push(`🌙 Dark woolly buggers work at night`);
        } else if (flyName.includes('leech')) {
          score += 50;
          reasons.push(`🌙 Leech patterns effective at night`);
        } else if (flyType === 'dry') {
          score -= 40;
          reasons.push(`⚠️ Can't see dry flies at night`);
        } else if (flyType === 'nymph' && flySize >= 16) {
          score -= 30;
          reasons.push(`⚠️ Small nymphs difficult at night`);
        } else {
          score -= 25;
          reasons.push(`⚠️ Night fishing demands big, dark flies`);
        }
        break;
    }
    
    return score;
  }

  // === COMPREHENSIVE DATA SCORING METHODS ===
  
  /**
   * Score fly based on active hatch matching
   */
  private scoreHatchMatching(fly: Fly, hatchData: any, reasons: string[]): number {
    if (!hatchData || !hatchData.active_hatches || hatchData.active_hatches.length === 0) {
      return 0;
    }
    
    let score = 0;
    
    for (const activeHatch of hatchData.active_hatches) {
      const flyName = fly.name?.toLowerCase() || '';
      const flyPattern = fly.pattern_name?.toLowerCase() || '';
      const hatchName = activeHatch.insect?.toLowerCase() || '';
      
      if (flyName.includes(hatchName) || hatchName.includes(flyName) ||
          flyPattern.includes(hatchName) || hatchName.includes(flyPattern)) {
        
        let bonus = 15;
        if (activeHatch.intensity === 'heavy') bonus += 10;
        else if (activeHatch.intensity === 'moderate') bonus += 5;
        
        if (fly.primary_size === activeHatch.size) bonus += 5;
        
        score += bonus;
        reasons.push(`🎣 Matches active ${activeHatch.intensity} ${activeHatch.insect} hatch`);
      }
    }
    
    return score;
  }
  
  /**
   * Score fly based on lunar phase influence
   */
  private scoreLunarInfluence(fly: Fly, reasons: string[], moonPhase?: string, feedingActivity?: string): number {
    if (!moonPhase || !feedingActivity) return 0;
    
    let score = 0;
    
    if (feedingActivity === 'very_high') {
      score += 8;
      reasons.push('🌕 Very high lunar feeding activity');
    } else if (feedingActivity === 'high') {
      score += 5;
      reasons.push('🌙 High lunar feeding activity');
    }
    
    if (moonPhase === 'full' || moonPhase === 'new') {
      score += 3;
      reasons.push(`🌕 ${moonPhase} moon phase`);
      
      if (fly.type === 'dry') {
        score += 2;
        reasons.push('🌕 Dry fly bonus for full moon');
      }
    }
    
    return score;
  }
  
  /**
   * Score fly based on solunar periods
   */
  private scoreSolunarPeriods(fly: Fly, solunarPeriods: any, reasons: string[]): number {
    if (!solunarPeriods) return 0;
    
    let score = 0;
    
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
    
    return score;
  }
  
  /**
   * Score fly based on atmospheric conditions
   */
  private scoreAtmosphericConditions(fly: Fly, weatherData: any, reasons: string[]): number {
    if (!weatherData) return 0;
    
    let score = 0;
    
    if (weatherData.precipitation?.type === 'rain') {
      if (weatherData.precipitation.probability > 50) {
        if (fly.type === 'dry' || fly.type === 'emerger') {
          score += 6;
          reasons.push('🌧️ Rain triggers insect activity');
        }
      }
    }
    
    if (weatherData.pressure) {
      if (weatherData.pressure < 1000) {
        score += 4;
        reasons.push('📉 Low pressure increases fish activity');
      } else if (weatherData.pressure > 1020) {
        if (fly.type === 'nymph' || fly.type === 'imitation') {
          score += 3;
          reasons.push('📈 High pressure - precise imitations work better');
        }
      }
    }
    
    return score;
  }
  
  /**
   * Score fly based on water quality indicators
   */
  private scoreWaterQuality(fly: Fly, waterData: any, reasons: string[]): number {
    if (!waterData) return 0;
    
    let score = 0;
    
    if (waterData.dissolvedOxygen) {
      if (waterData.dissolvedOxygen > 8) {
        if (fly.type === 'dry' || fly.type === 'streamer') {
          score += 4;
          reasons.push('💨 High oxygen levels favor active flies');
        }
      } else if (waterData.dissolvedOxygen < 5) {
        if (fly.type === 'nymph') {
          score += 3;
          reasons.push('💨 Low oxygen - slow presentations work better');
        }
      }
    }
    
    if (waterData.turbidity) {
      if (waterData.turbidity > 30) {
        if (fly.color && (fly.color.toLowerCase().includes('bright') || 
                         fly.color.toLowerCase().includes('chartreuse'))) {
          score += 3;
          reasons.push('🌊 Murky water - bright fly visibility');
        }
      } else if (waterData.turbidity < 5) {
        if (fly.color && (fly.color.toLowerCase().includes('natural') ||
                         fly.color.toLowerCase().includes('olive'))) {
          score += 3;
          reasons.push('🌊 Clear water - natural fly colors');
        }
      }
    }
    
    return score;
  }

  // Get trending flies (recently popular)
  async getTrendingFlies(limit: number = 5): Promise<Fly[]> {
    try {
      const flies = await fliesService.getFlies();
      
      // Calculate trending score: recent usage + success rate
      const trendingFlies = flies
        .filter(fly => fly.total_uses > 0)
        .map(fly => ({
          ...fly,
          trendingScore: fly.total_uses * fly.success_rate
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, limit);

      return trendingFlies;
    } catch (error) {
      console.error('Error getting trending flies:', error);
      return [];
    }
  }
  
  /**
   * Apply diversity algorithm to ensure variety in fly suggestions
   */
  private applyDiversityAlgorithm(suggestions: FlySuggestion[], conditions: FishingConditions): FlySuggestion[] {
    const diverseSuggestions: FlySuggestion[] = [];
    const usedTypes = new Set<string>();
    const usedSizes = new Set<string>();
    
    // First pass: Add top fly from each type (dry, nymph, streamer, etc.)
    const typeGroups = new Map<string, FlySuggestion[]>();
    
    suggestions.forEach(suggestion => {
      const type = suggestion.fly.type;
      if (!typeGroups.has(type)) {
        typeGroups.set(type, []);
      }
      typeGroups.get(type)!.push(suggestion);
    });
    
    // Add the best fly from each type
    typeGroups.forEach((flies, type) => {
      const bestFly = flies.sort((a, b) => b.confidence - a.confidence)[0];
      if (bestFly && !usedTypes.has(type)) {
        diverseSuggestions.push(bestFly);
        usedTypes.add(type);
        usedSizes.add(bestFly.fly.primary_size);
      }
    });
    
    // Second pass: Fill remaining slots with diverse options
    const remaining = suggestions.filter(s => !diverseSuggestions.includes(s));
    const targetCount = Math.min(8, suggestions.length); // Aim for 8 diverse suggestions
    
    for (const suggestion of remaining) {
      if (diverseSuggestions.length >= targetCount) break;
      
      // Prefer flies with different sizes and types
      const hasDifferentSize = !usedSizes.has(suggestion.fly.primary_size);
      const hasDifferentType = !usedTypes.has(suggestion.fly.type);
      
      if (hasDifferentSize || hasDifferentType || diverseSuggestions.length < 5) {
        diverseSuggestions.push(suggestion);
        usedTypes.add(suggestion.fly.type);
        usedSizes.add(suggestion.fly.primary_size);
      }
    }
    
    console.log(`🎯 Applied diversity algorithm: ${diverseSuggestions.length} diverse suggestions from ${suggestions.length} total`);
    return diverseSuggestions;
  }
}

export const flySuggestionService = new FlySuggestionService();

