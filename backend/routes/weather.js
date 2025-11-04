/**
 * Weather API Routes
 * 
 * Securely proxies requests to OpenWeatherMap API
 * API key is stored in environment variables, never exposed to frontend
 */

import express from 'express';
// Using built-in fetch (Node.js 18+) - no need for node-fetch

const router = express.Router();

/**
 * GET /api/weather/current
 * 
 * Get current weather for a specific location
 * 
 * Query parameters:
 * - lat: latitude (required)
 * - lon: longitude (required)
 */
router.get('/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    // Validate input
    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both lat and lon query parameters are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: 'lat and lon must be valid numbers'
      });
    }

    // Check if API key is configured
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENWEATHER_API_KEY not configured');
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Weather API is not configured'
      });
    }

    // Call OpenWeatherMap API
    // Using metric units for consistency with frontend (converts to mph in frontend)
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    
    console.log(`🌤️ Fetching weather for: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { message: errorText };
      }
      
      console.error(`❌ Weather API error: ${response.status}`, errorDetails);
      
      // Provide helpful error messages
      let errorMessage = `Failed to fetch weather data: ${response.statusText}`;
      if (response.status === 401) {
        errorMessage = 'Invalid API key. Please check your OPENWEATHER_API_KEY in .env file. Note: New API keys take 10-15 minutes to activate.';
      } else if (response.status === 429) {
        errorMessage = 'API rate limit exceeded. Please try again later.';
      } else if (errorDetails.message) {
        errorMessage = errorDetails.message;
      }
      
      return res.status(response.status).json({
        error: 'Weather API error',
        message: errorMessage,
        details: errorDetails
      });
    }

    const data = await response.json();

    // Validate response structure
    if (!data || !data.main || !data.weather) {
      console.error('❌ Invalid weather API response:', data);
      return res.status(500).json({
        error: 'Invalid response',
        message: 'Weather API returned invalid data'
      });
    }

    // Parse and filter response - return all fields needed for fishing reports
    // Note: OpenWeatherMap returns imperial units when units=imperial
    // Temperature is in Fahrenheit, wind speed is in mph
    const weatherData = {
      // Main weather data
      main: {
        temp: data.main.temp, // Temperature in °F (or °C if units=metric)
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure, // hPa
      },
      // Wind data
      wind: {
        speed: data.wind?.speed || null, // mph (imperial) or m/s (metric)
        gust: data.wind?.gust || null, // mph (imperial) or m/s (metric)
        deg: data.wind?.deg || null, // degrees (0-360)
      },
      // Clouds
      clouds: {
        all: data.clouds?.all || null, // percentage
      },
      // Weather description
      weather: data.weather && data.weather.length > 0 ? [{
        main: data.weather[0].main, // e.g., "Clear", "Clouds", "Rain"
        description: data.weather[0].description, // e.g., "clear sky", "light rain"
        icon: data.weather[0].icon, // e.g., "01d", "10n"
      }] : [],
      // Precipitation
      rain: data.rain ? {
        '1h': data.rain['1h'] || null, // mm - rain volume for last hour
      } : null,
      snow: data.snow ? {
        '1h': data.snow['1h'] || null, // mm - snow volume for last hour
      } : null,
      // System data (sunrise/sunset)
      sys: {
        sunrise: data.sys?.sunrise || null, // Unix timestamp (seconds)
        sunset: data.sys?.sunset || null, // Unix timestamp (seconds)
      },
      // Additional data
      visibility: data.visibility ? (data.visibility / 1609.34) : null, // Convert meters to miles
      uv_index: data.uvi || null,
      timestamp: new Date().toISOString(),
      coordinates: {
        lat: latitude,
        lon: longitude
      }
    };

    console.log(`✅ Weather fetched: ${weatherData.main.temp}°C, ${weatherData.weather[0]?.main || 'unknown'}`);

    res.json(weatherData);

  } catch (error) {
    console.error('❌ Error in weather route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch weather data'
    });
  }
});

/**
 * GET /api/weather/forecast
 * 
 * Get weather forecast for a specific location
 * 
 * Query parameters:
 * - lat: latitude (required)
 * - lon: longitude (required)
 * - days: number of days (optional, default: 5)
 */
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon, days = 5 } = req.query;

    // Validate input
    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both lat and lon query parameters are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const forecastDays = parseInt(days, 10);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(forecastDays)) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: 'lat, lon, and days must be valid numbers'
      });
    }

    // Check if API key is configured
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Weather API is not configured'
      });
    }

    // Call OpenWeatherMap Forecast API
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;
    
    console.log(`🌤️ Fetching ${forecastDays}-day forecast for: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Forecast API error: ${response.status}`, errorText);
      
      return res.status(response.status).json({
        error: 'Weather API error',
        message: `Failed to fetch forecast: ${response.statusText}`
      });
    }

    const data = await response.json();

    // Parse forecast data
    const forecast = data.list
      .slice(0, forecastDays * 8) // 8 forecasts per day (3-hour intervals)
      .map((item) => ({
        temperature: Math.round(item.main.temp),
        feels_like: Math.round(item.main.feels_like),
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        wind_speed: item.wind?.speed || 0,
        wind_direction: item.wind?.deg || 0,
        weather_condition: item.weather[0]?.main?.toLowerCase() || 'unknown',
        weather_description: item.weather[0]?.description || '',
        cloudiness: item.clouds?.all || 0,
        datetime: new Date(item.dt * 1000).toISOString(),
        precipitation: item.rain?.['3h'] || item.snow?.['3h'] || 0
      }));

    console.log(`✅ Forecast fetched: ${forecast.length} data points`);

    res.json({
      forecast,
      count: forecast.length,
      location: {
        lat: latitude,
        lon: longitude
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in forecast route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch weather forecast'
    });
  }
});

export { router as weatherRouter };

