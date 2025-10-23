// Auto-detection service for one-click fly suggestions
import { LunarService } from './lunarService';
import { FishingConditions, WeatherData } from './types';
import { weatherService } from './weatherService';

export class AutoDetectionService {
  // Get current date and time information
  private getCurrentDateTime() {
    const now = new Date();
    
    // Get current hour (0-23)
    const hour = now.getHours();
    
    // Determine time of day
    const getTimeOfDay = (hour: number): FishingConditions['time_of_day'] => {
      if (hour >= 5 && hour < 8) return 'dawn';
      if (hour >= 8 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 17) return 'midday';
      if (hour >= 17 && hour < 20) return 'afternoon';
      if (hour >= 20 && hour < 22) return 'dusk';
      return 'night';
    };
    
    // Determine time of year (season)
    const getTimeOfYear = (date: Date): FishingConditions['time_of_year'] => {
      const month = date.getMonth() + 1; // getMonth() returns 0-11
      const day = date.getDate();
      
      // Define season ranges based on typical fishing patterns
      if (month === 12 || month === 1 || month === 2) return 'winter';
      if (month === 3) return 'early_spring';
      if (month === 4) return 'spring';
      if (month === 5) return 'late_spring';
      if (month === 6) return 'early_summer';
      if (month === 7) return 'summer';
      if (month === 8) return 'late_summer';
      if (month === 9) return 'early_fall';
      if (month === 10) return 'fall';
      if (month === 11) return 'late_fall';
      
      return 'summer'; // fallback
    };
    
    return {
      date: now.toISOString().split('T')[0], // YYYY-MM-DD format
      time_of_day: getTimeOfDay(hour),
      time_of_year: getTimeOfYear(now),
      hour: hour,
    };
  }
  
  // Auto-detect water conditions based on weather and season
  private getEstimatedWaterConditions(
    weatherData: WeatherData | null, 
    timeOfYear: FishingConditions['time_of_year'],
    timeOfDay: FishingConditions['time_of_day']
  ) {
    // Default water conditions
    let waterConditions: Partial<FishingConditions> = {
      water_clarity: 'clear',
      water_level: 'normal',
      water_flow: 'moderate',
      water_depth: 6, // Average depth assumption
    };
    
    if (!weatherData) {
      // Fallback conditions when weather data isn't available
      return waterConditions;
    }
    
    // Estimate water temperature based on air temperature and season
    let estimatedWaterTemp: number;
    if (timeOfYear === 'winter' || timeOfYear === 'early_spring') {
      // In cold seasons, water is typically 5-10°F cooler than air
      estimatedWaterTemp = Math.max(32, weatherData.temperature - 8);
    } else if (timeOfYear === 'summer' || timeOfYear === 'late_summer') {
      // In warm seasons, water is typically 5-15°F cooler than air
      estimatedWaterTemp = Math.max(50, weatherData.temperature - 12);
    } else {
      // In moderate seasons, water is typically 5-10°F cooler than air
      estimatedWaterTemp = Math.max(40, weatherData.temperature - 8);
    }
    
    // Estimate water clarity based on weather conditions
    if (weatherData.weather_condition.includes('rain') || weatherData.weather_condition.includes('storm')) {
      waterConditions.water_clarity = 'murky';
      waterConditions.water_level = 'high';
      waterConditions.water_flow = 'fast';
    } else if (weatherData.weather_condition.includes('sunny') && timeOfDay === 'morning') {
      waterConditions.water_clarity = 'clear';
      waterConditions.water_flow = 'moderate';
    } else if (weatherData.weather_condition.includes('cloudy') || weatherData.weather_condition.includes('overcast')) {
      waterConditions.water_clarity = 'slightly_murky';
      waterConditions.water_flow = 'moderate';
    }
    
    // Adjust based on wind conditions
    if (weatherData.wind_speed > 10) {
      waterConditions.water_clarity = 'slightly_murky';
      waterConditions.water_flow = 'fast';
    } else if (weatherData.wind_speed < 2) {
      waterConditions.water_flow = 'slow';
    }
    
    // Adjust based on season
    if (timeOfYear === 'winter' || timeOfYear === 'early_spring') {
      waterConditions.water_level = 'low'; // Winter typically means lower water levels
      waterConditions.water_flow = 'slow';
    } else if (timeOfYear === 'spring' || timeOfYear === 'late_spring') {
      waterConditions.water_level = 'high'; // Spring runoff
      waterConditions.water_flow = 'fast';
      waterConditions.water_clarity = 'slightly_murky'; // Spring runoff makes water murky
    }
    
    return {
      ...waterConditions,
      water_temperature: estimatedWaterTemp,
    };
  }
  
  // Main method to auto-detect all conditions for one-click suggestion
  async getAutoDetectedConditions(
    latitude?: number, 
    longitude?: number,
    locationName?: string
  ): Promise<{
    conditions: Partial<FishingConditions>;
    weatherData: WeatherData | null;
    autoDetectedInfo: {
      timeDetected: string;
      locationDetected: string;
      weatherDetected: boolean;
      waterEstimated: boolean;
    };
  }> {
    // Get current date/time information
    const dateTimeInfo = this.getCurrentDateTime();
    
    // Get weather data if location is provided
    let weatherData: WeatherData | null = null;
    if (latitude && longitude) {
      try {
        weatherData = await weatherService.getWeatherForLocation(latitude, longitude);
      } catch (error) {
        console.error('Error getting weather data for auto-detection:', error);
      }
    }
    
    // Auto-detect water conditions
    const waterConditions = this.getEstimatedWaterConditions(
      weatherData, 
      dateTimeInfo.time_of_year,
      dateTimeInfo.time_of_day
    );
    
    // Get lunar data
    const lunarData = LunarService.getMoonPhase(new Date());
    const solunarData = LunarService.getSolunarPeriods(new Date(), latitude || 40.7608, longitude || -111.8910);
    
    // Build complete conditions object
    const conditions: Partial<FishingConditions> = {
      // Location
      location: locationName || 'Current Location',
      latitude: latitude,
      longitude: longitude,
      
      // Time information
      date: dateTimeInfo.date,
      time_of_day: dateTimeInfo.time_of_day,
      time_of_year: dateTimeInfo.time_of_year,
      
      // Water conditions (auto-estimated)
      ...waterConditions,
      
      // Weather conditions (from API or estimated)
      weather_conditions: weatherData ? 
        weatherService.convertToFishingConditions(weatherData).weather_conditions : 
        'sunny',
      wind_speed: weatherData ? 
        weatherService.convertToFishingConditions(weatherData).wind_speed : 
        'light',
      wind_direction: weatherData ? 
        weatherService.convertToFishingConditions(weatherData).wind_direction : 
        'variable',
      air_temperature_range: weatherData ? 
        weatherService.convertToFishingConditions(weatherData).air_temperature_range : 
        'moderate',
      
      // Lunar conditions
      moon_phase: lunarData.phase,
      moon_illumination: lunarData.illumination,
      lunar_feeding_activity: lunarData.feedingActivity,
      solunar_periods: {
        major_periods: solunarData.major.map(period => ({
          start: period.start.toISOString(),
          end: period.end.toISOString(),
          duration: period.end.getTime() - period.start.getTime(),
          peak: new Date((period.start.getTime() + period.end.getTime()) / 2).toISOString()
        })),
        minor_periods: solunarData.minor.map(period => ({
          start: period.start.toISOString(),
          end: period.end.toISOString(),
          duration: period.end.getTime() - period.start.getTime(),
          peak: new Date((period.start.getTime() + period.end.getTime()) / 2).toISOString()
        })),
        sunrise: new Date().toISOString(), // Placeholder - would need actual sunrise calculation
        sunset: new Date().toISOString(), // Placeholder - would need actual sunset calculation
        moonrise: new Date().toISOString(), // Placeholder - would need actual moonrise calculation
        moonset: new Date().toISOString() // Placeholder - would need actual moonset calculation
      },
    };
    
    return {
      conditions,
      weatherData,
      autoDetectedInfo: {
        timeDetected: `${dateTimeInfo.time_of_day} on ${dateTimeInfo.time_of_year} ${dateTimeInfo.date}`,
        locationDetected: locationName || (latitude && longitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Not specified'),
        weatherDetected: !!weatherData,
        waterEstimated: true,
      },
    };
  }
  
  // Get smart suggestions for current conditions
  getSmartSuggestions(conditions: Partial<FishingConditions>): string[] {
    const suggestions: string[] = [];
    
    // Time-based suggestions
    if (conditions.time_of_day === 'dawn' || conditions.time_of_day === 'dusk') {
      suggestions.push('🌅 Prime fishing time - fish are most active');
    } else if (conditions.time_of_day === 'midday') {
      suggestions.push('☀️ Midday fishing - try deeper waters and smaller flies');
    } else if (conditions.time_of_day === 'night') {
      suggestions.push('🌙 Night fishing - use dark flies and fish near structure');
    }
    
    // Season-based suggestions
    if (conditions.time_of_year === 'winter') {
      suggestions.push('❄️ Winter fishing - slow presentations, deep pools');
    } else if (conditions.time_of_year === 'spring') {
      suggestions.push('🌸 Spring fishing - high water, use weighted flies');
    } else if (conditions.time_of_year === 'summer') {
      suggestions.push('☀️ Summer fishing - early morning and evening best');
    } else if (conditions.time_of_year === 'fall') {
      suggestions.push('🍂 Fall fishing - aggressive fish, try streamers');
    }
    
    // Water condition suggestions
    if (conditions.water_clarity === 'clear') {
      suggestions.push('💧 Clear water - use natural colors, smaller flies');
    } else if (conditions.water_clarity === 'murky') {
      suggestions.push('🌫️ Murky water - use bright colors, larger flies');
    }
    
    if (conditions.water_flow === 'fast') {
      suggestions.push('💨 Fast water - use weighted flies, fish eddies');
    } else if (conditions.water_flow === 'slow') {
      suggestions.push('🫧 Slow water - delicate presentations work best');
    }
    
    // Weather-based suggestions
    if (conditions.weather_conditions === 'overcast') {
      suggestions.push('☁️ Overcast skies - excellent fishing conditions');
    } else if (conditions.weather_conditions === 'rainy') {
      suggestions.push('🌧️ Rain can improve fishing - fish are more active');
    }
    
    return suggestions;
  }
}

export const autoDetectionService = new AutoDetectionService();







