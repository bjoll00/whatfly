import { APP_CONFIG } from './appConfig';
import { debugLogger } from './debugLogger';
import { fliesService } from './supabase';
import { FishingConditions, Fly, FlySuggestion } from './types';
import { UsageService } from './usageService';

/**
 * HIERARCHICAL FLY SUGGESTION ALGORITHM
 * Based on real guide methodology with environmental priority system
 * 
 * 🎯 1. Location Type & Water Source (River vs Lake)
 * 🌦️ 2. Weather & Light Conditions (Bright sun, overcast, windy)
 * 🌊 3. Water Conditions (Clarity, flow, temperature from USGS)
 * 🌙 4. Season & Hatch Timing (Local hatch charts)
 * 🌕 5. Lunar Activity (Moon phases and solunar periods)
 * 🧠 6. Algorithmic Weighting (Versatile flies get bonuses)
 */
export class HierarchicalFlySuggestionService {
  
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
        debugLogger.log('ALGORITHM', 'Insufficient location data', 'error');
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
      const flies = await fliesService.getFlies();
      
      if (!flies || flies.length === 0) {
        debugLogger.log('ALGORITHM', 'No flies found in database', 'error');
        return {
          suggestions: [],
          usageInfo,
          canPerform: false,
          error: 'No flies found in database. Please check database connection.'
        };
      }
      
      // Filter to ensure we only use official database flies
      const officialFlies = flies.filter(fly => {
        const hasBasicFields = fly.id && fly.name && fly.type;
        const isNotCustom = !fly.name.toLowerCase().includes('custom') &&
                           !fly.name.toLowerCase().includes('user') &&
                           !fly.name.toLowerCase().includes('personal') &&
                           !fly.name.toLowerCase().includes('my ') &&
                           !fly.name.toLowerCase().includes('test') &&
                           !fly.name.toLowerCase().includes('temp');
        
        if (hasBasicFields && isNotCustom) {
          if (!fly.primary_size) fly.primary_size = fly.size || '16';
          if (!fly.color) fly.color = 'Natural';
          if (!fly.success_rate) fly.success_rate = 0;
          if (!fly.total_uses) fly.total_uses = 0;
          if (!fly.successful_uses) fly.successful_uses = 0;
        }
        
        return hasBasicFields && isNotCustom;
      });
      
      
      // Validate that we have real data, not just fallbacks
      const hasRealWeatherData = !!(conditions.weather_data?.temperature && conditions.weather_data?.weather_condition);
      const hasRealWaterData = !!(conditions.water_data?.waterTemperature || conditions.water_data?.flowRate);
      
      debugLogger.log('ALGORITHM', `Data validation: Weather=${hasRealWeatherData ? '✅' : '❌'}, Water=${hasRealWaterData ? '✅' : '❌'}`);
      
      // Build complete conditions object - prioritize real data over fallbacks
      const completeConditions: FishingConditions = {
        date: conditions.date || new Date().toISOString().split('T')[0],
        location: conditions.location || 'Unknown Location',
        latitude: conditions.latitude || 0,
        longitude: conditions.longitude || 0,
        location_address: conditions.location_address || 'Unknown Address',
        // Only use fallbacks if no real data is available
        weather_conditions: hasRealWeatherData ? conditions.weather_conditions : (conditions.weather_conditions || 'sunny'),
        wind_speed: conditions.wind_speed || 'light',
        wind_direction: conditions.wind_direction || 'variable',
        air_temperature_range: conditions.air_temperature_range || 'moderate',
        water_conditions: conditions.water_conditions || 'calm',
        water_clarity: hasRealWaterData ? conditions.water_clarity : (conditions.water_clarity || 'clear'),
        water_level: conditions.water_level || 'normal',
        water_flow: hasRealWaterData ? conditions.water_flow : (conditions.water_flow || 'moderate'),
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
      
      
      // Score all flies using hierarchical methodology
      const scoredFlies = officialFlies.map(fly => this.scoreFlyHierarchical(fly, completeConditions));
      
      // Sort by confidence (highest first)
      scoredFlies.sort((a, b) => b.confidence - a.confidence);
      
      // Apply diversity algorithm to ensure variety
      const diverseSuggestions = this.applyDiversityAlgorithm(scoredFlies, completeConditions);
      
      // Take top suggestions
      const maxSuggestions = userId && !usageInfo?.usage?.isPremium ? 3 : 8;
      const topSuggestions = diverseSuggestions.slice(0, maxSuggestions);
      
      
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
      console.error('Error getting hierarchical fly suggestions:', error);
      return {
        suggestions: [],
        usageInfo: null,
        canPerform: false,
        error: error instanceof Error ? error.message : 'Failed to get fly suggestions'
      };
    }
  }
  
  /**
   * HIERARCHICAL SCORING ALGORITHM
   * Follows real guide methodology with environmental priority system
   */
  private scoreFlyHierarchical(fly: Fly, conditions: FishingConditions): FlySuggestion {
    let score = 0;
    let reasons: string[] = [];

    // 🎯 1. LOCATION TYPE & WATER SOURCE (HIGHEST PRIORITY)
    const locationScore = this.scoreLocationType(fly, conditions, reasons);
    score += locationScore;

    // 🌦️ 2. WEATHER & LIGHT CONDITIONS (HIGH PRIORITY)
    const weatherScore = this.scoreWeatherAndLight(fly, conditions, reasons);
    score += weatherScore;

    // 🌊 3. WATER CONDITIONS (HIGH PRIORITY)
    const waterScore = this.scoreWaterConditions(fly, conditions, reasons);
    score += waterScore;

    // 🌙 4. SEASON & HATCH TIMING (HIGH PRIORITY)
    const hatchScore = this.scoreSeasonAndHatch(fly, conditions, reasons);
    score += hatchScore;

    // 🌕 5. LUNAR ACTIVITY (MEDIUM PRIORITY)
    const lunarScore = this.scoreLunarActivity(fly, conditions, reasons);
    score += lunarScore;

    // 🧠 6. ALGORITHMIC WEIGHTING & DIVERSITY (MEDIUM PRIORITY)
    const diversityScore = this.scoreVersatilityAndDiversity(fly, conditions, reasons);
    score += diversityScore;

    // 🎲 7. ADD UNIQUENESS AND DIVERSITY BONUSES
    const uniquenessScore = this.scoreUniquenessAndDiversity(fly, conditions, reasons);
    score += uniquenessScore;

    // 🌡️ 8. REAL-TIME DATA BONUSES
    const realTimeScore = this.scoreRealTimeData(fly, conditions, reasons);
    score += realTimeScore;

    // Ensure minimum score and calculate confidence
    score = Math.max(score, 5);
    const confidence = Math.min(100, Math.max(10, score));

    // Only log problematic flies with debug logger
    if (fly.name.toLowerCase().includes('chubby')) {
      debugLogger.log('ALGORITHM', `Chubby Chernobyl scored ${score} points`, 'warn');
    }

    return {
      fly,
      confidence,
      reason: reasons.join('; ')
    };
  }

  /**
   * 🎯 1. LOCATION TYPE & WATER SOURCE
   * Rivers → prioritize current-based patterns (nymphs, streamers, emergers)
   * Lakes → emphasize stillwater patterns (chironomids, leeches, damsels, callibaetis)
   */
  private scoreLocationType(fly: Fly, conditions: FishingConditions, reasons: string[]): number {
    let score = 0;
    
    // Determine if this is a river or lake based on location name and coordinates
    const isRiver = this.isRiverLocation(conditions);
    const isLake = this.isLakeLocation(conditions);
    
    const flyType = fly.type?.toLowerCase() || '';
    const flyName = fly.name?.toLowerCase() || '';
    
    if (isRiver) {
      // River priorities: current-based patterns
      if (flyType === 'nymph') {
        score += 40;
        reasons.push('🌊 River fishing - nymphs excel in current');
      } else if (flyType === 'streamer') {
        score += 35;
        reasons.push('🌊 River fishing - streamers work well in current');
      } else if (flyType === 'emerger') {
        score += 30;
        reasons.push('🌊 River fishing - emergers match river hatches');
      } else if (flyName.includes('stonefly') || flyName.includes('stone')) {
        score += 35;
        reasons.push('🌊 Stoneflies are river specialists');
      } else if (flyName.includes('caddis')) {
        score += 25;
        reasons.push('🌊 Caddisflies thrive in rivers');
      } else {
        score += 10; // Other flies still work in rivers
      }
    } else if (isLake) {
      // Lake priorities: stillwater patterns
      if (flyName.includes('midge') || flyName.includes('chironomid')) {
        score += 45;
        reasons.push('🏞️ Lake fishing - midges are lake specialists');
      } else if (flyName.includes('leech')) {
        score += 40;
        reasons.push('🏞️ Lake fishing - leeches excel in stillwater');
      } else if (flyName.includes('damsel') || flyName.includes('damselfly')) {
        score += 35;
        reasons.push('🏞️ Lake fishing - damselflies are lake insects');
      } else if (flyName.includes('callibaetis')) {
        score += 30;
        reasons.push('🏞️ Lake fishing - callibaetis are lake mayflies');
      } else if (flyType === 'dry' && flyName.includes('hopper')) {
        score += 25;
        reasons.push('🏞️ Lake fishing - hoppers work on lake edges');
      } else {
        score += 15; // Other flies still work in lakes
      }
    } else {
      // Unknown water type - balanced approach
      score += 20;
      reasons.push('🎣 General water type - balanced approach');
    }
    
    // Regional effectiveness bonus
    const region = this.determineRegion(conditions.latitude, conditions.longitude);
    if (fly.regional_effectiveness?.regions?.includes(region)) {
      score += 15;
      reasons.push(`🗺️ Effective in ${region} region`);
    }
    
    return score;
  }

  /**
   * 🌦️ 2. WEATHER & LIGHT CONDITIONS
   * Bright sun: smaller, more natural or muted flies
   * Overcast or rainy: larger or more visible patterns
   * Windy: terrestrials or larger-profile flies
   */
  private scoreWeatherAndLight(fly: Fly, conditions: FishingConditions, reasons: string[]): number {
    let score = 0;
    
    const weather = conditions.weather_conditions?.toLowerCase() || 'sunny';
    const windSpeed = conditions.wind_speed?.toLowerCase() || 'light';
    const timeOfDay = conditions.time_of_day?.toLowerCase() || 'morning';
    
    const flyType = fly.type?.toLowerCase() || '';
    const flyName = fly.name?.toLowerCase() || '';
    const flySize = parseInt(fly.primary_size) || 16;
    const flyColor = fly.color?.toLowerCase() || '';
    
    // Bright sun conditions
    if (weather === 'sunny' || weather === 'clear') {
      if (flySize >= 18) {
        score += 25;
        reasons.push('☀️ Bright sun - small flies less visible to fish');
      } else if (flyColor.includes('natural') || flyColor.includes('olive') || flyColor.includes('brown')) {
        score += 20;
        reasons.push('☀️ Natural colors work well in bright light');
      } else {
        score += 10;
        reasons.push('☀️ Bright conditions require subtle presentations');
      }
    }
    
    // Overcast or rainy conditions
    if (weather === 'overcast' || weather === 'cloudy' || weather === 'rainy') {
      if (flySize <= 14) {
        score += 30;
        reasons.push('☁️ Overcast conditions - larger flies more visible');
      } else if (flyName.includes('attractor') || flyColor.includes('bright') || flyColor.includes('chartreuse')) {
        score += 25;
        reasons.push('☁️ Bright attractors excel in low light');
      } else {
        score += 20;
        reasons.push('☁️ Overcast conditions favor visible patterns');
      }
    }
    
    // Windy conditions
    if (windSpeed === 'moderate' || windSpeed === 'strong' || windSpeed === 'very_strong') {
      if (flyType === 'terrestrial' || flyName.includes('hopper') || flyName.includes('ant')) {
        score += 35;
        reasons.push('💨 Windy conditions - terrestrials blown into water');
      } else if (flyType === 'streamer' || flySize <= 10) {
        score += 25;
        reasons.push('💨 Windy conditions - heavy flies cut through wind');
      } else if (flyType === 'dry') {
        score -= 15;
        reasons.push('⚠️ Wind makes dry fly presentation difficult');
      } else {
        score += 10;
        reasons.push('💨 Wind affects fly presentation');
      }
    }
    
    // Time of day considerations
    if (timeOfDay === 'dawn' || timeOfDay === 'dusk') {
      if (flyName.includes('spinner') || flyName.includes('fall')) {
        score += 30;
        reasons.push('🌅 Dawn/dusk - spinner falls common');
      } else if (flyType === 'dry' && flySize <= 14) {
        score += 20;
        reasons.push('🌅 Dawn/dusk - larger dries more visible');
      }
    } else if (timeOfDay === 'night') {
      if (flyName.includes('mouse') || flyType === 'streamer' && flySize <= 6) {
        score += 40;
        reasons.push('🌙 Night fishing - large dark patterns');
      } else if (flyType === 'dry') {
        score -= 30;
        reasons.push('⚠️ Dry flies ineffective at night');
      }
    }
    
    return score;
  }

  /**
   * 🌊 3. WATER CONDITIONS (from USGS or field input)
   * Clarity: Clear → natural colors, smaller sizes; Murky → darker, larger, flashier
   * Flow: High → weighted nymphs/streamers; Low → smaller dry flies/emergers
   * Temperature: Cold → midges/worms/streamers; Warm → terrestrials/hoppers
   */
  private scoreWaterConditions(fly: Fly, conditions: FishingConditions, reasons: string[]): number {
    let score = 0;
    
    const waterClarity = conditions.water_clarity?.toLowerCase() || 'clear';
    const waterFlow = conditions.water_flow?.toLowerCase() || 'moderate';
    const waterTemp = conditions.water_temperature || 50;
    const waterLevel = conditions.water_level?.toLowerCase() || 'normal';
    
    const flyType = fly.type?.toLowerCase() || '';
    const flyName = fly.name?.toLowerCase() || '';
    const flySize = parseInt(fly.primary_size) || 16;
    const flyColor = fly.color?.toLowerCase() || '';
    
    // Water clarity scoring
    if (waterClarity === 'clear') {
      if (flyColor.includes('natural') || flyColor.includes('olive') || flyColor.includes('brown')) {
        score += 25;
        reasons.push('💧 Clear water - natural colors essential');
      } else if (flySize >= 18) {
        score += 20;
        reasons.push('💧 Clear water - small flies less spooky');
      } else {
        score += 10;
        reasons.push('💧 Clear water requires subtle presentations');
      }
    } else if (waterClarity === 'murky' || waterClarity === 'muddy') {
      if (flyColor.includes('bright') || flyColor.includes('chartreuse') || flyColor.includes('orange')) {
        score += 30;
        reasons.push('💧 Murky water - bright flies more visible');
      } else if (flySize <= 12) {
        score += 25;
        reasons.push('💧 Murky water - larger flies create more disturbance');
      } else {
        score += 15;
        reasons.push('💧 Murky water - visibility is key');
      }
    }
    
    // Water flow scoring
    if (waterFlow === 'fast' || waterFlow === 'rapid') {
      if (flyType === 'streamer' || flyName.includes('weighted') || flyName.includes('heavy')) {
        score += 35;
        reasons.push('🌊 Fast water - weighted flies cut through current');
      } else if (flyType === 'nymph' && flySize <= 14) {
        score += 25;
        reasons.push('🌊 Fast water - heavy nymphs effective');
      } else if (flyType === 'dry') {
        score -= 20;
        reasons.push('⚠️ Fast water makes dry fly presentation difficult');
      }
    } else if (waterFlow === 'slow' || waterFlow === 'still') {
      if (flyType === 'dry' || flyType === 'emerger') {
        score += 30;
        reasons.push('🌊 Slow water - dry flies and emergers excel');
      } else if (flyType === 'nymph' && flySize >= 18) {
        score += 25;
        reasons.push('🌊 Slow water - small nymphs work well');
      } else {
        score += 15;
        reasons.push('🌊 Slow water - delicate presentations work');
      }
    }
    
    // Water temperature scoring
    if (waterTemp < 45) {
      // Cold water
      if (flyName.includes('midge') || flySize >= 20) {
        score += 40;
        reasons.push('❄️ Cold water - midges and tiny flies essential');
      } else if (flyName.includes('worm') || flyName.includes('san juan')) {
        score += 35;
        reasons.push('❄️ Cold water - worms are go-to patterns');
      } else if (flyType === 'streamer' && flyName.includes('bugger')) {
        score += 25;
        reasons.push('❄️ Cold water - slow streamer retrieves');
      } else if (flyType === 'dry' && flySize <= 12) {
        score -= 30;
        reasons.push('⚠️ Large dry flies ineffective in cold water');
      }
    } else if (waterTemp > 65) {
      // Warm water
      if (flyType === 'terrestrial' || flyName.includes('hopper') || flyName.includes('ant')) {
        score += 35;
        reasons.push('☀️ Warm water - terrestrials active');
      } else if (flyType === 'dry' && flySize <= 14) {
        score += 25;
        reasons.push('☀️ Warm water - surface feeding active');
      } else {
        score += 15;
        reasons.push('☀️ Warm water - fish more active');
      }
    } else {
      // Moderate temperature
      score += 20;
      reasons.push('🌡️ Moderate water temperature - most flies work');
    }
    
    // Water level scoring
    if (waterLevel === 'high') {
      if (flyType === 'streamer' || flySize <= 10) {
        score += 25;
        reasons.push('📈 High water - large flies and streamers');
      } else if (flyType === 'dry') {
        score -= 15;
        reasons.push('⚠️ High water - dry flies less effective');
      }
    } else if (waterLevel === 'low') {
      if (flyType === 'dry' && flySize >= 18) {
        score += 30;
        reasons.push('📉 Low water - small dry flies less spooky');
      } else if (flyType === 'nymph' && flySize >= 18) {
        score += 25;
        reasons.push('📉 Low water - small nymphs essential');
      }
    }
    
    // Real-time USGS data bonus
    if (conditions.water_data?.dataQuality === 'GOOD') {
      score += 15;
      reasons.push(`🎯 Real-time USGS data from ${conditions.water_data.stationName || 'monitoring station'}`);
    }
    
    return score;
  }

  /**
   * 🌙 4. SEASON & HATCH TIMING
   * Spring: BWOs, stoneflies, early caddis, leeches
   * Summer: PMDs, terrestrials, caddis, attractors
   * Fall: October caddis, streamers, midges
   * Winter: midges, eggs, worms, small streamers
   */
  private scoreSeasonAndHatch(fly: Fly, conditions: FishingConditions, reasons: string[]): number {
    let score = 0;
    
    const season = conditions.time_of_year?.toLowerCase() || 'summer';
    const timeOfDay = conditions.time_of_day?.toLowerCase() || 'morning';
    const waterTemp = conditions.water_temperature || 50;
    
    const flyType = fly.type?.toLowerCase() || '';
    const flyName = fly.name?.toLowerCase() || '';
    const flySize = parseInt(fly.primary_size) || 16;
    
    // Seasonal scoring
    if (season === 'spring') {
      if (flyName.includes('bwo') || flyName.includes('blue wing')) {
        score += 40;
        reasons.push('🌸 Spring - BWO hatches are critical');
      } else if (flyName.includes('stone') || flyName.includes('stonefly')) {
        score += 35;
        reasons.push('🌸 Spring - stonefly hatches begin');
      } else if (flyName.includes('caddis')) {
        score += 25;
        reasons.push('🌸 Spring - early caddis activity');
      } else if (flyName.includes('leech')) {
        score += 20;
        reasons.push('🌸 Spring - leeches become active');
      }
    } else if (season === 'summer') {
      if (flyName.includes('pmd') || flyName.includes('pale morning')) {
        score += 40;
        reasons.push('☀️ Summer - PMD hatches peak');
      } else if (flyType === 'terrestrial' || flyName.includes('hopper') || flyName.includes('ant')) {
        score += 35;
        reasons.push('☀️ Summer - terrestrial season');
      } else if (flyName.includes('caddis')) {
        score += 30;
        reasons.push('☀️ Summer - caddis hatches heavy');
      } else if (flyName.includes('attractor')) {
        score += 25;
        reasons.push('☀️ Summer - attractor patterns work');
      }
    } else if (season === 'fall') {
      if (flyName.includes('october') || flyName.includes('caddis')) {
        score += 40;
        reasons.push('🍂 Fall - October caddis season');
      } else if (flyType === 'streamer' && flySize <= 8) {
        score += 35;
        reasons.push('🍂 Fall - large streamers for aggressive fish');
      } else if (flyName.includes('midge')) {
        score += 25;
        reasons.push('🍂 Fall - midge activity increases');
      } else if (flyName.includes('bwo') || flyName.includes('blue wing')) {
        score += 30;
        reasons.push('🍂 Fall - fall BWO hatches');
      }
    } else if (season === 'winter') {
      if (flyName.includes('midge') || flySize >= 20) {
        score += 45;
        reasons.push('❄️ Winter - midges are the only game');
      } else if (flyName.includes('worm') || flyName.includes('san juan')) {
        score += 40;
        reasons.push('❄️ Winter - worms are essential');
      } else if (flyType === 'streamer' && flySize >= 16) {
        score += 25;
        reasons.push('❄️ Winter - small streamers work');
      } else if (flyType === 'dry') {
        score -= 30;
        reasons.push('⚠️ Winter - dry flies rarely work');
      }
    }
    
    // Hatch calendar integration
    if (conditions.hatch_data?.active_hatches) {
      for (const activeHatch of conditions.hatch_data.active_hatches) {
        const hatchName = activeHatch.insect?.toLowerCase() || '';
        
        // Check if fly matches active hatch
        if (flyName.includes(hatchName) || hatchName.includes(flyName)) {
          let bonus = 20;
          if (activeHatch.intensity === 'heavy') bonus += 15;
          else if (activeHatch.intensity === 'moderate') bonus += 10;
          
          score += bonus;
          reasons.push(`🦋 Matches active ${activeHatch.intensity} ${activeHatch.insect} hatch`);
        }
      }
    }
    
    return score;
  }

  /**
   * 🌕 5. LUNAR ACTIVITY
   * Active lunar phases (new/full moon) boost early morning/night feeding
   * Recommend larger or silhouette-heavy flies during peak lunar activity
   */
  private scoreLunarActivity(fly: Fly, conditions: FishingConditions, reasons: string[]): number {
    let score = 0;
    
    const moonPhase = conditions.moon_phase || '';
    const feedingActivity = conditions.lunar_feeding_activity || '';
    const timeOfDay = conditions.time_of_day?.toLowerCase() || 'morning';
    
    const flyType = fly.type?.toLowerCase() || '';
    const flyName = fly.name?.toLowerCase() || '';
    const flySize = parseInt(fly.primary_size) || 16;
    
    // High lunar feeding activity
    if (feedingActivity === 'very_high') {
      score += 20;
      reasons.push('🌕 Very high lunar feeding activity');
      
      if (flyType === 'streamer' && flySize <= 8) {
        score += 15;
        reasons.push('🌕 Large streamers for peak lunar feeding');
      } else if (flyName.includes('mouse')) {
        score += 25;
        reasons.push('🌕 Mouse patterns excel during peak lunar activity');
      }
    } else if (feedingActivity === 'high') {
      score += 12;
      reasons.push('🌙 High lunar feeding activity');
    }
    
    // Moon phase specific scoring
    if (moonPhase === 'full' || moonPhase === 'new') {
      score += 10;
      reasons.push(`🌕 ${moonPhase} moon phase - excellent fishing`);
      
      if (moonPhase === 'full' && flyType === 'dry') {
        score += 8;
        reasons.push('🌕 Full moon - dry flies work well');
      } else if (moonPhase === 'new' && flyName.includes('mouse')) {
        score += 15;
        reasons.push('🌑 New moon - perfect for mouse patterns');
      }
    }
    
    // Night fishing during lunar activity
    if (timeOfDay === 'night' && (moonPhase === 'full' || feedingActivity === 'high')) {
      if (flyName.includes('mouse') || flyType === 'streamer' && flySize <= 6) {
        score += 30;
        reasons.push('🌙 Night + lunar activity - large dark patterns');
      }
    }
    
    // Solunar periods
    if (conditions.solunar_periods?.current_period?.active) {
      const periodType = conditions.solunar_periods.current_period.type;
      const remaining = conditions.solunar_periods.current_period.remaining || 0;
      
      if (periodType === 'major') {
        score += 15;
        reasons.push(`🎯 Major solunar period active (${Math.round(remaining)} min remaining)`);
      } else if (periodType === 'minor') {
        score += 8;
        reasons.push(`🎯 Minor solunar period active (${Math.round(remaining)} min remaining)`);
      }
    }
    
    return score;
  }

  /**
   * 🧠 6. ALGORITHMIC WEIGHTING & DIVERSITY
   * Bonus for flies that perform well across multiple conditions (versatile patterns)
   * Weight by type to promote diversity
   */
  private scoreVersatilityAndDiversity(fly: Fly, conditions: FishingConditions, reasons: string[]): number {
    let score = 0;
    
    const flyType = fly.type?.toLowerCase() || '';
    const flyName = fly.name?.toLowerCase() || '';
    
    // Versatility bonus - flies that work in many conditions
    const versatilityScore = this.calculateVersatilityBonus(fly);
    score += versatilityScore;
    
    if (versatilityScore > 15) {
      reasons.push('⭐ Highly versatile pattern');
    } else if (versatilityScore > 8) {
      reasons.push('⭐ Versatile pattern');
    }
    
    // Fly type diversity weighting
    switch (flyType) {
      case 'nymph':
        score += 10; // Nymphs are always effective
        reasons.push('🎣 Nymphs are always effective');
        break;
      case 'dry':
        score += 8; // Dry flies are popular
        reasons.push('🎣 Dry fly fishing is exciting');
        break;
      case 'streamer':
        score += 7; // Streamers for aggressive fish
        reasons.push('🎣 Streamers for aggressive fish');
        break;
      case 'terrestrial':
        score += 6; // Terrestrials are seasonal
        reasons.push('🎣 Terrestrials match natural food');
        break;
      case 'emerger':
        score += 9; // Emergers are very effective
        reasons.push('🎣 Emergers match natural insect stages');
        break;
      default:
        score += 5;
        break;
    }
    
    // Bonus for flies that work across multiple conditions
    const conditionCount = this.countMatchingConditions(fly, conditions);
    if (conditionCount > 5) {
      score += 12;
      reasons.push(`⭐ Works in ${conditionCount} different conditions`);
    } else if (conditionCount > 3) {
      score += 8;
      reasons.push(`⭐ Adaptable to ${conditionCount} conditions`);
    }
    
    return score;
  }

  // Helper methods for location type detection
  private isRiverLocation(conditions: FishingConditions): boolean {
    const location = conditions.location?.toLowerCase() || '';
    const address = conditions.location_address?.toLowerCase() || '';
    
    const riverKeywords = ['river', 'creek', 'stream', 'fork', 'branch', 'canyon', 'gorge'];
    return riverKeywords.some(keyword => 
      location.includes(keyword) || address.includes(keyword)
    );
  }

  private isLakeLocation(conditions: FishingConditions): boolean {
    const location = conditions.location?.toLowerCase() || '';
    const address = conditions.location_address?.toLowerCase() || '';
    
    const lakeKeywords = ['lake', 'pond', 'reservoir', 'impoundment'];
    return lakeKeywords.some(keyword => 
      location.includes(keyword) || address.includes(keyword)
    );
  }

  private determineRegion(latitude: number, longitude: number): string {
    // Western U.S. mountain rivers often favor stoneflies, caddis, and midges
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

  private calculateVersatilityBonus(fly: Fly): number {
    let versatilityScore = 0;
    
    // Count how many conditions this fly works in
    const weatherCount = fly.best_conditions?.weather?.length || 0;
    const timeCount = fly.best_conditions?.time_of_day?.length || 0;
    const seasonCount = fly.best_conditions?.time_of_year?.length || 0;
    const clarityCount = fly.best_conditions?.water_clarity?.length || 0;
    const levelCount = fly.best_conditions?.water_level?.length || 0;
    
    const totalConditions = weatherCount + timeCount + seasonCount + clarityCount + levelCount;
    
    if (totalConditions > 15) {
      versatilityScore = 20;
    } else if (totalConditions > 10) {
      versatilityScore = 15;
    } else if (totalConditions > 6) {
      versatilityScore = 10;
    } else if (totalConditions > 3) {
      versatilityScore = 5;
    }
    
    return versatilityScore;
  }

  private countMatchingConditions(fly: Fly, conditions: FishingConditions): number {
    let count = 0;
    
    // Check weather conditions
    if (fly.best_conditions?.weather?.includes(conditions.weather_conditions || '')) count++;
    
    // Check time of day
    if (fly.best_conditions?.time_of_day?.includes(conditions.time_of_day || '')) count++;
    
    // Check season
    if (fly.best_conditions?.time_of_year?.includes(conditions.time_of_year || '')) count++;
    
    // Check water clarity
    if (fly.best_conditions?.water_clarity?.includes(conditions.water_clarity || '')) count++;
    
    // Check water level
    if (fly.best_conditions?.water_level?.includes(conditions.water_level || '')) count++;
    
    // Check water temperature range
    if (conditions.water_temperature && fly.best_conditions?.water_temperature_range) {
      const { min, max } = fly.best_conditions.water_temperature_range;
      if (conditions.water_temperature >= min && conditions.water_temperature <= max) count++;
    }
    
    return count;
  }

  /**
   * Apply diversity algorithm to ensure variety in suggestions
   */
  private applyDiversityAlgorithm(suggestions: FlySuggestion[], conditions: FishingConditions): FlySuggestion[] {
    const diverseSuggestions: FlySuggestion[] = [];
    const usedTypes = new Set<string>();
    const usedSizes = new Set<string>();
    const usedColors = new Set<string>();
    
    // First pass: Add top fly from each type
    const typeGroups = new Map<string, FlySuggestion[]>();
    
    suggestions.forEach(suggestion => {
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
    suggestions.forEach(suggestion => {
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

  /**
   * 🎲 UNIQUENESS AND DIVERSITY SCORING
   * Ensures different locations get different suggestions
   */
  private scoreUniquenessAndDiversity(fly: Fly, conditions: FishingConditions, reasons: string[]): number {
    let score = 0;
    
    // Add randomness based on location coordinates to ensure uniqueness
    const locationHash = (conditions.latitude * 1000 + conditions.longitude * 1000) % 100;
    const flyHash = fly.name.length * fly.type.length % 50;
    const uniquenessBonus = (locationHash + flyHash) % 20 - 10; // -10 to +10 points
    
    if (uniquenessBonus > 5) {
      score += uniquenessBonus;
      reasons.push('🎲 Location-specific uniqueness bonus');
    }
    
    // Bonus for flies that match specific location characteristics
    const flyName = fly.name?.toLowerCase() || '';
    const location = conditions.location?.toLowerCase() || '';
    
    // Location-specific fly bonuses
    if (location.includes('river') && (flyName.includes('stonefly') || flyName.includes('caddis'))) {
      score += 8;
      reasons.push('🏞️ River-specific pattern match');
    }
    
    if (location.includes('lake') && (flyName.includes('midge') || flyName.includes('leech'))) {
      score += 8;
      reasons.push('🏞️ Lake-specific pattern match');
    }
    
    // Elevation-based bonuses
    if (conditions.latitude > 41 && flyName.includes('midge')) {
      score += 6;
      reasons.push('⛰️ High elevation midge bonus');
    }
    
    if (conditions.latitude < 40 && flyName.includes('hopper')) {
      score += 6;
      reasons.push('🌾 Low elevation terrestrial bonus');
    }
    
    return score;
  }

  /**
   * 🌡️ REAL-TIME DATA SCORING
   * Bonuses for flies that match real-time conditions
   */
  private scoreRealTimeData(fly: Fly, conditions: FishingConditions, reasons: string[]): number {
    let score = 0;
    
    // Real-time water temperature bonuses
    if (conditions.water_data?.waterTemperature) {
      const waterTemp = conditions.water_data.waterTemperature;
      const flyName = fly.name?.toLowerCase() || '';
      
      if (waterTemp < 45 && flyName.includes('midge')) {
        score += 12;
        reasons.push(`❄️ Real-time cold water (${waterTemp}°F) - midge perfect`);
      }
      
      if (waterTemp > 65 && flyName.includes('hopper')) {
        score += 10;
        reasons.push(`☀️ Real-time warm water (${waterTemp}°F) - terrestrial active`);
      }
    }
    
    // Real-time flow rate bonuses
    if (conditions.water_data?.flowRate) {
      const flowRate = conditions.water_data.flowRate;
      const flyType = fly.type?.toLowerCase() || '';
      
      if (flowRate > 200 && flyType === 'streamer') {
        score += 15;
        reasons.push(`🌊 Real-time high flow (${flowRate} cfs) - streamer time`);
      }
      
      if (flowRate < 50 && flyType === 'dry') {
        score += 10;
        reasons.push(`💧 Real-time low flow (${flowRate} cfs) - dry fly perfect`);
      }
    }
    
    // Real-time weather bonuses
    if (conditions.weather_data?.temperature) {
      const airTemp = conditions.weather_data.temperature;
      const flyName = fly.name?.toLowerCase() || '';
      
      if (airTemp > 80 && flyName.includes('ant')) {
        score += 8;
        reasons.push(`🌡️ Real-time hot weather (${airTemp}°F) - ant activity`);
      }
    }
    
    // Data quality bonus
    if (conditions.water_data?.dataQuality === 'GOOD') {
      score += 5;
      reasons.push('🎯 High-quality real-time data');
    }
    
    return score;
  }
}

export const hierarchicalFlySuggestionService = new HierarchicalFlySuggestionService();
