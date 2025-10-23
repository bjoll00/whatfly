// Weather service for getting weather conditions at specific locations
// Using OpenWeatherMap API (free tier available)

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
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    // Your OpenWeatherMap API key
    this.apiKey = 'b64cf952d33ef1f30245776704e18fed';
  }

  async getWeatherForLocation(latitude: number, longitude: number): Promise<WeatherData | null> {
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_ACTUAL_API_KEY' || this.apiKey === 'YOUR_OPENWEATHER_API_KEY') {
        console.warn('Weather API key not configured. Using mock data.');
        return this.getMockWeatherData();
      }

      const response = await fetch(
        `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=imperial`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Return mock data as fallback
      return this.getMockWeatherData();
    }
  }

  async getWeatherForecast(latitude: number, longitude: number, days: number = 5): Promise<WeatherData[]> {
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_ACTUAL_API_KEY' || this.apiKey === 'YOUR_OPENWEATHER_API_KEY') {
        console.warn('Weather API key not configured. Using mock forecast data.');
        return this.getMockForecastData(days);
      }

      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=imperial`
      );

      if (!response.ok) {
        throw new Error(`Weather forecast API error: ${response.status}`);
      }

      const data = await response.json();
      return data.list.slice(0, days * 8).map((item: any) => this.parseWeatherData(item));
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return this.getMockForecastData(days);
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
      if (!this.apiKey || this.apiKey === 'YOUR_ACTUAL_API_KEY' || this.apiKey === 'YOUR_OPENWEATHER_API_KEY') {
        console.warn('Weather API key not configured. Using mock comprehensive data.');
        const mockCurrent = this.getMockWeatherData();
        const mockForecast = this.getMockForecastData(5);
        return {
          current: mockCurrent,
          forecast: mockForecast,
          detailed: {
            humidity: 65,
            pressure: 1013,
            visibility: 10,
            uv_index: 6,
            cloud_cover: 30,
            precipitation: {
              current: 0,
              probability: 20,
              type: 'none'
            }
          }
        };
      }

      // Fetch current weather with detailed information
      const currentResponse = await fetch(
        `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=imperial`
      );

      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();
      const current = this.parseWeatherData(currentData);

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `${this.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=imperial`
      );

      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }

      const forecastData = await forecastResponse.json();
      const forecast = this.parseForecastData(forecastData);

      // Extract detailed information
      const detailed = {
        humidity: currentData.main?.humidity,
        pressure: currentData.main?.pressure,
        visibility: currentData.visibility ? currentData.visibility / 1609.34 : undefined, // Convert meters to miles
        uv_index: currentData.uvi,
        cloud_cover: currentData.clouds?.all,
        precipitation: {
          current: currentData.rain?.['1h'] || currentData.snow?.['1h'] || 0,
          probability: Math.round((currentData.pop || 0) * 100),
          type: this.getPrecipitationType(currentData.weather?.[0]?.main, currentData.weather?.[0]?.description)
        }
      };

      return {
        current,
        forecast,
        detailed
      };

    } catch (error) {
      console.error('Error fetching comprehensive weather data:', error);
      // Return mock data as fallback
      const mockCurrent = this.getMockWeatherData();
      const mockForecast = this.getMockForecastData(5);
      return {
        current: mockCurrent,
        forecast: mockForecast,
        detailed: {
          humidity: 65,
          pressure: 1013,
          visibility: 10,
          uv_index: 6,
          cloud_cover: 30,
          precipitation: {
            current: 0,
            probability: 20,
            type: 'none'
          }
        }
      };
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
