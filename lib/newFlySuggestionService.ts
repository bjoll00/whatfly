/**
 * NEW Fly Suggestion Service
 * 
 * This is a complete rebuild that properly uses ALL fly data attributes:
 * - ideal_conditions (with actual temperature/flow ranges)
 * - Normalized columns: insect_category, insect_order, insect_behavior, insect_size_min/max
 * - hatch_matching (extracted from imitated_insect)
 * - best_conditions (extracted from imitated_insect)
 * - suggestion_profile (with weights, required fields, boosts)
 * - sizes_available (array of available sizes)
 * 
 * The algorithm matches real-time conditions against these structures
 * to provide accurate, location-specific fly suggestions.
 * 
 * IMPORTANT: Uses normalized columns instead of imitated_insect JSONB for better performance.
 */

import { fliesService } from './supabase';
import { FishingConditions, Fly, FlySuggestion } from './types';

interface IdealConditions {
  airTemp?: { min: number; max: number };
  waterTemperature?: { min: number; max: number };
  streamFlow?: { min: number; max: number };
  weatherDescription?: string[];
}

interface SuggestionProfile {
  matchStrategy?: 'weighted' | 'strict' | 'flexible';
  environmentWeights?: {
    airTemp?: number;
    waterTemperature?: number;
    streamFlow?: number;
    weatherDescription?: number;
  };
  requiredFields?: string[];
  boosts?: Array<{
    tag: string;
    boost: number;
    field: string;
    value: number | string;
    operator: '>=' | '<=' | '==' | '!=';
  }>;
  notes?: string;
}

export class NewFlySuggestionService {
  /**
   * Get fly suggestions based on current fishing conditions
   */
  async getSuggestions(
    conditions: Partial<FishingConditions>,
    userId?: string
  ): Promise<{ suggestions: FlySuggestion[]; canPerform: boolean; error?: string }> {
    try {
      // Validate conditions
      if (!conditions.location || !conditions.latitude || !conditions.longitude) {
        return {
          suggestions: [],
          canPerform: false,
          error: 'Insufficient location data. Please select a location on the map first.'
        };
      }

      // Get all flies from database
      const flies = await fliesService.getFlies();
      
      if (!flies || flies.length === 0) {
        return {
          suggestions: [],
          canPerform: false,
          error: 'No flies found in database. Please populate the database first.'
        };
      }

      console.log(`🎣 NewFlySuggestionService: Analyzing ${flies.length} flies for conditions:`, {
        location: conditions.location,
        weather: conditions.weather_conditions,
        waterTemp: conditions.water_data?.waterTemperature,
        flowRate: conditions.water_data?.flowRate,
        timeOfDay: conditions.time_of_day,
        season: conditions.time_of_year,
      });

      // Log sample of normalized data usage
      const sampleFly = flies.find(f => f.insect_category && f.sizes_available?.length > 0);
      if (sampleFly) {
        console.log('📊 Using normalized columns:', {
          name: sampleFly.name,
          insect_category: sampleFly.insect_category,
          sizes_available: sampleFly.sizes_available,
          has_hatch_matching: !!sampleFly.hatch_matching,
          has_insect_order: !!sampleFly.insect_order,
        });
      }

      // Score each fly
      const scoredFlies = flies.map(fly => this.scoreFly(fly, conditions));

      // Sort by score (highest first)
      scoredFlies.sort((a, b) => b.score - a.score);

      // Get top 5 suggestions
      const topSuggestions = scoredFlies.slice(0, 5).map(s => ({
        fly: s.fly,
        confidence: this.normalizeConfidence(s.score),
        reason: s.reasons.join('. '),
        matching_factors: s.reasons.slice(0, 3),
      }));

      console.log(`✅ NewFlySuggestionService: Generated ${topSuggestions.length} suggestions`);
      if (topSuggestions.length > 0) {
        console.log('Top suggestion:', {
          name: topSuggestions[0].fly.name,
          confidence: topSuggestions[0].confidence,
          reason: topSuggestions[0].reason.substring(0, 100),
        });
      }

      return {
        suggestions: topSuggestions,
        canPerform: true,
      };

    } catch (error) {
      console.error('Error in NewFlySuggestionService:', error);
      return {
        suggestions: [],
        canPerform: false,
        error: error instanceof Error ? error.message : 'Failed to get fly suggestions'
      };
    }
  }

  /**
   * Score a fly based on how well it matches current conditions
   * 
   * Uses normalized columns for better performance:
   * - insect_category instead of type
   * - sizes_available instead of primary_size
   * - hatch_matching and best_conditions (extracted from imitated_insect)
   * - insect_order, insect_behavior, insect_size_min/max
   */
  private scoreFly(
    fly: Fly & { ideal_conditions?: IdealConditions; suggestion_profile?: SuggestionProfile },
    conditions: Partial<FishingConditions>
  ): { fly: Fly; score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // ========================================
    // 1. IDEAL CONDITIONS MATCHING (HIGHEST PRIORITY)
    // ========================================
    if (fly.ideal_conditions) {
      const ideal = fly.ideal_conditions;

      // Real-time water temperature matching
      if (ideal.waterTemperature && conditions.water_data?.waterTemperature !== undefined) {
        const waterTempF = conditions.water_data.waterTemperature; // Already in Fahrenheit
        let { min, max } = ideal.waterTemperature;
        
        // Check if ideal conditions are in Celsius (if values are < 30, likely Celsius)
        if (max < 30) {
          // Convert from Celsius to Fahrenheit
          min = (min * 9/5) + 32;
          max = (max * 9/5) + 32;
        }
        
        if (waterTempF >= min && waterTempF <= max) {
          const matchQuality = this.calculateRangeMatchQuality(waterTempF, min, max);
          const baseScore = 80; // High base score for ideal temp match
          score += baseScore * matchQuality;
          reasons.push(`Perfect water temperature (${waterTempF.toFixed(1)}°F) - ideal range ${min.toFixed(1)}-${max.toFixed(1)}°F`);
        } else {
          // Penalty for being outside ideal range
          const distance = waterTempF < min ? min - waterTempF : waterTempF - max;
          score -= Math.min(30, distance * 2); // Max 30 point penalty
          reasons.push(`Water temp (${waterTempF.toFixed(1)}°F) outside ideal range (${min.toFixed(1)}-${max.toFixed(1)}°F)`);
        }
      }

      // Real-time stream flow matching
      if (ideal.streamFlow && conditions.water_data?.flowRate !== undefined) {
        const flowRate = conditions.water_data.flowRate;
        const { min, max } = ideal.streamFlow;
        
        if (flowRate >= min && flowRate <= max) {
          const matchQuality = this.calculateRangeMatchQuality(flowRate, min, max);
          const baseScore = 70; // High base score for ideal flow match
          score += baseScore * matchQuality;
          reasons.push(`Perfect flow rate (${flowRate} cfs) - ideal range ${min}-${max} cfs`);
        } else {
          // Penalty for being outside ideal range
          const distance = flowRate < min ? min - flowRate : flowRate - max;
          score -= Math.min(25, distance * 0.5); // Max 25 point penalty
          reasons.push(`Flow rate (${flowRate} cfs) outside ideal range (${min}-${max} cfs)`);
        }
      }

      // Air temperature matching
      if (ideal.airTemp && conditions.weather_data?.temperature !== undefined) {
        const airTempF = conditions.weather_data.temperature; // Already in Fahrenheit
        let { min, max } = ideal.airTemp;
        
        // Check if ideal conditions are in Celsius (if values are < 30, likely Celsius)
        if (max < 30) {
          // Convert from Celsius to Fahrenheit
          min = (min * 9/5) + 32;
          max = (max * 9/5) + 32;
        }
        
        if (airTempF >= min && airTempF <= max) {
          const matchQuality = this.calculateRangeMatchQuality(airTempF, min, max);
          score += 50 * matchQuality;
          reasons.push(`Good air temperature (${airTempF.toFixed(1)}°F) - ideal range ${min.toFixed(1)}-${max.toFixed(1)}°F`);
        }
      }

      // Weather description matching
      if (ideal.weatherDescription && conditions.weather_data?.weather_description) {
        const currentWeather = conditions.weather_data.weather_description.toLowerCase();
        const matches = ideal.weatherDescription.some(w => 
          currentWeather.includes(w.toLowerCase())
        );
        
        if (matches) {
          score += 40;
          reasons.push(`Weather matches ideal conditions`);
        }
      }
    }

    // ========================================
    // 2. SUGGESTION PROFILE BOOSTS
    // ========================================
    if (fly.suggestion_profile) {
      const profile = fly.suggestion_profile;

      // Apply boosts if conditions match
      if (profile.boosts) {
        for (const boost of profile.boosts) {
          if (this.evaluateBoost(boost, conditions)) {
            score += boost.boost * 10; // Convert boost multiplier to points
            reasons.push(`Boost: ${boost.tag}`);
          }
        }
      }

      // Check required fields
      if (profile.requiredFields) {
        let hasAllRequired = true;
        for (const field of profile.requiredFields) {
          if (!this.hasRequiredField(field, conditions)) {
            hasAllRequired = false;
            break;
          }
        }
        
        if (!hasAllRequired) {
          score -= 20; // Penalty for missing required fields
        } else {
          score += 15; // Bonus for having all required fields
        }
      }
    }

    // ========================================
    // 3. HATCH MATCHING (from normalized data)
    // ========================================
    // Use hatch_matching data that was extracted from imitated_insect
    if (fly.hatch_matching) {
      const hatch = fly.hatch_matching;

      // Insect order/category matching (using normalized columns)
      if (fly.insect_order && fly.insect_category) {
        // Bonus for having detailed insect information
        score += 5;
      }

      // Life stages matching
      if (hatch.stages && hatch.stages.length > 0) {
        // This indicates the fly matches specific insect life stages
        score += 10;
        reasons.push(`Matches ${hatch.stages.join(', ')} life stages`);
      }

      // Insect types matching
      if (hatch.insects && hatch.insects.length > 0) {
        score += 10;
        reasons.push(`Imitates ${hatch.insects.join(', ')}`);
      }
    }

    // Use insect_category for more accurate type matching
    // This is more accurate than the generic 'type' column
    if (fly.insect_category) {
      const category = fly.insect_category.toLowerCase();
      
      // Category-based bonuses based on conditions
      if (conditions.water_data?.waterTemperature !== undefined) {
        const waterTemp = conditions.water_data.waterTemperature;
        
        // Nymphs are best in cold water
        if (category.includes('nymph') && waterTemp < 50) {
          score += 15;
          reasons.push('Cold water - nymphs are most effective');
        }
        
        // Dry flies are best in warm water
        if (category.includes('dry') && waterTemp > 60) {
          score += 15;
          reasons.push('Warm water - surface activity likely');
        }
      }
    }

    // Use insect_size_min/max for size range matching
    if (fly.insect_size_min !== undefined && fly.insect_size_max !== undefined) {
      // This provides more accurate size information than just primary_size
      if (fly.sizes_available && fly.sizes_available.length > 0) {
        // Verify sizes_available aligns with size range
        const sizes = fly.sizes_available.map(s => parseInt(s, 10)).filter(n => !isNaN(n));
        const minSize = Math.min(...sizes);
        const maxSize = Math.max(...sizes);
        
        // Bonus if size range matches available sizes
        if (minSize >= fly.insect_size_min && maxSize <= fly.insect_size_max) {
          score += 3;
        }
      }
    }

    // Use insect_behavior for additional context
    if (fly.insect_behavior) {
      // Behavior can indicate fishing technique
      const behavior = fly.insect_behavior.toLowerCase();
      if (behavior.includes('drift') && conditions.water_flow === 'moderate') {
        score += 5;
        reasons.push('Behavior matches water conditions');
      }
    }

    // ========================================
    // 4. LEGACY BEST_CONDITIONS SUPPORT
    // ========================================
    if (fly.best_conditions) {
      const best = fly.best_conditions;

      // Weather matching
      if (best.weather && conditions.weather_conditions) {
        if (best.weather.includes(conditions.weather_conditions)) {
          score += 30;
        }
      }

      // Time of day matching
      if (best.time_of_day && conditions.time_of_day) {
        if (best.time_of_day.includes(conditions.time_of_day)) {
          score += 25;
        }
      }

      // Season matching
      if (best.time_of_year && conditions.time_of_year) {
        if (best.time_of_year.includes(conditions.time_of_year)) {
          score += 25;
        }
      }

      // Water temperature range matching (legacy)
      if (best.water_temperature_range && conditions.water_data?.waterTemperature !== undefined) {
        const { min, max } = best.water_temperature_range;
        const temp = conditions.water_data.waterTemperature;
        
        if (temp >= min && temp <= max) {
          score += 40;
        }
      }
    }

    // ========================================
    // 5. FLY CATEGORY BONUSES (using insect_category)
    // ========================================
    // Use insect_category instead of type for more accurate matching
    // Fallback to type if insect_category is not available
    const flyCategory = (fly.insect_category || fly.type || '').toLowerCase();
    
    // Real-time flow rate category matching
    if (conditions.water_data?.flowRate !== undefined) {
      const flowRate = conditions.water_data.flowRate;
      
      if (flowRate < 50 && (flyCategory.includes('dry') || flyCategory.includes('terrestrial'))) {
        score += 20;
        reasons.push('Low flow - perfect for dry flies');
      } else if (flowRate > 200 && flyCategory.includes('streamer')) {
        score += 25;
        reasons.push('High flow - perfect for streamers');
      } else if (flowRate >= 75 && flowRate <= 150 && flyCategory.includes('nymph')) {
        score += 20;
        reasons.push('Medium flow - excellent for nymphing');
      }
    }

    // Size matching using sizes_available
    // Check if the fly has appropriate sizes for the conditions
    if (fly.sizes_available && fly.sizes_available.length > 0) {
      // Convert sizes to numbers for comparison
      const sizes = fly.sizes_available.map(s => parseInt(s, 10)).filter(n => !isNaN(n));
      
      if (sizes.length > 0) {
        // Use the middle size as the recommended size (more accurate than always using "16")
        const recommendedSize = sizes[Math.floor(sizes.length / 2)];
        
        // Bonus for having multiple size options (versatility)
        if (sizes.length >= 3) {
          score += 5;
          reasons.push(`Available in ${sizes.length} sizes (${sizes.join(', ')})`);
        }
        
        // Size-based matching (smaller flies for clearer water, larger for murky)
        if (conditions.water_clarity) {
          const clarity = conditions.water_clarity.toLowerCase();
          if (clarity === 'clear' && recommendedSize <= 18) {
            score += 5;
            reasons.push('Small size ideal for clear water');
          } else if (clarity.includes('murky') && recommendedSize >= 14) {
            score += 5;
            reasons.push('Larger size visible in murky water');
          }
        }
      }
    }

    // ========================================
    // 6. SUCCESS RATE BONUS (SMALL)
    // ========================================
    if (fly.success_rate > 0 && fly.total_uses > 10) {
      // Only use success rate if fly has been used enough times
      score += fly.success_rate * 10; // Max 10 points
    }

    // Ensure minimum score
    score = Math.max(0, score);

    return { fly, score, reasons };
  }

  /**
   * Calculate how well a value matches within a range (0-1)
   * Values in the middle of the range score higher
   */
  private calculateRangeMatchQuality(value: number, min: number, max: number): number {
    const range = max - min;
    if (range === 0) return 1; // Exact match
    
    const midpoint = (min + max) / 2;
    const distanceFromMidpoint = Math.abs(value - midpoint);
    const maxDistance = range / 2;
    
    // Score higher for values closer to midpoint
    return Math.max(0.5, 1 - (distanceFromMidpoint / maxDistance));
  }

  /**
   * Evaluate if a boost condition is met
   */
  private evaluateBoost(
    boost: { field: string; value: number | string; operator: string },
    conditions: Partial<FishingConditions>
  ): boolean {
    let fieldValue: number | string | undefined;

    // Get field value from conditions
    switch (boost.field) {
      case 'streamFlow':
      case 'flowRate':
        fieldValue = conditions.water_data?.flowRate;
        break;
      case 'waterTemperature':
        fieldValue = conditions.water_data?.waterTemperature;
        break;
      case 'airTemp':
        fieldValue = conditions.weather_data?.temperature;
        break;
      default:
        return false;
    }

    if (fieldValue === undefined) return false;

    // Evaluate operator
    switch (boost.operator) {
      case '>=':
        return typeof fieldValue === 'number' && typeof boost.value === 'number' && fieldValue >= boost.value;
      case '<=':
        return typeof fieldValue === 'number' && typeof boost.value === 'number' && fieldValue <= boost.value;
      case '==':
        return fieldValue === boost.value;
      case '!=':
        return fieldValue !== boost.value;
      default:
        return false;
    }
  }

  /**
   * Check if required field is present
   */
  private hasRequiredField(field: string, conditions: Partial<FishingConditions>): boolean {
    switch (field) {
      case 'waterTemperature':
        return conditions.water_data?.waterTemperature !== undefined;
      case 'streamFlow':
      case 'flowRate':
        return conditions.water_data?.flowRate !== undefined;
      case 'airTemp':
        return conditions.weather_data?.temperature !== undefined;
      default:
        return false;
    }
  }

  /**
   * Normalize score to confidence (0-1)
   */
  private normalizeConfidence(score: number): number {
    // Use a sigmoid-like function to normalize
    // Scores above 100 are excellent, scores below 20 are poor
    const normalized = Math.min(1, Math.max(0, (score - 20) / 100));
    return Math.round(normalized * 100) / 100; // Round to 2 decimal places
  }
}

// Export singleton instance
export const newFlySuggestionService = new NewFlySuggestionService();

