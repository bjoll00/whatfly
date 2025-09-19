import { flySuggestionService } from './flySuggestionService';
import { RiverLocation, USGSWaterData, WeatherData } from './locationService';
import { FishingConditions } from './types';

/**
 * Integration service that connects the map location data
 * with the existing fly suggestion service
 */
export class MapIntegrationService {
  
  /**
   * Convert map data to fishing conditions and get fly suggestions
   */
  static async getFlySuggestionsFromMapData(params: {
    river: RiverLocation;
    weather: WeatherData;
    waterData: USGSWaterData | null;
    userPreferences?: {
      timeOfDay?: string;
      waterClarity?: string;
      waterLevel?: string;
    };
  }) {
    try {
      // Convert weather condition to app format
      const weatherCondition = this.convertWeatherCondition(params.weather.condition);
      
      // Convert water data to app format
      const waterClarity = this.getWaterClarityFromFlow(params.waterData?.flowRate);
      const waterLevel = this.getWaterLevelFromFlow(params.waterData?.flowRate);
      
      // Create fishing conditions object
      const conditions: FishingConditions = {
        date: new Date().toISOString(),
        location: params.river.name,
        weather_conditions: weatherCondition,
        water_conditions: this.getWaterConditionsFromFlow(params.waterData?.flowRate),
        water_temperature_range: this.getTemperatureRange(params.waterData?.waterTemperature),
        water_temperature: params.waterData?.waterTemperature,
        air_temperature_range: this.getTemperatureRange(params.weather.temperature),
        wind_speed: this.convertWindSpeed(params.weather.windSpeed),
        wind_direction: this.convertWindDirection(params.weather.windDirection),
        water_clarity: waterClarity,
        water_level: waterLevel,
        time_of_day: params.userPreferences?.timeOfDay || this.getTimeOfDay(),
        time_of_year: this.getCurrentSeason(),
      };

      console.log('Converted map data to fishing conditions:', conditions);

      // Use the existing fly suggestion service
      const suggestions = await flySuggestionService.getSuggestions(conditions);
      
      return {
        success: true,
        suggestions,
        conditions,
        source: 'map_integration'
      };

    } catch (error) {
      console.error('Error getting fly suggestions from map data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: [],
        conditions: null,
        source: 'map_integration'
      };
    }
  }

  /**
   * Convert weather condition from API format to app format
   */
  private static convertWeatherCondition(condition: string): FishingConditions['weather_conditions'] {
    const conditionMap: Record<string, FishingConditions['weather_conditions']> = {
      'sunny': 'sunny',
      'clear': 'sunny',
      'cloudy': 'cloudy',
      'partly-cloudy': 'cloudy',
      'overcast': 'overcast',
      'rainy': 'rainy',
      'rain': 'rainy',
      'stormy': 'stormy',
      'thunderstorm': 'stormy',
      'foggy': 'foggy',
      'fog': 'foggy',
    };
    
    return conditionMap[condition.toLowerCase()] || 'sunny';
  }

  /**
   * Convert wind speed to app format
   */
  private static convertWindSpeed(windSpeed: number): FishingConditions['wind_speed'] {
    if (windSpeed < 5) return 'none';
    if (windSpeed < 15) return 'light';
    if (windSpeed < 25) return 'moderate';
    if (windSpeed < 35) return 'strong';
    return 'very_strong';
  }

  /**
   * Convert wind direction to app format
   */
  private static convertWindDirection(direction: string): FishingConditions['wind_direction'] {
    const directionMap: Record<string, FishingConditions['wind_direction']> = {
      'north': 'north',
      'northeast': 'northeast',
      'east': 'east',
      'southeast': 'southeast',
      'south': 'south',
      'southwest': 'southwest',
      'west': 'west',
      'northwest': 'northwest',
    };
    
    return directionMap[direction.toLowerCase()] || 'variable';
  }

  /**
   * Get water conditions from flow rate
   */
  private static getWaterConditionsFromFlow(flowRate?: number): FishingConditions['water_conditions'] {
    if (!flowRate) return 'calm';
    if (flowRate < 50) return 'calm';
    if (flowRate < 100) return 'rippled';
    if (flowRate < 200) return 'choppy';
    if (flowRate < 400) return 'fast_moving';
    return 'turbulent';
  }

  /**
   * Get water clarity from flow rate
   */
  private static getWaterClarityFromFlow(flowRate?: number): FishingConditions['water_clarity'] {
    if (!flowRate) return 'clear';
    if (flowRate < 50) return 'clear';
    if (flowRate < 100) return 'slightly_murky';
    if (flowRate < 200) return 'murky';
    return 'very_murky';
  }

  /**
   * Get water level from flow rate
   */
  private static getWaterLevelFromFlow(flowRate?: number): FishingConditions['water_level'] {
    if (!flowRate) return 'normal';
    if (flowRate < 50) return 'low';
    if (flowRate < 150) return 'normal';
    if (flowRate < 300) return 'high';
    return 'flooding';
  }

  /**
   * Convert temperature to temperature range
   */
  private static getTemperatureRange(temperature?: number): FishingConditions['water_temperature_range'] | FishingConditions['air_temperature_range'] {
    if (!temperature) return 'moderate';
    if (temperature < 32) return 'very_cold';
    if (temperature < 45) return 'cold';
    if (temperature < 60) return 'cool';
    if (temperature < 75) return 'moderate';
    if (temperature < 85) return 'warm';
    return 'hot';
  }

  /**
   * Get current time of day
   */
  private static getTimeOfDay(): FishingConditions['time_of_day'] {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 14) return 'midday';
    if (hour >= 14 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 20) return 'dusk';
    return 'night';
  }

  /**
   * Get current season
   */
  private static getCurrentSeason(): FishingConditions['time_of_year'] {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }
}
