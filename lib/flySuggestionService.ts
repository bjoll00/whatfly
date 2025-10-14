import { APP_CONFIG } from './appConfig';
import { fliesService } from './supabase';
import { Fly, FlySuggestion } from './types';
import { UsageService } from './usageService';

export class FlySuggestionService {
  // Get fly suggestions based on fishing conditions
  async getSuggestions(
    conditions: {
      location?: string;
      latitude?: number;
      longitude?: number;
      weather_conditions: string;
      water_clarity: string;
      water_level: string;
      water_flow?: string;
      water_depth?: number;
      water_ph?: number;
      dissolved_oxygen?: number;
      time_of_day: string;
      time_of_year?: string;
      water_temperature?: number;
      wind_speed?: string;
      wind_direction?: string;
      air_temperature_range?: string;
      water_data?: any; // Real-time water conditions from USGS/Utah database
    },
    userId?: string
  ): Promise<{ suggestions: FlySuggestion[]; usageInfo?: any; canPerform: boolean }> {
    try {
      console.log('Getting suggestions for conditions:', conditions);
      
      // Check usage limits if user is provided and limits are enabled
      let usageInfo: any = null;
      let canPerform = true;
      
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
      
      // Get all flies first (since we have sample data)
      const flies = await fliesService.getFlies();
      console.log('Retrieved flies:', flies.length);

      if (flies.length === 0) {
        console.log('No flies found in database');
        return {
          suggestions: [],
          usageInfo,
          canPerform: true
        };
      }

      // Score and rank flies
      const suggestions = flies.map(fly => this.scoreFly(fly, conditions));
      console.log('Generated suggestions:', suggestions.length);
      
      // Limit suggestions for free users
      const maxSuggestions = userId && !usageInfo?.usage?.isPremium ? 3 : 5;
      
      // Sort by confidence (highest first) and return top suggestions
      const sortedSuggestions = suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, maxSuggestions);
      
      console.log('Final suggestions:', sortedSuggestions);
      
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
      return {
        suggestions: [],
        usageInfo: null,
        canPerform: false
      };
    }
  }

  // Score a fly based on how well it matches the conditions
  private scoreFly(fly: Fly, conditions: {
    location?: string;
    latitude?: number;
    longitude?: number;
    weather_conditions: string;
    water_clarity: string;
    water_level: string;
    water_flow?: string;
    water_depth?: number;
    water_ph?: number;
    dissolved_oxygen?: number;
    time_of_day: string;
    time_of_year?: string;
    water_temperature?: number;
    wind_speed?: string;
    wind_direction?: string;
    air_temperature_range?: string;
    water_data?: any; // Real-time water conditions
  }): FlySuggestion {
    let score = 5; // Very low base score so condition matching dominates
    let reasons: string[] = [];

    // Base score from success rate (minimal impact)
    const cappedSuccessRate = Math.min(fly.success_rate, 0.7); // Cap at 70%
    score += cappedSuccessRate * 5; // Very small impact

    // Usage-based ranking boost (minimal - condition matching is most important)
    if (fly.total_uses > 0) {
      // Tiny boost for popularity
      const usageBoost = Math.log10(fly.total_uses + 1) * 1; // Minimal impact
      score += usageBoost;
      if (fly.total_uses > 50) {
        reasons.push(`Popular choice (${fly.total_uses} uses)`);
      }
    }

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

    // Weather conditions match - HIGHEST PRIORITY
    if (fly.best_conditions.weather.includes(conditions.weather_conditions)) {
      score += 80; // Very high score for weather match
      reasons.push(`Excellent for ${conditions.weather_conditions} weather`);
    } else {
      score -= 50; // Heavy penalty for weather mismatch
    }

    // Time of day match - HIGH PRIORITY with specific pattern bonuses
    const timeOfDayBonus = this.getTimeOfDayBonus(fly, conditions.time_of_day, reasons);
    score += timeOfDayBonus;
    
    if (fly.best_conditions.time_of_day.includes(conditions.time_of_day)) {
      score += 75; // Very high score for time of day match
      reasons.push(`Perfect for ${conditions.time_of_day} fishing`);
    } else {
      score -= 45; // Heavy penalty for time of day mismatch
    }

    // Time of year (season) match - HIGH PRIORITY
    if (conditions.time_of_year && fly.best_conditions.time_of_year) {
      if (fly.best_conditions.time_of_year.includes(conditions.time_of_year)) {
        score += 70; // Very high score for season match
        reasons.push(`Excellent for ${conditions.time_of_year} season`);
      } else {
        score -= 40; // Heavy penalty for season mismatch
      }
    }

    // Water temperature match - SEASONAL IMPORTANCE
    if (conditions.water_temperature && fly.best_conditions.water_temperature_range) {
      const { min, max } = fly.best_conditions.water_temperature_range;
      if (conditions.water_temperature >= min && conditions.water_temperature <= max) {
        score += 50; // High score for temperature match
        reasons.push(`Ideal water temperature for this season`);
      } else {
        score -= 30; // Heavy penalty for temperature mismatch
      }
    }

    // Water clarity match (secondary importance)
    if (fly.best_conditions.water_clarity.includes(conditions.water_clarity)) {
      score += 25; // Moderate score for clarity match
      reasons.push(`Effective in ${conditions.water_clarity} water`);
    } else {
      score -= 10; // Moderate penalty for clarity mismatch
    }

    // Water level match (secondary importance)
    if (fly.best_conditions.water_level.includes(conditions.water_level)) {
      score += 25; // Moderate score for level match
      reasons.push(`Works well with ${conditions.water_level} water levels`);
    } else {
      score -= 10; // Moderate penalty for level mismatch
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

    // Add small bonus for high success rate (minimal)
    if (fly.success_rate > 0.8) {
      score += 2; // Very small bonus
      reasons.push('High success rate');
    }

    // Add tiny bonus for well-tested flies (minimal)
    if (fly.total_uses > 20) {
      score += 1; // Tiny bonus
      reasons.push('Well-tested fly');
    }

    // Ensure minimum confidence
    const confidence = Math.min(100, Math.max(5, score));

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
    const flyType = fly.type.toLowerCase();
    
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
        if (flyType === 'nymph' && fly.size.includes('heavy')) return 1;
        break;
    }
    
    return 0;
  }

  private getDepthMatch(fly: Fly, depth: number): number {
    // Determine fly effectiveness based on water depth
    const flyType = fly.type.toLowerCase();
    
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
    const flyType = fly.type.toLowerCase();
    
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
        if (flyType === 'streamer' || (flyType === 'nymph' && fly.size.includes('heavy'))) return 1;
        break;
    }
    
    return 0;
  }

  private getAirTempMatch(fly: Fly, airTemp: string): number {
    // Determine fly effectiveness based on air temperature
    const flyType = fly.type.toLowerCase();
    
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
      
      // Get all flies to match names to IDs
      const allFlies = await fliesService.getFlies();
      console.log('Found flies:', allFlies.length);
      
      // Update success rates for flies used
      for (const flyName of log.flies_used) {
        const fly = allFlies.find(f => f.name === flyName);
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
    const flyType = fly.type.toLowerCase();
    
    // Very low flow (< 30 cfs) - Still water tactics
    if (flowRate < 30) {
      if (flyType === 'dry' || flyType === 'terrestrial') {
        score += 40;
        reasons.push(`💧 Perfect for low flow (${flowRate} cfs) - fish looking up`);
      } else if (flyType === 'nymph' && parseInt(fly.size) >= 18) {
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
      } else if (flyType === 'nymph' && parseInt(fly.size) <= 14) {
        score += 45;
        reasons.push(`💧 Large nymphs effective in high flow (${flowRate} cfs)`);
      } else {
        score += 10;
      }
    }
    // Very high flow (> 300 cfs) - Big flies only
    else {
      if (flyType === 'streamer' && parseInt(fly.size) <= 6) {
        score += 70;
        reasons.push(`💧 Very high flow demands large streamers (${flowRate} cfs)`);
      } else if (flyType === 'nymph' && parseInt(fly.size) <= 10) {
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
    const flyType = fly.type.toLowerCase();
    
    // Very cold water (< 35°F) - Midges and small nymphs
    if (waterTemp < 35) {
      if (flyType === 'nymph' && parseInt(fly.size) >= 18) {
        score += 60;
        reasons.push(`❄️ Ice cold water (${waterTemp}°F) - tiny nymphs essential`);
      } else if (fly.name.toLowerCase().includes('midge')) {
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
      } else if (flyType === 'streamer' && fly.name.toLowerCase().includes('bugger')) {
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
      if (fly.name.toLowerCase().includes('blue wing') || fly.name.toLowerCase().includes('bwo')) {
        score += 30;
        reasons.push(`🦋 BWO hatch likely at ${waterTemp}°F`);
      }
    }
    // Warm water (55-65°F) - Peak activity
    else if (waterTemp < 65) {
      score += 60;
      reasons.push(`🌡️ Perfect temperature (${waterTemp}°F) - fish feeding aggressively`);
      
      // Caddis and PMD bonus
      if (fly.name.toLowerCase().includes('caddis') || fly.name.toLowerCase().includes('pmd')) {
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
      if (flyType === 'dry' && fly.size && parseInt(fly.size) >= 16) {
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
    const flyType = fly.type.toLowerCase();
    
    // Very low (< 1.5 ft) - Fish spooky
    if (gaugeHeight < 1.5) {
      if (flyType === 'dry' && parseInt(fly.size) >= 18) {
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
    const flyType = fly.type.toLowerCase();
    const flyName = fly.name.toLowerCase();
    const flySize = parseInt(fly.size) || 16;
    
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
        } else if (flyName.includes('bugger') && (fly.color.toLowerCase().includes('black') || fly.color.toLowerCase().includes('dark'))) {
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
}

export const flySuggestionService = new FlySuggestionService();

