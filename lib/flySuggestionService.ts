import { fliesService } from './supabase';
import { Fly, FlySuggestion } from './types';
import { UsageService } from './usageService';

export class FlySuggestionService {
  // Get fly suggestions based on fishing conditions
  async getSuggestions(
    conditions: {
      weather_conditions: string;
      water_clarity: string;
      water_level: string;
      time_of_day: string;
      water_temperature?: number;
    },
    userId?: string
  ): Promise<{ suggestions: FlySuggestion[]; usageInfo?: any; canPerform: boolean }> {
    try {
      console.log('Getting suggestions for conditions:', conditions);
      
      // Check usage limits if user is provided
      let usageInfo: any = null;
      let canPerform = true;
      
      if (userId) {
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
      
      // Increment usage if user is provided
      if (userId && canPerform) {
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
    weather_conditions: string;
    water_clarity: string;
    water_level: string;
    time_of_day: string;
    water_temperature?: number;
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

    // Weather conditions match - HIGHEST PRIORITY
    if (fly.best_conditions.weather.includes(conditions.weather_conditions)) {
      score += 80; // Very high score for weather match
      reasons.push(`Excellent for ${conditions.weather_conditions} weather`);
    } else {
      score -= 50; // Heavy penalty for weather mismatch
    }

    // Time of day/season match - HIGHEST PRIORITY
    if (fly.best_conditions.time_of_day.includes(conditions.time_of_day)) {
      score += 75; // Very high score for season match
      reasons.push(`Perfect for ${conditions.time_of_day} season`);
    } else {
      score -= 45; // Heavy penalty for season mismatch
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

