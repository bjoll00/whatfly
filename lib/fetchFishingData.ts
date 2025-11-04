/**
 * Fetch Fishing Data Integration
 * 
 * Integrates data from:
 * - Mapbox (for coordinates)
 * - OpenWeatherMap (for weather conditions)
 * - USGS Water Services (for water conditions)
 * 
 * Refactored to:
 * 1. Find nearest USGS station using Site Service endpoint
 * 2. Fetch weather and water data concurrently
 * 3. Return combined fishing data
 */

import { API_ENDPOINTS, apiRequest } from './apiConfig';

interface WeatherMarker {
  coordinate: [number, number]; // [longitude, latitude]
  // Weather data
  airTemp: number; // °C - Air temperature
  windSpeedMph: number | null; // mph - Wind speed
  windGustMph: number | null; // mph - Wind gusts
  windDirectionDeg: number | null; // degrees - Wind direction (0-360)
  barometricPressureHpa: number | null; // hPa - Barometric pressure
  cloudCoverPercent: number | null; // percentage - Cloud cover
  weatherDescription: string; // Weather summary
  weatherIcon: string; // Weather icon code
  precipitationRainMm: number | null; // mm - Current rain volume (1h)
  precipitationSnowMm: number | null; // mm - Current snow volume (1h)
  sunrise: number | null; // Unix timestamp - Sunrise time
  sunset: number | null; // Unix timestamp - Sunset time
  // Water data
  streamFlow: number | null; // cubic feet per second (cfs)
  waterTemperature: number | null; // °C
  usgsStationId: string | null;
  timestamp: string;
}

interface USGSSite {
  site_no: string;
  station_nm: string;
  dec_lat_va: string;
  dec_long_va: string;
}

interface USGSIVValue {
  value: string;
  qualifiers: string;
  dateTime: string;
}

interface USGSIVTimeSeries {
  variable: {
    variableCode: Array<{
      value: string; // '00060' for flow, '00010' for temp
    }>;
    variableName: string;
  };
  values: Array<{
    value: Array<USGSIVValue>;
  }>;
}

/**
 * Fetch fishing data for a given location
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @param OWM_API_KEY - OpenWeatherMap API key (optional, uses backend if not provided)
 * @returns Combined fishing data with weather and water conditions
 */
export async function fetchFishingData(
  lat: number,
  lng: number,
  OWM_API_KEY?: string
): Promise<WeatherMarker | null> {
  try {
    console.log(`🎣 Fetching fishing data for: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

    // --- STEP 1: Isolate Station ID Search ---
    // Execute USGS Site Service first, synchronously
    const stationId = await findNearestUSGSStationId(lat, lng);
    
    if (!stationId) {
      console.warn('⚠️ No USGS station found nearby, continuing with weather data only');
    } else {
      console.log(`✅ Found nearest USGS station ID: ${stationId}`);
    }

    // --- STEP 2: Conditional Concurrent Fetch ---
    // Create array of API promises
    const promises: Promise<any>[] = [
      fetchOpenWeatherData(lat, lng, OWM_API_KEY)
    ];

    // IF stationId is NOT null, add USGS IV fetch promise
    if (stationId) {
      promises.push(fetchUSGSInstantaneousValues(stationId));
    }

    console.log('🌐 Fetching weather and water data concurrently...');

    // --- STEP 3: Execution & Processing ---
    const results = await Promise.all(promises);
    
    // Extract results based on what was fetched
    const weatherData = results[0];
    const usgsData = stationId ? results[1] : null;

    // --- STEP 4: Process and Combine Data ---
    const marker: WeatherMarker = {
      coordinate: [lng, lat],
      // Weather data (all fields from OpenWeatherMap)
      airTemp: weatherData.airTemp,
      windSpeedMph: weatherData.windSpeedMph,
      windGustMph: weatherData.windGustMph,
      windDirectionDeg: weatherData.windDirectionDeg,
      barometricPressureHpa: weatherData.barometricPressureHpa,
      cloudCoverPercent: weatherData.cloudCoverPercent,
      weatherDescription: weatherData.weatherDescription,
      weatherIcon: weatherData.weatherIcon,
      precipitationRainMm: weatherData.precipitationRainMm,
      precipitationSnowMm: weatherData.precipitationSnowMm,
      sunrise: weatherData.sunrise,
      sunset: weatherData.sunset,
      // Water data (from USGS)
      streamFlow: usgsData?.flowRate || null,
      waterTemperature: usgsData?.waterTemperature || null,
      usgsStationId: stationId,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ Fishing data fetched successfully:', {
      airTemp: marker.airTemp,
      windSpeed: marker.windSpeedMph,
      pressure: marker.barometricPressureHpa,
      streamFlow: marker.streamFlow,
      waterTemp: marker.waterTemperature,
      stationId: marker.usgsStationId
    });
    
    return marker;

  } catch (error) {
    console.error('❌ Error fetching fishing data:', error);
    return null;
  }
}

/**
 * STEP 1: Find the nearest USGS station ID using bounding box
 * Uses USGS IV endpoint with bBox to find stations (more reliable than Site Service)
 * According to USGS docs: IV endpoint supports bBox for spatial queries
 * Returns only the station ID (string) or null
 */
async function findNearestUSGSStationId(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    // 1.1. Calculate the four coordinates for the bBox (±0.25 degrees buffer)
    const latBuffer = 0.25;
    const lonBuffer = 0.25;
    const minLat = lat - latBuffer;
    const maxLat = lat + latBuffer;
    const minLon = lng - lonBuffer;
    const maxLon = lng + lonBuffer;

    // 1.2. Use .toFixed(6) to limit floating point precision
    // 1.3. Construct bBox string per USGS documentation:
    //      Format: minLongitude,minLatitude,maxLongitude,maxLatitude
    //      Use array and .join(',') to guarantee correct comma separation without spaces
    const bBox = [
      minLon.toFixed(6),
      minLat.toFixed(6),
      maxLon.toFixed(6),
      maxLat.toFixed(6)
    ].join(',');
    
    // Use USGS IV endpoint with bBox as major filter
    // According to USGS docs: https://waterservices.usgs.gov/docs/instantaneous-values/instantaneous-values-details/
    // - Must use ONE major filter (bBox, sites, stateCd, huc, or counties)
    // - bBox format: minLongitude,minLatitude,maxLongitude,maxLatitude
    // - parameterCd: comma-separated parameter codes
    // - siteStatus: active (optional but recommended)
    // NOTE: Do NOT use hasDataTypeCd - it's not a valid parameter for IV endpoint
    const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&bBox=${bBox}&parameterCd=00060,00010&siteStatus=active`;
    
    console.log(`🔍 Searching USGS IV endpoint for stations with bbox: ${bBox}`);
    console.log(`🔗 Full URL: ${url}`);

    // Fetch the data with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    // Error handling per USGS fault-resistant code guidelines
    if (!response.ok) {
      if (response.status === 400) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        console.warn(`⚠️ USGS IV endpoint returned HTTP 400 (Bad Request)`);
        console.warn(`   This often occurs if URL arguments are inconsistent`);
        console.warn(`   bBox format: ${bBox}`);
        console.warn(`   Error: ${errorText.substring(0, 300)}`);
      } else if (response.status === 403) {
        console.error(`❌ USGS API returned HTTP 403 (Access Forbidden)`);
        console.error(`   Your IP may be blocked for excessive usage`);
      } else if (response.status === 404) {
        console.warn(`⚠️ No data found for this location (HTTP 404)`);
      } else {
        console.warn(`⚠️ USGS IV endpoint returned error: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();

    // Parse the JSON response - IV endpoint returns timeSeries with station info
    if (!data?.value?.timeSeries || data.value.timeSeries.length === 0) {
      console.warn('⚠️ No USGS stations found in bounding box');
      return null;
    }

    // Extract unique stations and calculate distances
    const stationMap = new Map<string, { distanceSquared: number; lat: number; lon: number }>();

    data.value.timeSeries.forEach((series: any) => {
      try {
        const siteCode = series.sourceInfo?.siteCode?.[0]?.value;
        const geoLocation = series.sourceInfo?.geoLocation?.geogLocation;

        if (!siteCode || !geoLocation) {
          return;
        }

        const siteLat = parseFloat(geoLocation.latitude);
        const siteLon = parseFloat(geoLocation.longitude);

        if (isNaN(siteLat) || isNaN(siteLon)) {
          return;
        }

        // Calculate squared Euclidean distance
        const latDiff = siteLat - lat;
        const lonDiff = siteLon - lng;
        const distanceSquared = latDiff * latDiff + lonDiff * lonDiff;

        // Keep only the closest instance if a station appears multiple times
        if (!stationMap.has(siteCode) || distanceSquared < stationMap.get(siteCode)!.distanceSquared) {
          stationMap.set(siteCode, {
            distanceSquared,
            lat: siteLat,
            lon: siteLon
          });
        }
      } catch (parseError) {
        console.warn('Error parsing USGS station data:', parseError);
      }
    });

    // Select the site with minimum distance
    if (stationMap.size === 0) {
      console.warn('⚠️ No valid USGS stations found after parsing');
      return null;
    }

    // Sort by distance squared and return the nearest station ID
    const stations = Array.from(stationMap.entries())
      .map(([site_no, info]) => ({ site_no, distanceSquared: info.distanceSquared }))
      .sort((a, b) => a.distanceSquared - b.distanceSquared);
    
    const nearestSiteId = stations[0].site_no;
    const distance = Math.sqrt(stations[0].distanceSquared) * 69; // Rough conversion to miles
    console.log(`📍 Found nearest station ID: ${nearestSiteId} (~${distance.toFixed(1)} miles away)`);

    return nearestSiteId;

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('⚠️ USGS API request timed out after 10 seconds');
    } else {
      console.error('❌ Error finding nearest USGS station ID:', error);
    }
    return null;
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * STEP 2.1: Fetch OpenWeatherMap Current Weather Data
 * Extracts all high-value weather data fields for fishing reports
 */
async function fetchOpenWeatherData(
  lat: number,
  lng: number,
  apiKey?: string
): Promise<{
  airTemp: number;
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
}> {
  try {
    let data: any;

    // If no API key provided, use backend API
    if (!apiKey) {
      data = await apiRequest<any>(API_ENDPOINTS.weather.current(lat, lng));
    } else {
      // Direct OpenWeatherMap API call
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
      
      console.log('🌤️ Fetching OpenWeatherMap data...');

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
      }

      data = await response.json();
    }

    // Extract all weather data fields from OpenWeatherMap response
    // Handle both direct OWM API response and backend API response formats
    
    // 1. Air Temperature (°C)
    const airTemp = data.main?.temp ?? data.temperature ?? null;
    
    // 2. Wind Speed (m/s from OWM, convert to mph)
    const windSpeedMs = data.wind?.speed ?? null;
    const windSpeedMph = windSpeedMs !== null ? windSpeedMs * 2.237 : null; // m/s to mph
    
    // 3. Wind Gusts (m/s from OWM, convert to mph)
    const windGustMs = data.wind?.gust ?? null;
    const windGustMph = windGustMs !== null ? windGustMs * 2.237 : null; // m/s to mph
    
    // 4. Wind Direction (degrees, 0-360)
    const windDirectionDeg = data.wind?.deg ?? null;
    
    // 5. Barometric Pressure (hPa)
    const barometricPressureHpa = data.main?.pressure ?? null;
    
    // 6. Cloud Cover (percentage)
    const cloudCoverPercent = data.clouds?.all ?? null;
    
    // 7. Weather Description
    const weatherDescription = data.weather?.[0]?.description ?? 
                              data.weather_description ?? 
                              data.weather?.[0]?.main ??
                              data.weather_condition ?? 
                              'Unknown';
    
    // 8. Weather Icon
    const weatherIcon = data.weather?.[0]?.icon ?? 
                       getWeatherIconCode(data.weather?.[0]?.main ?? data.weather_condition ?? '');
    
    // 9. Precipitation - Rain (mm, 1h)
    const precipitationRainMm = data.rain?.['1h'] ?? 
                                data.rain?.oneHour ?? 
                                data.precipitation_rain ?? 
                                null;
    
    // 10. Precipitation - Snow (mm, 1h)
    const precipitationSnowMm = data.snow?.['1h'] ?? 
                               data.snow?.oneHour ?? 
                               data.precipitation_snow ?? 
                               null;
    
    // 11. Sunrise (Unix timestamp)
    const sunrise = data.sys?.sunrise ?? null;
    
    // 12. Sunset (Unix timestamp)
    const sunset = data.sys?.sunset ?? null;

    return {
      airTemp: airTemp !== null ? parseFloat(airTemp.toFixed(1)) : 0,
      windSpeedMph: windSpeedMph !== null ? parseFloat(windSpeedMph.toFixed(1)) : null,
      windGustMph: windGustMph !== null ? parseFloat(windGustMph.toFixed(1)) : null,
      windDirectionDeg: windDirectionDeg !== null ? parseInt(windDirectionDeg) : null,
      barometricPressureHpa: barometricPressureHpa !== null ? parseFloat(barometricPressureHpa.toFixed(1)) : null,
      cloudCoverPercent: cloudCoverPercent !== null ? parseInt(cloudCoverPercent) : null,
      weatherDescription,
      weatherIcon,
      precipitationRainMm: precipitationRainMm !== null ? parseFloat(precipitationRainMm.toFixed(2)) : null,
      precipitationSnowMm: precipitationSnowMm !== null ? parseFloat(precipitationSnowMm.toFixed(2)) : null,
      sunrise,
      sunset,
    };

  } catch (error) {
    console.error('❌ Error fetching weather data:', error);
    throw error;
  }
}

/**
 * STEP 2.2: Fetch USGS Instantaneous Values (IV) Data
 * Fetches real-time stream flow and water temperature for a specific station
 * CRITICAL: Uses site parameter, NOT bBox, siteType, or other Site Service parameters
 */
async function fetchUSGSInstantaneousValues(
  siteNo: string
): Promise<{
  flowRate: number | null;
  waterTemperature: number | null;
} | null> {
  try {
    // Construct the USGS IV URL with site parameter only
    // DO NOT include bBox, siteType, or other Site Service parameters
    const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${siteNo}&parameterCd=00060,00010`;
    
    console.log(`🌊 Fetching USGS IV data for station: ${siteNo}`);
    console.log(`🔗 IV URL: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`USGS IV API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 3.2. Process the USGS IV data - handle complex JSON structure
    if (!data?.value?.timeSeries || data.value.timeSeries.length === 0) {
      console.warn('⚠️ No time series data in USGS IV response');
      return null;
    }

    let flowRate: number | null = null;
    let waterTemperature: number | null = null;

    // Process each time series
    for (const timeSeries of data.value.timeSeries as USGSIVTimeSeries[]) {
      try {
        const variableCode = timeSeries.variable?.variableCode?.[0]?.value;
        const values = timeSeries.values?.[0]?.value;

        if (!values || values.length === 0) {
          continue;
        }

        // Get the most recent (current) value
        const currentValue = values[values.length - 1];
        const numericValue = parseFloat(currentValue.value);

        if (isNaN(numericValue)) {
          continue;
        }

        // Parameter code 00060 = Stream flow (cubic feet per second)
        if (variableCode === '00060') {
          flowRate = numericValue;
        }
        // Parameter code 00010 = Water temperature (°C)
        else if (variableCode === '00010') {
          waterTemperature = numericValue;
        }
      } catch (parseError) {
        console.warn('Error parsing USGS IV time series:', parseError);
      }
    }

    console.log(`✅ USGS IV data parsed - Flow: ${flowRate} cfs, Temp: ${waterTemperature}°C`);

    return {
      flowRate,
      waterTemperature,
    };

  } catch (error) {
    console.error('❌ Error fetching USGS IV data:', error);
    return null;
  }
}

/**
 * Convert weather condition to icon code
 */
function getWeatherIconCode(condition: string): string {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('clear') || lowerCondition.includes('sun')) return '01d';
  if (lowerCondition.includes('cloud')) return '03d';
  if (lowerCondition.includes('rain')) return '10d';
  if (lowerCondition.includes('storm')) return '11d';
  if (lowerCondition.includes('snow')) return '13d';
  if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return '50d';
  return '02d'; // Default to partly cloudy
}

