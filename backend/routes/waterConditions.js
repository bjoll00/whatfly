/**
 * Water Conditions API Routes
 * 
 * Securely proxies requests to USGS Water Services API
 * No API key required for USGS (public API)
 */

import express from 'express';
// Using built-in fetch (Node.js 18+) - no need for node-fetch

const router = express.Router();

/**
 * GET /api/water-conditions/current
 * 
 * Get current water conditions for a specific location
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

    console.log(`🌊 Fetching water conditions for: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

    // Find nearby USGS stations
    const nearbyStations = await findNearbyUSGSStations({ latitude, longitude });

    if (!nearbyStations || nearbyStations.length === 0) {
      console.warn(`⚠️ No USGS stations found for coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      return res.json({
        flowRate: null,
        waterTemperature: null,
        gaugeHeight: null,
        stationName: null,
        stationId: null,
        dataSource: null,
        dataQuality: 'UNKNOWN',
        message: 'No nearby USGS stations found'
      });
    }

    // Use the closest station
    const closestStation = nearbyStations[0];
    console.log(`🎯 Using closest station: ${closestStation.station_nm} (${closestStation.distance.toFixed(1)} miles away)`);

    // Fetch data from USGS
    const waterData = await fetchUSGSData(closestStation.site_code);

    if (!waterData) {
      return res.json({
        flowRate: null,
        waterTemperature: null,
        gaugeHeight: null,
        stationName: closestStation.station_nm,
        stationId: closestStation.site_code,
        dataSource: 'USGS',
        dataQuality: 'POOR',
        message: 'Failed to fetch data from station'
      });
    }

    const result = {
      ...waterData,
      stationId: closestStation.site_code,
      stationName: closestStation.station_nm,
      dataSource: 'USGS',
      lastUpdated: new Date().toISOString(),
      dataQuality: 'GOOD',
      isActive: true
    };

    console.log('✅ Water conditions fetched:', {
      flowRate: result.flowRate,
      waterTemperature: result.waterTemperature,
      stationName: result.stationName
    });

    res.json(result);

  } catch (error) {
    console.error('❌ Error in water conditions route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch water conditions'
    });
  }
});

/**
 * Helper function to find nearby USGS stations
 */
async function findNearbyUSGSStations(coordinates) {
  const USGS_BASE_URL = 'https://waterservices.usgs.gov/nwis/iv/';
  // Try larger search radii to find stations (in degrees, roughly 0.1 degree = ~6-7 miles)
  const radiusSizes = [0.5, 1.0, 2.0]; // ~30, 60, 120 miles

  for (const radius of radiusSizes) {
    try {
      const minLon = coordinates.longitude - radius;
      const minLat = coordinates.latitude - radius;
      const maxLon = coordinates.longitude + radius;
      const maxLat = coordinates.latitude + radius;
      const bBox = `${minLon},${minLat},${maxLon},${maxLat}`;

      const url = `${USGS_BASE_URL}?format=json&bBox=${bBox}&parameterCd=00060,00065,00010&siteStatus=active&hasDataTypeCd=iv`;
      
      console.log(`🔍 Searching for USGS stations in bbox: ${bBox} (radius: ${radius} degrees)`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`⚠️ USGS API returned ${response.status} for radius ${radius}`);
        continue;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`⚠️ USGS API returned non-JSON content for radius ${radius}`);
        continue;
      }

      const data = await response.json();

      // Check if we got any data
      if (!data.value) {
        console.warn(`⚠️ USGS API returned empty value for radius ${radius}`);
        continue;
      }

      if (data.value?.timeSeries && data.value.timeSeries.length > 0) {
        console.log(`📊 USGS API returned ${data.value.timeSeries.length} time series for radius ${radius}`);
        const sites = new Map();

        data.value.timeSeries.forEach((series) => {
          try {
            const siteCode = series.sourceInfo?.siteCode?.[0]?.value;
            const siteName = series.sourceInfo?.siteName;
            const geoLocation = series.sourceInfo?.geoLocation?.geogLocation;

            if (!siteCode || !siteName || !geoLocation) {
              console.warn(`⚠️ Missing site data: code=${siteCode}, name=${siteName}, geo=${!!geoLocation}`);
              return;
            }

            const siteCoords = {
              latitude: parseFloat(geoLocation.latitude),
              longitude: parseFloat(geoLocation.longitude)
            };

            if (isNaN(siteCoords.latitude) || isNaN(siteCoords.longitude)) {
              console.warn(`⚠️ Invalid coordinates for site ${siteCode}`);
              return;
            }

            if (!sites.has(siteCode)) {
              const distance = calculateDistance(coordinates, siteCoords);

              // Accept stations within reasonable distance (50 miles max)
              if (distance <= 50) {
                sites.set(siteCode, {
                  site_code: siteCode,
                  station_nm: siteName,
                  latitude: siteCoords.latitude,
                  longitude: siteCoords.longitude,
                  distance: distance
                });
                console.log(`✅ Found station: ${siteName} (${siteCode}) - ${distance.toFixed(1)} miles away`);
              } else {
                console.log(`⚠️ Station ${siteCode} too far: ${distance.toFixed(1)} miles (limit: 50)`);
              }
            }
          } catch (parseError) {
            console.warn('Error parsing USGS site data:', parseError);
          }
        });

        if (sites.size > 0) {
          console.log(`✅ Found ${sites.size} USGS station(s) within 50 miles for radius ${radius}`);
          return Array.from(sites.values())
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);
        } else {
          console.warn(`⚠️ No stations within 50 miles for radius ${radius}`);
        }
      } else {
        console.warn(`⚠️ USGS API returned no time series for radius ${radius}`);
      }
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.warn(`USGS API timeout, trying larger radius...`);
      }
      continue;
    }
  }

  return [];
}

/**
 * Helper function to calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(coord1, coord2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.latitude * Math.PI / 180) *
    Math.cos(coord2.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Helper function to fetch USGS data for a specific station
 */
async function fetchUSGSData(siteCode) {
  try {
    const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${siteCode}&parameterCd=00060,00065,00010&siteStatus=all`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.value?.timeSeries || data.value.timeSeries.length === 0) {
      return null;
    }

    let flowRate = null;
    let gaugeHeight = null;
    let waterTemperature = null;

    // Extract data from time series
    data.value.timeSeries.forEach((series) => {
      const parameterCode = series.variable?.variableCode?.[0]?.value;
      const values = series.values?.[0]?.value;

      if (!values || values.length === 0) return;

      const latestValue = values[values.length - 1];
      const value = parseFloat(latestValue.value);

      if (isNaN(value)) return;

      switch (parameterCode) {
        case '00060': // Streamflow (cfs)
          flowRate = value;
          break;
        case '00065': // Gauge height (feet)
          gaugeHeight = value;
          break;
        case '00010': // Water temperature (Celsius)
          waterTemperature = (value * 9 / 5) + 32; // Convert to Fahrenheit
          break;
      }
    });

    return {
      flowRate,
      gaugeHeight,
      waterTemperature,
      turbidity: null,
      dissolvedOxygen: null,
      pH: null,
      conductivity: null
    };

  } catch (error) {
    console.error('Error fetching USGS data:', error);
    return null;
  }
}

export { router as waterConditionsRouter };

