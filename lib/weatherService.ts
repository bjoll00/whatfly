// Weather service for getting weather conditions at specific locations
// Now uses secure backend API instead of calling external APIs directly
import { API_ENDPOINTS, apiRequest } from './apiConfig';

interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  weather_condition: string;
  weather_description: string;
  cloudiness: number;
  visibility: number;
  uv_index?: number;
  sunrise?: string;
  sunset?: string;
}

interface WeatherConditions {
  weather_conditions: 'sunny' | 'cloudy' | 'overcast' | 'rainy' | 'stormy' | 'foggy';
  wind_speed: 'none' | 'light' | 'moderate' | 'strong' | 'very_strong';
  wind_direction: 'north' | 'northeast' | 'east' | 'southeast' | 'south' | 'southwest' | 'west' | 'northwest' | 'variable';
  air_temperature_range: 'very_cold' | 'cold' | 'cool' | 'moderate' | 'warm' | 'hot';
  humidity_level: 'low' | 'moderate' | 'high';
  pressure_level: 'low' | 'normal' | 'high';
}

export class WeatherService {
  /**
   * Get current weather for a location
   * Calls secure backend API instead of external API directly
   */

  async getWeatherForLocation(latitude: number, longitude: number): Promise<WeatherData | null> {
    try {
      console.log(`🌤️ Fetching weather via backend API for: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      
      // Call our secure backend API
      const data = await apiRequest<{
        temperature: number;
        feels_like: number;
        humidity: number;
        pressure: number;
        wind_speed: number;
        wind_direction: number;
        weather_condition: string;
        weather_description: string;
        cloudiness: number;
        visibility: string | null;
        uv_index?: number;
        sunrise?: string;
        sunset?: string;
      }>(API_ENDPOINTS.weather.current(latitude, longitude));

      // Convert backend response to WeatherData format
      const weatherData: WeatherData = {
        temperature: data.temperature,
        feels_like: data.feels_like,
        humidity: data.humidity,
        pressure: data.pressure,
        wind_speed: data.wind_speed,
        wind_direction: data.wind_direction,
        weather_condition: data.weather_condition,
        weather_description: data.weather_description,
        cloudiness: data.cloudiness,
        visibility: data.visibility ? parseFloat(data.visibility) : 0,
        uv_index: data.uv_index,
        sunrise: data.sunrise,
        sunset: data.sunset,
      };

      console.log(`✅ Weather fetched: ${weatherData.temperature}°F, ${weatherData.weather_condition}`);
      return weatherData;
    } catch (error) {
      console.error('❌ Error fetching weather data:', error);
      return null;
    }
  }

  async getWeatherForecast(latitude: number, longitude: number, days: number = 5): Promise<WeatherData[]> {
    try {
      console.log(`🌤️ Fetching ${days}-day forecast via backend API`);
      
      // Call our secure backend API
      const response = await apiRequest<{
        forecast: Array<{
          temperature: number;
          feels_like: number;
          humidity: number;
          pressure: number;
          wind_speed: number;
          wind_direction: number;
          weather_condition: string;
          weather_description: string;
          cloudiness: number;
          datetime: string;
          precipitation: number;
        }>;
      }>(API_ENDPOINTS.weather.forecast(latitude, longitude, days));

      // Convert backend response to WeatherData array
      return response.forecast.map((item) => ({
        temperature: item.temperature,
        feels_like: item.feels_like,
        humidity: item.humidity,
        pressure: item.pressure,
        wind_speed: item.wind_speed,
        wind_direction: item.wind_direction,
        weather_condition: item.weather_condition,
        weather_description: item.weather_description,
        cloudiness: item.cloudiness,
        visibility: 0, // Forecast doesn't include visibility
      }));
      
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return [];
    }
  }

  /**
   * Get comprehensive weather data including detailed information
   */
  async getComprehensiveWeatherData(latitude: number, longitude: number): Promise<{
    current: WeatherData;
    forecast: WeatherData[];
    detailed: {
      humidity?: number;
      pressure?: number;
      visibility?: number;
      uv_index?: number;
      cloud_cover?: number;
      precipitation?: {
        current: number;
        probability: number;
        type: 'none' | 'rain' | 'snow' | 'sleet' | 'hail';
      };
    };
  }> {
    try {
      // Fetch current weather and forecast using backend API
      const [currentData, forecastData] = await Promise.all([
        this.getWeatherForLocation(latitude, longitude),
        this.getWeatherForecast(latitude, longitude, 5)
      ]);

      if (!currentData) {
        throw new Error('Failed to fetch current weather');
      }

      // Extract detailed information from current weather
      const detailed = {
        humidity: currentData.humidity,
        pressure: currentData.pressure,
        visibility: currentData.visibility ? currentData.visibility / 1.60934 : undefined,
        uv_index: currentData.uv_index,
        cloud_cover: currentData.cloudiness,
        precipitation: {
          current: 0, // Not available from current endpoint
          probability: 0,
          type: this.getPrecipitationType(currentData.weather_condition, currentData.weather_description) as 'none' | 'rain' | 'snow' | 'sleet' | 'hail'
        }
      };

      return {
        current: currentData,
        forecast: forecastData,
        detailed
      };

    } catch (error) {
      console.error('Error fetching comprehensive weather data:', error);
      throw error;
    }
  }

  private getPrecipitationType(main?: string, description?: string): 'none' | 'rain' | 'snow' | 'sleet' | 'hail' {
    if (!main || !description) return 'none';
    
    const desc = description.toLowerCase();
    if (desc.includes('snow')) return 'snow';
    if (desc.includes('sleet')) return 'sleet';
    if (desc.includes('hail')) return 'hail';
    if (desc.includes('rain') || main === 'Rain') return 'rain';
    return 'none';
  }

  private parseWeatherData(data: any): WeatherData {
    return {
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: data.wind?.speed || 0,
      wind_direction: data.wind?.deg || 0,
      weather_condition: data.weather[0]?.main?.toLowerCase() || 'sunny',
      weather_description: data.weather[0]?.description || '',
      cloudiness: data.clouds?.all || 0,
      visibility: data.visibility ? data.visibility / 1000 : 10, // Convert to km
      uv_index: data.uvi,
      sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toISOString() : undefined,
      sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000).toISOString() : undefined,
    };
  }

  private parseForecastData(data: any): WeatherData[] {
    if (!data.list || !Array.isArray(data.list)) {
      return [];
    }
    
    return data.list.map((item: any) => this.parseWeatherData(item));
  }

  // Convert weather data to fishing-friendly conditions
  convertToFishingConditions(weatherData: WeatherData): WeatherConditions {
    return {
      weather_conditions: this.mapWeatherCondition(weatherData.weather_condition, weatherData.cloudiness || 0),
      wind_speed: this.mapWindSpeed(weatherData.wind_speed),
      wind_direction: this.mapWindDirection(weatherData.wind_direction),
      air_temperature_range: this.mapTemperatureRange(weatherData.temperature),
      humidity_level: this.mapHumidityLevel(weatherData.humidity),
      pressure_level: this.mapPressureLevel(weatherData.pressure),
    };
  }

  private mapWeatherCondition(condition: string | undefined, cloudiness: number): WeatherConditions['weather_conditions'] {
    if (!condition) {
      return 'sunny'; // Default to sunny if no condition provided
    }
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('thunderstorm') || conditionLower.includes('storm')) {
      return 'stormy';
    }
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return 'rainy';
    }
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
      return 'foggy';
    }
    if (cloudiness > 75) {
      return 'overcast';
    }
    if (cloudiness > 25) {
      return 'cloudy';
    }
    return 'sunny';
  }

  private mapWindSpeed(speed: number): WeatherConditions['wind_speed'] {
    if (speed < 3) return 'none';
    if (speed < 7) return 'light';
    if (speed < 12) return 'moderate';
    if (speed < 18) return 'strong';
    return 'very_strong';
  }

  private mapWindDirection(degrees: number): WeatherConditions['wind_direction'] {
    if (degrees >= 337.5 || degrees < 22.5) return 'north';
    if (degrees >= 22.5 && degrees < 67.5) return 'northeast';
    if (degrees >= 67.5 && degrees < 112.5) return 'east';
    if (degrees >= 112.5 && degrees < 157.5) return 'southeast';
    if (degrees >= 157.5 && degrees < 202.5) return 'south';
    if (degrees >= 202.5 && degrees < 247.5) return 'southwest';
    if (degrees >= 247.5 && degrees < 292.5) return 'west';
    if (degrees >= 292.5 && degrees < 337.5) return 'northwest';
    return 'variable';
  }

  private mapTemperatureRange(temperature: number): WeatherConditions['air_temperature_range'] {
    if (temperature < 32) return 'very_cold';
    if (temperature < 50) return 'cold';
    if (temperature < 65) return 'cool';
    if (temperature < 80) return 'moderate';
    if (temperature < 90) return 'warm';
    return 'hot';
  }

  private mapHumidityLevel(humidity: number): WeatherConditions['humidity_level'] {
    if (humidity < 30) return 'low';
    if (humidity < 70) return 'moderate';
    return 'high';
  }

  private mapPressureLevel(pressure: number): WeatherConditions['pressure_level'] {
    if (pressure < 1000) return 'low';
    if (pressure < 1020) return 'normal';
    return 'high';
  }

  // Mock data for development/testing
  private getMockWeatherData(): WeatherData {
    const conditions = ['sunny', 'cloudy', 'overcast', 'rainy', 'stormy', 'foggy'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      temperature: Math.floor(Math.random() * 40) + 40, // 40-80°F
      feels_like: Math.floor(Math.random() * 40) + 40,
      humidity: Math.floor(Math.random() * 60) + 30, // 30-90%
      pressure: Math.floor(Math.random() * 50) + 995, // 995-1045 hPa
      wind_speed: Math.random() * 15, // 0-15 mph
      wind_direction: Math.random() * 360, // 0-360 degrees
      weather_condition: randomCondition,
      weather_description: `${randomCondition} conditions`,
      cloudiness: Math.floor(Math.random() * 100), // 0-100%
      visibility: Math.random() * 15 + 5, // 5-20 km
      uv_index: Math.floor(Math.random() * 11), // 0-11
    };
  }

  private getMockForecastData(days: number): WeatherData[] {
    const forecast: WeatherData[] = [];
    for (let i = 0; i < days * 8; i++) { // 8 forecasts per day (3-hour intervals)
      forecast.push(this.getMockWeatherData());
    }
    return forecast;
  }

  // Get fishing-specific weather insights
  getFishingInsights(weatherData: WeatherData): string[] {
    const insights: string[] = [];

    // Temperature insights
    if (weatherData.temperature < 40) {
      insights.push('🐟 Cold water - fish may be deeper and less active');
    } else if (weatherData.temperature > 75) {
      insights.push('🌡️ Warm water - early morning and evening fishing recommended');
    } else {
      insights.push('✅ Good water temperature for active fish');
    }

    // Pressure insights
    if (weatherData.pressure < 1000) {
      insights.push('📉 Low pressure - fish may be more active but weather unstable');
    } else if (weatherData.pressure > 1020) {
      insights.push('📈 High pressure - stable weather, fish may be deeper');
    }

    // Wind insights
    if (weatherData.wind_speed > 10) {
      insights.push('💨 Strong winds - consider sheltered areas or heavier flies');
    } else if (weatherData.wind_speed < 2) {
      insights.push('🌬️ Light winds - perfect for delicate presentations');
    }

    // Weather condition insights
    if (weatherData.weather_condition === 'rainy') {
      insights.push('🌧️ Rain can improve fishing - fish are more active');
    } else if (weatherData.weather_condition === 'stormy') {
      insights.push('⛈️ Stormy conditions - fish before/after storms for best results');
    } else if (weatherData.weather_condition === 'overcast') {
      insights.push('☁️ Overcast skies - excellent fishing conditions');
    }

    // Time-based insights
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 10) {
      insights.push('🌅 Morning hours - prime fishing time');
    } else if (hour >= 17 && hour <= 20) {
      insights.push('🌆 Evening hours - great for surface feeding fish');
    }

    return insights;
  }
}

export const weatherService = new WeatherService();
