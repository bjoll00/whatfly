
// Types for location services
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RiverLocation {
  id: string;
  name: string;
  coordinates: Coordinates;
  type: 'river' | 'lake' | 'stream' | 'pond' | 'dam';
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
 */
export async function findNearestRiver(lat: number, lon: number): Promise<RiverLocation | null> {
  console.log(`🎣 Finding nearest fishing location to coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
  
  // Expanded Utah fishing locations database
  const utahFishingLocations: RiverLocation[] = [
    // Provo River System
    { id: 'provo-river-upper', name: 'Provo River - Above Jordanelle', coordinates: { latitude: 40.6447, longitude: -111.1896 }, type: 'river', description: 'Upper Provo River above Jordanelle Reservoir' },
    { id: 'provo-river-middle', name: 'Provo River - Middle Provo', coordinates: { latitude: 40.5378, longitude: -111.3672 }, type: 'river', description: 'Middle section of the Provo River' },
    { id: 'provo-river-lower', name: 'Provo River - Lower Provo', coordinates: { latitude: 40.2889, longitude: -111.6733 }, type: 'river', description: 'Lower section of the Provo River' },
    { id: 'provo-river-heber', name: 'Provo River - Heber Valley', coordinates: { latitude: 40.5156, longitude: -111.4125 }, type: 'river', description: 'Provo River through Heber Valley' },
    
    // Weber River System
    { id: 'weber-river-oakley', name: 'Weber River - Oakley', coordinates: { latitude: 40.7136, longitude: -111.3003 }, type: 'river', description: 'Weber River near Oakley' },
    { id: 'weber-river-echo', name: 'Weber River - Echo Canyon', coordinates: { latitude: 40.9697, longitude: -111.4267 }, type: 'river', description: 'Weber River through Echo Canyon' },
    { id: 'weber-river-morgan', name: 'Weber River - Morgan', coordinates: { latitude: 41.0361, longitude: -111.6764 }, type: 'river', description: 'Weber River near Morgan' },
    { id: 'weber-river-plain', name: 'Weber River - Plain City', coordinates: { latitude: 41.2983, longitude: -112.0861 }, type: 'river', description: 'Lower Weber River near Plain City' },
    
    // Green River System
    { id: 'green-river-dam', name: 'Green River - Flaming Gorge Dam', coordinates: { latitude: 40.9173, longitude: -109.4247 }, type: 'river', description: 'World-class tailwater fishery below Flaming Gorge' },
    { id: 'green-river-little-hole', name: 'Green River - Little Hole', coordinates: { latitude: 40.8839, longitude: -109.4919 }, type: 'river', description: 'Popular section of Green River' },
    { id: 'green-river-browns-park', name: 'Green River - Browns Park', coordinates: { latitude: 40.7536, longitude: -109.5708 }, type: 'river', description: 'Remote wilderness fishing' },
    { id: 'green-river-jensen', name: 'Green River - Jensen', coordinates: { latitude: 40.3658, longitude: -109.3478 }, type: 'river', description: 'Green River near Jensen' },
    
    // Logan River System
    { id: 'logan-river-upper', name: 'Logan River - Upper Logan', coordinates: { latitude: 41.8803, longitude: -111.5344 }, type: 'river', description: 'Upper Logan River' },
    { id: 'logan-river-canyon', name: 'Logan River - Logan Canyon', coordinates: { latitude: 41.7739, longitude: -111.6808 }, type: 'river', description: 'Scenic Logan Canyon section' },
    { id: 'logan-river-lower', name: 'Logan River - Lower Logan', coordinates: { latitude: 41.7358, longitude: -111.8347 }, type: 'river', description: 'Lower Logan River' },
    
    // Bear River System
    { id: 'bear-river-evanston', name: 'Bear River - Evanston Area', coordinates: { latitude: 41.2644, longitude: -110.9633 }, type: 'river', description: 'Bear River near Evanston' },
    { id: 'bear-river-woodruff', name: 'Bear River - Woodruff', coordinates: { latitude: 41.5194, longitude: -111.2142 }, type: 'river', description: 'Bear River near Woodruff' },
    { id: 'cutler-reservoir', name: 'Bear River - Cutler Reservoir', coordinates: { latitude: 41.8206, longitude: -112.0217 }, type: 'lake', description: 'Cutler Reservoir on Bear River' },
    
    // Reservoirs - Northern Utah
    { id: 'deer-creek', name: 'Deer Creek Reservoir', coordinates: { latitude: 40.4258, longitude: -111.5358 }, type: 'lake', description: 'Popular reservoir with excellent fishing' },
    { id: 'jordanelle', name: 'Jordanelle Reservoir', coordinates: { latitude: 40.6269, longitude: -111.4103 }, type: 'lake', description: 'Large reservoir with diverse fishing' },
    { id: 'rockport', name: 'Rockport Reservoir', coordinates: { latitude: 40.7075, longitude: -111.3586 }, type: 'lake', description: 'Family-friendly reservoir' },
    { id: 'echo', name: 'Echo Reservoir', coordinates: { latitude: 40.9514, longitude: -111.4181 }, type: 'lake', description: 'Echo Reservoir' },
    { id: 'pineview', name: 'Pineview Reservoir', coordinates: { latitude: 41.2522, longitude: -111.8186 }, type: 'lake', description: 'Popular Ogden area reservoir' },
    { id: 'causey', name: 'Causey Reservoir', coordinates: { latitude: 41.2928, longitude: -111.5856 }, type: 'lake', description: 'Mountain reservoir' },
    { id: 'hyrum', name: 'Hyrum Reservoir', coordinates: { latitude: 41.6339, longitude: -111.8508 }, type: 'lake', description: 'Hyrum State Park reservoir' },
    
    // Reservoirs - Central Utah
    { id: 'strawberry', name: 'Strawberry Reservoir', coordinates: { latitude: 40.1786, longitude: -111.1658 }, type: 'lake', description: 'Premier trophy trout fishing' },
    { id: 'currant-creek', name: 'Currant Creek Reservoir', coordinates: { latitude: 40.2553, longitude: -111.0403 }, type: 'lake', description: 'High mountain reservoir' },
    { id: 'scofield', name: 'Scofield Reservoir', coordinates: { latitude: 39.7781, longitude: -111.1578 }, type: 'lake', description: 'Scofield State Park' },
    { id: 'huntington', name: 'Huntington Reservoir', coordinates: { latitude: 39.3942, longitude: -110.9642 }, type: 'lake', description: 'Mountain reservoir' },
    { id: 'electric-lake', name: 'Electric Lake', coordinates: { latitude: 39.4928, longitude: -111.2364 }, type: 'lake', description: 'High elevation fishing' },
    { id: 'flaming-gorge', name: 'Flaming Gorge Reservoir', coordinates: { latitude: 40.9239, longitude: -109.4736 }, type: 'lake', description: 'Massive reservoir with trophy fish' },
    
    // Duchesne River System
    { id: 'duchesne-upper', name: 'Duchesne River - Upper', coordinates: { latitude: 40.5042, longitude: -110.5933 }, type: 'river', description: 'Upper Duchesne River' },
    { id: 'duchesne-hanna', name: 'Duchesne River - Hanna', coordinates: { latitude: 40.4281, longitude: -110.8178 }, type: 'river', description: 'Duchesne River near Hanna' },
    { id: 'duchesne-lower', name: 'Duchesne River - Lower', coordinates: { latitude: 40.1619, longitude: -110.3869 }, type: 'river', description: 'Lower Duchesne River' },
    
    // Southern Utah
    { id: 'beaver-river', name: 'Beaver River', coordinates: { latitude: 38.2775, longitude: -112.6411 }, type: 'river', description: 'Beaver River' },
    { id: 'minersville', name: 'Minersville Reservoir', coordinates: { latitude: 38.2192, longitude: -112.9139 }, type: 'lake', description: 'Minersville Reservoir' },
    { id: 'piute', name: 'Piute Reservoir', coordinates: { latitude: 38.3322, longitude: -112.1194 }, type: 'lake', description: 'Piute Reservoir' },
    { id: 'otter-creek', name: 'Otter Creek Reservoir', coordinates: { latitude: 38.1861, longitude: -111.9861 }, type: 'lake', description: 'Otter Creek State Park' },
    { id: 'sevier-upper', name: 'Sevier River - Upper', coordinates: { latitude: 38.6528, longitude: -112.1772 }, type: 'river', description: 'Upper Sevier River' },
    { id: 'fish-lake', name: 'Fish Lake', coordinates: { latitude: 38.5372, longitude: -111.7294 }, type: 'lake', description: 'Natural high mountain lake, famous for splake' },
    { id: 'johnson-valley', name: 'Johnson Valley Reservoir', coordinates: { latitude: 38.4906, longitude: -111.7894 }, type: 'lake', description: 'Johnson Valley Reservoir' },
    
    // Other Rivers
    { id: 'price-river', name: 'Price River', coordinates: { latitude: 39.5728, longitude: -110.8108 }, type: 'river', description: 'Price River' },
    { id: 'boulder-mountain', name: 'Boulder Mountain - Thousands Lake', coordinates: { latitude: 38.1442, longitude: -111.4861 }, type: 'lake', description: 'High mountain lake on Boulder Mountain' },
    { id: 'ogden-upper', name: 'Ogden River - Upper', coordinates: { latitude: 41.2639, longitude: -111.6631 }, type: 'river', description: 'Upper Ogden River' },
    { id: 'ogden-lower', name: 'Ogden River - Lower', coordinates: { latitude: 41.2231, longitude: -111.9736 }, type: 'river', description: 'Lower Ogden River' },
  ];

  // Find nearest location
  let nearestLocation: RiverLocation | null = null;
  let minDistance = Infinity;

  for (const location of utahFishingLocations) {
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

  if (nearestLocation) {
    console.log(`✅ Found nearest location: ${nearestLocation.name} (${minDistance.toFixed(2)} km / ${(minDistance * 0.621371).toFixed(2)} miles away)`);
  } else {
    console.log(`❌ No fishing locations found near coordinates`);
  }
  
  return nearestLocation;
}

/**
 * Fetch weather data for the given coordinates
 * Now uses the WeatherService for real weather data
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  console.log(`🌤️ Fetching weather data for coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
  
  try {
    // Import WeatherService dynamically to get real weather data
    const { weatherService } = await import('./weatherService');
    const realWeatherData = await weatherService.getWeatherForLocation(lat, lon);
    
    if (realWeatherData) {
      // Convert to legacy format for compatibility
      const weatherData: WeatherData = {
        temperature: realWeatherData.temperature,
        condition: realWeatherData.weather_condition as any,
        windSpeed: realWeatherData.wind_speed,
        windDirection: getWindDirectionFromDegrees(realWeatherData.wind_direction),
        humidity: realWeatherData.humidity,
        pressure: realWeatherData.pressure / 33.86, // Convert hPa to inHg
      };
      
      console.log('✅ Real weather data fetched:', weatherData);
      return weatherData;
    }
  } catch (error) {
    console.warn('⚠️ Failed to fetch real weather, using estimated data:', error);
  }
  
  // Fallback: Generate location-specific estimated weather
  const mockWeather: WeatherData = {
    temperature: estimateTemperature(lat, lon),
    condition: estimateCondition(lat, lon),
    windSpeed: estimateWindSpeed(lat, lon),
    windDirection: estimateWindDirection(lon),
    humidity: estimateHumidity(lat),
    pressure: 30.15
  };

  console.log('📊 Estimated weather data:', mockWeather);
  return mockWeather;
}

// Helper functions for weather estimation
function estimateTemperature(lat: number, lon: number): number {
  const month = new Date().getMonth();
  const season = month >= 2 && month <= 4 ? 'spring' : 
                 month >= 5 && month <= 7 ? 'summer' : 
                 month >= 8 && month <= 10 ? 'fall' : 'winter';
  
  const baseTemps = { spring: 55, summer: 80, fall: 60, winter: 35 };
  
  // Latitude effect (northern = colder)
  const latEffect = (40 - lat) * 2;
  
  // Elevation effect (higher elevation = colder)
  const elevation = 4000 + (lat - 37) * 800 + Math.abs(lon + 111) * 200;
  const elevEffect = -((elevation - 5000) / 1000) * 3.5;
  
  // Location-specific variation
  const coordHash = Math.abs(Math.sin(lat * 12.34 + lon * 56.78) * 98765.4321);
  const variation = (coordHash % 1) * 10 - 5;
  
  return Math.round(baseTemps[season] + latEffect + elevEffect + variation);
}

function estimateCondition(lat: number, lon: number): WeatherData['condition'] {
  const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'overcast'];
  const coordHash = Math.abs(Math.sin(lat * 34.56 + lon * 78.90) * 43210.9876);
  const index = Math.floor((coordHash % 1) * conditions.length);
  return conditions[index];
}

function estimateWindSpeed(lat: number, lon: number): number {
  // Western Utah tends to be windier
  const baseLine = lon < -112 ? 12 : lon < -111 ? 8 : 6;
  const coordHash = Math.abs(Math.sin(lat * 45.67 + lon * 89.01) * 12345.6789);
  const variation = (coordHash % 1) * 10 - 5;
  return Math.max(0, Math.round(baseLine + variation));
}

function estimateWindDirection(lon: number): string {
  const directions = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
  const coordHash = Math.abs(Math.sin(lon * 23.45) * 67890.1234);
  const index = Math.floor((coordHash % 1) * directions.length);
  return directions[index];
}

function estimateHumidity(lat: number): number {
  // Northern Utah tends to be more humid
  const base = lat > 41 ? 50 : lat > 40 ? 40 : 35;
  const coordHash = Math.abs(Math.sin(lat * 67.89) * 54321.0987);
  const variation = (coordHash % 1) * 20 - 10;
  return Math.max(20, Math.min(80, Math.round(base + variation)));
}

function getWindDirectionFromDegrees(degrees: number): string {
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
