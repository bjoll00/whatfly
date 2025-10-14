
// Types for location services
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RiverLocation {
  id: string;
  name: string;
  coordinates: Coordinates;
  type: 'river' | 'lake' | 'stream' | 'pond';
  description?: string;
}

export interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'overcast' | 'rainy' | 'stormy' | 'foggy';
  windSpeed: number;
  windDirection: string;
  humidity: number;
  pressure: number;
}

export interface USGSWaterData {
  riverId: string;
  flowRate?: number; // cubic feet per second
  waterTemperature?: number; // degrees Fahrenheit
  waterLevel?: number; // feet
  lastUpdated: string;
  stationName: string;
}

/**
 * Find the nearest fishing location (river/lake/stream) to the given coordinates
 * This is a placeholder function that will later connect to Supabase/Postgres
 */
export async function findNearestRiver(lat: number, lon: number): Promise<RiverLocation | null> {
  console.log(`Finding nearest river to coordinates: ${lat}, ${lon}`);
  
  // Placeholder implementation - in production this would query the database
  // For now, return a mock location near the Provo River area
  const mockLocations: RiverLocation[] = [
    {
      id: 'provo-river-main',
      name: 'Provo River - Main Stem',
      coordinates: { latitude: 40.3, longitude: -111.6 },
      type: 'river',
      description: 'Popular trout fishing destination in Utah'
    },
    {
      id: 'provo-river-lower',
      name: 'Provo River - Lower Section',
      coordinates: { latitude: 40.25, longitude: -111.7 },
      type: 'river',
      description: 'Lower section of the Provo River'
    },
    {
      id: 'deer-creek-reservoir',
      name: 'Deer Creek Reservoir',
      coordinates: { latitude: 40.45, longitude: -111.5 },
      type: 'lake',
      description: 'Large reservoir with excellent fishing'
    }
  ];

  // Simple distance calculation (in production, use proper geospatial queries)
  let nearestLocation: RiverLocation | null = null;
  let minDistance = Infinity;

  for (const location of mockLocations) {
    const distance = calculateDistance(
      lat, lon,
      location.coordinates.latitude,
      location.coordinates.longitude
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestLocation = location;
    }
  }

  console.log(`Found nearest location: ${nearestLocation?.name} (${minDistance.toFixed(2)} km away)`);
  return nearestLocation;
}

/**
 * Fetch weather data for the given coordinates
 * This is a placeholder function that will later connect to OpenWeather API
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  console.log(`Fetching weather data for coordinates: ${lat}, ${lon}`);
  
  // Placeholder implementation - in production this would call OpenWeather API
  // For now, return mock weather data
  const mockWeather: WeatherData = {
    temperature: 72, // Fahrenheit
    condition: 'sunny',
    windSpeed: 8, // mph
    windDirection: 'west',
    humidity: 45,
    pressure: 30.15
  };

  console.log('Weather data fetched:', mockWeather);
  return mockWeather;
}

/**
 * Fetch USGS water data for the given river ID
 * This is a placeholder function that will later connect to USGS API
 */
export async function fetchUSGS(riverId: string): Promise<USGSWaterData | null> {
  console.log(`Fetching USGS water data for river: ${riverId}`);
  
  // Placeholder implementation - in production this would call USGS API
  // For now, return mock water data
  const mockWaterData: USGSWaterData = {
    riverId,
    flowRate: 125, // cubic feet per second
    waterTemperature: 58, // degrees Fahrenheit
    waterLevel: 3.2, // feet
    lastUpdated: new Date().toISOString(),
    stationName: 'Provo River at Provo, UT'
  };

  console.log('USGS water data fetched:', mockWaterData);
  return mockWaterData;
}

/**
 * Get recommended flies based on location, weather, water data, and season
 * This function integrates with the existing fly suggestion service
 */
export async function getRecommendedFlies(params: {
  river?: RiverLocation; // Make river optional
  weather: WeatherData;
  waterData: USGSWaterData | null;
  waterConditions?: any; // Add water conditions parameter
  season: string;
}): Promise<any[]> {
  console.log('Getting recommended flies with params:', params);
  
  try {
    // Import the integration service dynamically to avoid circular dependencies
    const { MapIntegrationService } = await import('./mapIntegration');
    
    const result = await MapIntegrationService.getFlySuggestionsFromMapData({
      river: params.river,
      weather: params.weather,
      waterData: params.waterData,
      waterConditions: params.waterConditions, // Pass water conditions
    });

    if (result.success && result.suggestions) {
      console.log('Got fly suggestions from integration service:', result.suggestions);
      return result.suggestions;
    } else {
      console.warn('Failed to get suggestions from integration service, using mock data');
      return getMockRecommendations(params);
    }
  } catch (error) {
    console.error('Error in getRecommendedFlies:', error);
    return getMockRecommendations(params);
  }
}

/**
 * Fallback mock recommendations when the integration service fails
 */
function getMockRecommendations(params: {
  river?: RiverLocation; // Make river optional
  weather: WeatherData;
  waterData: USGSWaterData | null;
  waterConditions?: any; // Add water conditions parameter
  season: string;
}): any[] {
  // Generate recommendations based on available data
  const baseRecommendations = [
    {
      fly: {
        id: '1',
        name: 'Adams Parachute',
        type: 'dry',
        size: '16',
        color: 'gray',
        description: 'Excellent all-around dry fly'
      },
      confidence: 0.85,
      reason: 'Perfect conditions for dry fly fishing'
    },
    {
      fly: {
        id: '2',
        name: 'Pheasant Tail Nymph',
        type: 'nymph',
        size: '18',
        color: 'brown',
        description: 'Imitates various aquatic insects'
      },
      confidence: 0.78,
      reason: 'Good nymphing conditions'
    }
  ];

  // Enhance recommendations with water conditions data if available
  if (params.waterConditions) {
    const waterConditions = params.waterConditions;
    baseRecommendations.forEach(fly => {
      let additionalReasons = [];
      
      if (waterConditions.flowRate) {
        if (waterConditions.flowRate > 200) {
          additionalReasons.push('High flow conditions');
          fly.confidence += 0.1;
        } else if (waterConditions.flowRate < 50) {
          additionalReasons.push('Low flow conditions');
          fly.confidence += 0.05;
        } else {
          additionalReasons.push('Optimal flow conditions');
          fly.confidence += 0.15;
        }
      }
      
      if (waterConditions.waterTemperature) {
        if (waterConditions.waterTemperature < 40) {
          additionalReasons.push('Cold water - slow presentation');
          fly.confidence += 0.1;
        } else if (waterConditions.waterTemperature > 60) {
          additionalReasons.push('Warm water - active fish');
          fly.confidence += 0.15;
        }
      }
      
      if (waterConditions.stationName) {
        additionalReasons.push(`Data from ${waterConditions.stationName}`);
      }
      
      if (additionalReasons.length > 0) {
        fly.reason += ` (${additionalReasons.join(', ')})`;
      }
      
      // Cap confidence at 1.0
      fly.confidence = Math.min(fly.confidence, 1.0);
    });
  }

  return baseRecommendations;
}

// Helper functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 20) return 'dusk';
  return 'night';
}

function getWaterClarityFromFlow(flowRate?: number): 'clear' | 'slightly_murky' | 'murky' | 'very_murky' {
  if (!flowRate) return 'clear';
  if (flowRate < 50) return 'clear';
  if (flowRate < 100) return 'slightly_murky';
  if (flowRate < 200) return 'murky';
  return 'very_murky';
}

function getWaterLevelFromFlow(flowRate?: number): 'low' | 'normal' | 'high' | 'flooding' {
  if (!flowRate) return 'normal';
  if (flowRate < 50) return 'low';
  if (flowRate < 150) return 'normal';
  if (flowRate < 300) return 'high';
  return 'flooding';
}
