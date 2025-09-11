import { fliesService } from './supabase';
import { Fly, FlySuggestion } from './types';

export class FlySuggestionService {
  // Get fly suggestions based on fishing conditions
  async getSuggestions(conditions: {
    weather_conditions: string;
    water_clarity: string;
    water_level: string;
    time_of_day: string;
    water_temperature?: number;
  }): Promise<FlySuggestion[]> {
    try {
      console.log('Getting suggestions for conditions:', conditions);
      
      // Get all flies first (since we have sample data)
      const flies = await fliesService.getFlies();
      console.log('Retrieved flies:', flies.length);

      if (flies.length === 0) {
        console.log('No flies found in database');
        return [];
      }

      // Score and rank flies
      const suggestions = flies.map(fly => this.scoreFly(fly, conditions));
      console.log('Generated suggestions:', suggestions.length);
      
      // Sort by confidence (highest first) and return top 5
      const sortedSuggestions = suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
      
      console.log('Final suggestions:', sortedSuggestions);
      return sortedSuggestions;
    } catch (error) {
      console.error('Error getting fly suggestions:', error);
      return [];
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
    let score = 30; // Base score so all flies get some points
    let reasons: string[] = [];

    // Base score from success rate
    score += fly.success_rate * 30;

    // Usage-based ranking boost (popular flies get higher scores)
    if (fly.total_uses > 0) {
      // Logarithmic scaling so popular flies get boost but not overwhelming
      const usageBoost = Math.log10(fly.total_uses + 1) * 15;
      score += usageBoost;
      reasons.push(`Popular choice (${fly.total_uses} uses)`);
    }

    // Weather conditions match
    if (fly.best_conditions.weather.includes(conditions.weather_conditions)) {
      score += 25;
      reasons.push(`Good for ${conditions.weather_conditions} weather`);
    } else {
      score += 5; // Still give some points for having weather data
    }

    // Water clarity match
    if (fly.best_conditions.water_clarity.includes(conditions.water_clarity)) {
      score += 20;
      reasons.push(`Effective in ${conditions.water_clarity} water`);
    } else {
      score += 3; // Still give some points
    }

    // Water level match
    if (fly.best_conditions.water_level.includes(conditions.water_level)) {
      score += 20;
      reasons.push(`Works well with ${conditions.water_level} water levels`);
    } else {
      score += 3; // Still give some points
    }

    // Time of day match
    if (fly.best_conditions.time_of_day.includes(conditions.time_of_day)) {
      score += 15;
      reasons.push(`Best during ${conditions.time_of_day}`);
    } else {
      score += 2; // Still give some points
    }

    // Water temperature match
    if (conditions.water_temperature && fly.best_conditions.water_temperature_range) {
      const { min, max } = fly.best_conditions.water_temperature_range;
      if (conditions.water_temperature >= min && conditions.water_temperature <= max) {
        score += 20;
        reasons.push(`Optimal water temperature range`);
      } else {
        score += 5; // Still give some points
      }
    }

    // Add bonus for high success rate
    if (fly.success_rate > 0.7) {
      score += 15;
      reasons.push('High success rate');
    }

    // Add bonus for recent success
    if (fly.total_uses > 10) {
      score += 10;
      reasons.push('Well-tested fly');
    }

    // Ensure minimum confidence
    const confidence = Math.min(100, Math.max(20, score));

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
