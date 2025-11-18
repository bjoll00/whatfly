/**
 * Map Data Converter
 * 
 * Converts data from fetchFishingData (WeatherMarker format) to FishingConditions format
 * This ensures all map data is properly formatted for fly suggestion algorithms
 */

import { FishingConditions } from './types';

/**
 * WeatherMarker interface from fetchFishingData
 */
interface WeatherMarker {
  coordinate: [number, number];
  airTemp: number; // °C
  windSpeedMph: number | null;
  windGustMph: number | null;
  windDirectionDeg: number | null;
  barometricPressureHpa: number | null;
  cloudCoverPercent: number | null;
  weatherDescription: string;
  weatherIcon: string;
  precipitationRainMm: number | null;
  precipitationSnowMm: number | null;
  sunrise: number | null;
  sunset: number | null;
  streamFlow: number | null; // cfs
  waterTemperature: number | null; // °C
  usgsStationId: string | null;
  moonPhase: string | null;
  major1: string | null;
  major2: string | null;
  minor1: string | null;
  minor2: string | null;
  timestamp: string;
}

/**
 * Convert WeatherMarker data to FishingConditions format
 * This ensures all map data is usable by fly suggestion algorithms
 */
export function convertMapDataToFishingConditions(
  mapData: WeatherMarker,
  locationName?: string,
  latitude?: number,
  longitude?: number
): Partial<FishingConditions> {
  const [lng, lat] = mapData.coordinate;
  
  // Convert weather description to weather_conditions enum
  const weatherConditions = convertWeatherDescription(mapData.weatherDescription);
  
  // Convert wind speed (mph) to wind_speed enum
  const windSpeed = convertWindSpeed(mapData.windSpeedMph);
  
  // Convert wind direction (degrees) to wind_direction enum
  const windDirection = convertWindDirection(mapData.windDirectionDeg);
  
  // Convert air temperature (°C) to air_temperature_range
  const airTempF = (mapData.airTemp * 9/5) + 32; // Convert to Fahrenheit
  const airTemperatureRange = convertTemperatureToRange(airTempF);
  
  // Convert water temperature (°C) to water_temperature_range
  const waterTempF = mapData.waterTemperature ? (mapData.waterTemperature * 9/5) + 32 : null;
  const waterTemperatureRange = waterTempF ? convertTemperatureToRange(waterTempF) : 'moderate';
  
  // Convert stream flow (cfs) to water conditions
  const waterConditions = convertFlowToWaterConditions(mapData.streamFlow);
  const waterClarity = convertFlowToWaterClarity(mapData.streamFlow);
  const waterLevel = convertFlowToWaterLevel(mapData.streamFlow);
  const waterFlow = convertFlowToWaterFlow(mapData.streamFlow);
  
  // Get time of day
  const timeOfDay = getTimeOfDay();
  
  // Get time of year (season)
  const timeOfYear = getCurrentSeason();
  
  // Convert moon phase
  const moonPhase = convertMoonPhase(mapData.moonPhase);
  
  // Build solunar periods if available
  const solunarPeriods = buildSolunarPeriods(mapData);
  
  // Build weather_data object with all raw weather data
  const weatherData = {
    temperature: airTempF,
    feels_like: null, // Not available from map data
    humidity: null, // Not available from map data
    pressure: mapData.barometricPressureHpa || null,
    wind_speed: mapData.windSpeedMph || 0,
    wind_direction: mapData.windDirectionDeg || 0,
    weather_condition: weatherConditions,
    weather_description: mapData.weatherDescription,
    cloudiness: mapData.cloudCoverPercent || 0,
    visibility: null, // Not available from map data
    uv_index: null, // Not available from map data
    sunrise: mapData.sunrise ? new Date(mapData.sunrise * 1000).toISOString() : null,
    sunset: mapData.sunset ? new Date(mapData.sunset * 1000).toISOString() : null,
    precipitation_rain: mapData.precipitationRainMm || 0,
    precipitation_snow: mapData.precipitationSnowMm || 0,
    cloud_cover: mapData.cloudCoverPercent || 0,
  };
  
  // Build water_data object with all raw water data
  // IMPORTANT: Use camelCase to match FishingConditions interface
  const waterData = {
    flowRate: mapData.streamFlow || undefined, // Use camelCase: flowRate (not flow_rate)
    waterTemperature: waterTempF || undefined, // Use camelCase: waterTemperature (not water_temperature)
    gaugeHeight: null, // Not available from map data
    stationId: mapData.usgsStationId || undefined,
    stationName: mapData.usgsStationId ? `USGS Station ${mapData.usgsStationId}` : undefined,
    lastUpdated: mapData.timestamp,
    dataSource: mapData.usgsStationId ? 'USGS' as const : undefined,
    dataQuality: mapData.streamFlow !== null || mapData.waterTemperature !== null ? 'GOOD' as const : 'FAIR' as const,
    isActive: true,
  };
  
  const conditions: Partial<FishingConditions> = {
    date: new Date().toISOString(),
    location: locationName || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    latitude: latitude || lat,
    longitude: longitude || lng,
    weather_conditions: weatherConditions,
    water_conditions: waterConditions,
    water_temperature_range: waterTemperatureRange as FishingConditions['water_temperature_range'],
    water_temperature: waterTempF || undefined,
    air_temperature_range: airTemperatureRange as FishingConditions['air_temperature_range'],
    wind_speed: windSpeed,
    wind_direction: windDirection,
    water_clarity: waterClarity,
    water_level: waterLevel,
    water_flow: waterFlow,
    time_of_day: timeOfDay,
    time_of_year: timeOfYear,
    moon_phase: moonPhase,
    solunar_periods: solunarPeriods,
    weather_data: weatherData,
    water_data: waterData,
  };
  
  console.log('🔄 Converted map data to FishingConditions:', {
    location: conditions.location,
    weather: conditions.weather_conditions,
    water: conditions.water_conditions,
    airTemp: airTempF.toFixed(1) + '°F',
    waterTemp: waterTempF ? waterTempF.toFixed(1) + '°F' : 'N/A',
    windSpeed: mapData.windSpeedMph?.toFixed(1) + ' mph' || 'N/A',
    streamFlow: mapData.streamFlow?.toFixed(1) + ' cfs' || 'N/A',
    moonPhase: mapData.moonPhase || 'N/A',
    timeOfDay: timeOfDay,
    timeOfYear: timeOfYear,
    // CRITICAL: Log real-time water data to verify it's being passed
    hasWaterData: !!conditions.water_data,
    waterDataFlowRate: conditions.water_data?.flowRate,
    waterDataTemp: conditions.water_data?.waterTemperature,
    waterDataQuality: conditions.water_data?.dataQuality,
  });
  
  return conditions;
}

/**
 * Convert weather description string to weather_conditions enum
 */
function convertWeatherDescription(description: string): FishingConditions['weather_conditions'] {
  const desc = description.toLowerCase();
  
  if (desc.includes('clear') || desc.includes('sunny') || desc.includes('sun')) {
    return 'sunny';
  }
  if (desc.includes('cloud') && !desc.includes('overcast')) {
    return 'cloudy';
  }
  if (desc.includes('overcast')) {
    return 'overcast';
  }
  if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) {
    return 'rainy';
  }
  if (desc.includes('storm') || desc.includes('thunder')) {
    return 'stormy';
  }
  if (desc.includes('fog') || desc.includes('mist')) {
    return 'foggy';
  }
  
  // Default to sunny if unclear
  return 'sunny';
}

/**
 * Convert wind speed (mph) to wind_speed enum
 */
function convertWindSpeed(windSpeedMph: number | null): FishingConditions['wind_speed'] {
  if (!windSpeedMph) return 'none';
  if (windSpeedMph < 5) return 'none';
  if (windSpeedMph < 15) return 'light';
  if (windSpeedMph < 25) return 'moderate';
  if (windSpeedMph < 35) return 'strong';
  return 'very_strong';
}

/**
 * Convert wind direction (degrees) to wind_direction enum
 */
function convertWindDirection(windDirectionDeg: number | null): FishingConditions['wind_direction'] {
  if (windDirectionDeg === null) return 'variable';
  
  // Convert degrees (0-360) to cardinal directions
  const normalized = ((windDirectionDeg % 360) + 360) % 360;
  
  if (normalized >= 337.5 || normalized < 22.5) return 'north';
  if (normalized >= 22.5 && normalized < 67.5) return 'northeast';
  if (normalized >= 67.5 && normalized < 112.5) return 'east';
  if (normalized >= 112.5 && normalized < 157.5) return 'southeast';
  if (normalized >= 157.5 && normalized < 202.5) return 'south';
  if (normalized >= 202.5 && normalized < 247.5) return 'southwest';
  if (normalized >= 247.5 && normalized < 292.5) return 'west';
  if (normalized >= 292.5 && normalized < 337.5) return 'northwest';
  
  return 'variable';
}

/**
 * Convert temperature (°F) to temperature_range enum
 */
function convertTemperatureToRange(tempF: number): FishingConditions['water_temperature_range'] | FishingConditions['air_temperature_range'] {
  if (tempF < 32) return 'very_cold';
  if (tempF < 45) return 'cold';
  if (tempF < 60) return 'cool';
  if (tempF < 75) return 'moderate';
  if (tempF < 85) return 'warm';
  return 'hot';
}

/**
 * Convert stream flow (cfs) to water_conditions enum
 */
function convertFlowToWaterConditions(flowCfs: number | null): FishingConditions['water_conditions'] {
  if (!flowCfs) return 'calm';
  if (flowCfs < 50) return 'calm';
  if (flowCfs < 100) return 'rippled';
  if (flowCfs < 200) return 'choppy';
  if (flowCfs < 400) return 'fast_moving';
  return 'turbulent';
}

/**
 * Convert stream flow (cfs) to water_clarity enum
 */
function convertFlowToWaterClarity(flowCfs: number | null): FishingConditions['water_clarity'] {
  if (!flowCfs) return 'clear';
  if (flowCfs < 50) return 'clear';
  if (flowCfs < 100) return 'slightly_murky';
  if (flowCfs < 200) return 'murky';
  return 'very_murky';
}

/**
 * Convert stream flow (cfs) to water_level enum
 */
function convertFlowToWaterLevel(flowCfs: number | null): FishingConditions['water_level'] {
  if (!flowCfs) return 'normal';
  if (flowCfs < 50) return 'low';
  if (flowCfs < 150) return 'normal';
  if (flowCfs < 300) return 'high';
  return 'flooding';
}

/**
 * Convert stream flow (cfs) to water_flow enum
 */
function convertFlowToWaterFlow(flowCfs: number | null): FishingConditions['water_flow'] {
  if (!flowCfs) return 'moderate';
  if (flowCfs < 60) return 'still';
  if (flowCfs < 180) return 'slow';
  if (flowCfs < 400) return 'moderate';
  if (flowCfs < 800) return 'fast';
  return 'rapid';
}

/**
 * Get current time of day
 */
function getTimeOfDay(): FishingConditions['time_of_day'] {
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
function getCurrentSeason(): FishingConditions['time_of_year'] {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

/**
 * Convert moon phase string to moon_phase enum
 */
function convertMoonPhase(moonPhase: string | null): FishingConditions['moon_phase'] | undefined {
  if (!moonPhase) return undefined;
  
  const phase = moonPhase.toLowerCase();
  if (phase.includes('new')) return 'new';
  if (phase.includes('waxing') && phase.includes('crescent')) return 'waxing_crescent';
  if (phase.includes('first') || phase.includes('quarter')) return 'first_quarter';
  if (phase.includes('waxing') && phase.includes('gibbous')) return 'waxing_gibbous';
  if (phase.includes('full')) return 'full';
  if (phase.includes('waning') && phase.includes('gibbous')) return 'waning_gibbous';
  if (phase.includes('last') || phase.includes('third')) return 'last_quarter';
  if (phase.includes('waning') && phase.includes('crescent')) return 'waning_crescent';
  
  return undefined;
}

/**
 * Build solunar_periods object from map data
 */
function buildSolunarPeriods(mapData: WeatherMarker): FishingConditions['solunar_periods'] | undefined {
  if (!mapData.major1 && !mapData.major2 && !mapData.minor1 && !mapData.minor2) {
    return undefined;
  }
  
  const periods: FishingConditions['solunar_periods'] = {};
  
  if (mapData.major1 || mapData.major2) {
    periods.major_periods = [];
    if (mapData.major1) {
      periods.major_periods.push({
        start: mapData.major1,
        end: mapData.major1, // If only time provided, use same for start/end
        duration: 60, // Default 60 minutes
        peak: mapData.major1,
      });
    }
    if (mapData.major2) {
      periods.major_periods.push({
        start: mapData.major2,
        end: mapData.major2,
        duration: 60,
        peak: mapData.major2,
      });
    }
  }
  
  if (mapData.minor1 || mapData.minor2) {
    periods.minor_periods = [];
    if (mapData.minor1) {
      periods.minor_periods.push({
        start: mapData.minor1,
        end: mapData.minor1,
        duration: 30, // Default 30 minutes for minor periods
        peak: mapData.minor1,
      });
    }
    if (mapData.minor2) {
      periods.minor_periods.push({
        start: mapData.minor2,
        end: mapData.minor2,
        duration: 30,
        peak: mapData.minor2,
      });
    }
  }
  
  if (mapData.sunrise) {
    periods.sunrise = new Date(mapData.sunrise * 1000).toISOString();
  }
  if (mapData.sunset) {
    periods.sunset = new Date(mapData.sunset * 1000).toISOString();
  }
  
  return Object.keys(periods).length > 0 ? periods : undefined;
}

