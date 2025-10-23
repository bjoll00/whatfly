import { Coordinates } from './types';

  /**
   * Water conditions data structure
   */
export interface WaterConditions {
  // Basic water info
  flowRate?: number; // cubic feet per second (cfs)
  waterLevel?: number; // feet above sea level
  waterTemperature?: number; // Fahrenheit
  gaugeHeight?: number; // feet
  
  // Water quality
  turbidity?: number; // NTU (Nephelometric Turbidity Units)
  dissolvedOxygen?: number; // mg/L
  pH?: number;
  conductivity?: number; // µS/cm
  
  // Metadata
  stationId?: string;
  stationName?: string;
  lastUpdated?: string;
  dataSource?: 'USGS' | 'NOAA' | 'CUSTOM' | 'UTAH_DATABASE';
  
  // Status indicators
  isActive?: boolean;
  dataQuality?: 'GOOD' | 'FAIR' | 'POOR' | 'UNKNOWN';
}

/**
 * Service for fetching real-time water conditions
 */
export class WaterConditionsService {
  private static readonly USGS_BASE_URL = 'https://waterservices.usgs.gov/nwis/iv/';
  private static readonly NOAH_BASE_URL = 'https://water.weather.gov/ahps2/hydrograph.php';
  
  /**
   * Get water conditions for a specific location
   */
  static async getWaterConditions(coordinates: Coordinates): Promise<WaterConditions | null> {
    try {
      console.log('🌊 Fetching water conditions for:', coordinates);
      
      // First, try to find nearby USGS stations
      const nearbyStations = await this.findNearbyUSGSStations(coordinates);
      
      if (nearbyStations.length > 0) {
        console.log(`📍 Found ${nearbyStations.length} nearby USGS stations`);
        
        // Use the closest station
        const closestStation = nearbyStations[0];
        console.log(`🎯 Using closest station: ${closestStation.station_nm} (${closestStation.distance.toFixed(1)} miles away)`);
        
        const waterData = await this.fetchUSGSData(closestStation.site_code);
        
        if (waterData) {
          console.log('✅ Successfully fetched real-time water data:', waterData);
          return {
            ...waterData,
            stationId: closestStation.site_code,
            stationName: closestStation.station_nm,
            dataSource: 'USGS',
            lastUpdated: new Date().toISOString(),
          };
        } else {
          console.log('⚠️ Failed to fetch data from closest station, using fallback');
        }
      } else {
        console.log('📍 No nearby USGS stations found, using estimated conditions');
      }
      
      // Fallback to estimated conditions based on location and weather
      const estimatedConditions = await this.getEstimatedWaterConditions(coordinates);
      console.log('🧠 Using estimated water conditions:', estimatedConditions);
      
      return estimatedConditions;
      
    } catch (error) {
      console.error('❌ Error fetching water conditions:', error);
      return null;
    }
  }
  
  /**
   * Find nearby USGS water monitoring stations
   */
  private static async findNearbyUSGSStations(coordinates: Coordinates): Promise<any[]> {
    try {
      // Try multiple radius sizes, starting small
      const radiusSizes = [0.2, 0.4, 0.8]; // ~12, 25, 50 miles
      
      for (const radius of radiusSizes) {
        try {
          console.log(`🔍 Searching for USGS stations within ${Math.round(radius * 69)} miles...`);
          
          // USGS site query - find sites within radius
          // Correct format: bBox=minLon,minLat,maxLon,maxLat
          const minLon = coordinates.longitude - radius;
          const minLat = coordinates.latitude - radius;
          const maxLon = coordinates.longitude + radius;
          const maxLat = coordinates.latitude + radius;
          const bBox = `${minLon},${minLat},${maxLon},${maxLat}`;
          
          // Use correct parameter codes for streamflow, stage height, and water temperature
          const url = `${this.USGS_BASE_URL}?format=json&bBox=${bBox}&parameterCd=00060,00065,00010&siteStatus=active&hasDataTypeCd=iv`;
          
          console.log('USGS API URL:', url);
          
          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
          
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            console.warn(`USGS API returned status ${response.status}, trying larger radius...`);
            continue;
          }
          
          // Check if response is HTML (error page) instead of JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.warn('USGS API returned non-JSON response, trying larger radius...');
            continue;
          }
          
          const data = await response.json();
          
          if (data.value?.timeSeries && data.value.timeSeries.length > 0) {
            console.log(`✅ Found ${data.value.timeSeries.length} USGS time series`);
            
            // Group by site and calculate distances
            const sites = new Map();
            
            data.value.timeSeries.forEach((series: any) => {
              try {
                const siteCode = series.sourceInfo?.siteCode?.[0]?.value;
                const siteName = series.sourceInfo?.siteName;
                const geoLocation = series.sourceInfo?.geoLocation?.geogLocation;
                
                if (!siteCode || !siteName || !geoLocation) {
                  return; // Skip invalid entries
                }
                
                const siteCoords = {
                  latitude: parseFloat(geoLocation.latitude),
                  longitude: parseFloat(geoLocation.longitude)
                };
                
                // Validate coordinates
                if (isNaN(siteCoords.latitude) || isNaN(siteCoords.longitude)) {
                  return;
                }
                
                if (!sites.has(siteCode)) {
                  const distance = this.calculateDistance(coordinates, siteCoords);
                  
                  // Only include sites within reasonable distance
                  if (distance <= radius * 100) { // Convert radius to miles
                    sites.set(siteCode, {
                      site_code: siteCode,
                      station_nm: siteName,
                      latitude: siteCoords.latitude,
                      longitude: siteCoords.longitude,
                      distance: distance
                    });
                  }
                }
              } catch (parseError) {
                console.warn('Error parsing USGS site data:', parseError);
              }
            });
            
            if (sites.size > 0) {
              // Sort by distance and return top 5
              const sortedSites = Array.from(sites.values())
                .sort((a: any, b: any) => a.distance - b.distance)
                .slice(0, 5);
                
              console.log(`📍 Found ${sortedSites.length} nearby USGS stations:`, sortedSites.map(s => `${s.station_nm} (${s.distance.toFixed(1)} mi)`));
              return sortedSites;
            } else {
              console.log(`No stations within ${Math.round(radius * 69)} miles, trying larger radius...`);
            }
          } else {
            console.log(`No time series data within ${Math.round(radius * 69)} miles, trying larger radius...`);
          }
        } catch (fetchError: any) {
          if (fetchError.name === 'AbortError') {
            console.warn(`USGS API timeout after 8 seconds, trying larger radius...`);
          } else {
            console.warn(`Error with radius ${radius}:`, fetchError.message);
          }
          continue;
        }
      }
      
      console.log('❌ No USGS stations found after trying all radius sizes');
      return [];
      
    } catch (error) {
      console.error('❌ Error finding nearby USGS stations:', error);
      return [];
    }
  }
  
  /**
   * Fetch actual water data from USGS
   */
  public static async fetchUSGSData(siteCode: string): Promise<Partial<WaterConditions> | null> {
    try {
      // Get current values for flow, stage, and temperature
      // Parameter codes: 00060=Discharge, 00065=Gage height, 00010=Temperature
      const url = `${this.USGS_BASE_URL}?format=json&sites=${siteCode}&parameterCd=00060,00065,00010&siteStatus=active&hasDataTypeCd=iv`;
      
      console.log('Fetching USGS data from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`USGS API error: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      
      if (!data.value?.timeSeries) {
        return null;
      }
      
      const conditions: Partial<WaterConditions> = {
        isActive: true,
        dataQuality: 'GOOD'
      };
      
      // Parse the time series data
      data.value.timeSeries.forEach((series: any) => {
        const parameterCode = series.variable.variableCode[0].value;
        const values = series.values[0]?.value;
        
        if (values && values.length > 0) {
          const latestValue = values[values.length - 1];
          const value = parseFloat(latestValue.value);
          
          switch (parameterCode) {
            case '00060': // Streamflow
              conditions.flowRate = value;
              break;
            case '00065': // Gage height
              conditions.gaugeHeight = value;
              break;
            case '00010': // Temperature
              conditions.waterTemperature = value;
              break;
          }
        }
      });
      
      return conditions;
      
    } catch (error) {
      console.error('Error fetching USGS data:', error);
      return null;
    }
  }
  
  /**
   * Get comprehensive water conditions with enhanced data
   */
  public static async getComprehensiveWaterConditions(coordinates: Coordinates): Promise<{
    water_conditions: WaterConditions;
    enhanced_data: {
      historical_average?: {
        flowRate?: number;
        waterTemperature?: number;
        gaugeHeight?: number;
      };
      seasonal_trends?: {
        flow_trend: 'increasing' | 'decreasing' | 'stable';
        temperature_trend: 'warming' | 'cooling' | 'stable';
      };
      water_quality_indicators?: {
        clarity_rating: 'excellent' | 'good' | 'fair' | 'poor';
        oxygen_level: 'high' | 'moderate' | 'low';
        ph_level: 'optimal' | 'acceptable' | 'concerning';
      };
    };
  }> {
    try {
      console.log('🌊 Fetching comprehensive water conditions for:', coordinates);
      
      // Get base water conditions
      const baseConditions = await this.getWaterConditions(coordinates);
      
      // Enhance with additional data
      const enhancedData = {
        historical_average: await this.getHistoricalAverage(coordinates),
        seasonal_trends: await this.getSeasonalTrends(coordinates),
        water_quality_indicators: this.calculateWaterQualityIndicators(baseConditions)
      };
      
      return {
        water_conditions: baseConditions || this.getDefaultWaterConditions(coordinates),
        enhanced_data: enhancedData
      };
      
    } catch (error) {
      console.error('❌ Error fetching comprehensive water conditions:', error);
      return {
        water_conditions: this.getDefaultWaterConditions(coordinates),
        enhanced_data: {
          water_quality_indicators: {
            clarity_rating: 'fair',
            oxygen_level: 'moderate',
            ph_level: 'acceptable'
          }
        }
      };
    }
  }

  /**
   * Get historical average water conditions
   */
  private static async getHistoricalAverage(coordinates: Coordinates): Promise<{
    flowRate?: number;
    waterTemperature?: number;
    gaugeHeight?: number;
  }> {
    // In a real implementation, this would fetch historical data from USGS
    // For now, return estimated averages based on location
    return {
      flowRate: coordinates.latitude > 40 ? 150 : 100, // Higher flows in northern Utah
      waterTemperature: coordinates.latitude > 40 ? 55 : 65, // Cooler in northern Utah
      gaugeHeight: 5.5 // Average gauge height
    };
  }

  /**
   * Get seasonal trends for water conditions
   */
  private static async getSeasonalTrends(coordinates: Coordinates): Promise<{
    flow_trend: 'increasing' | 'decreasing' | 'stable';
    temperature_trend: 'warming' | 'cooling' | 'stable';
  }> {
    const month = new Date().getMonth() + 1;
    
    // Determine trends based on season
    let flowTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let temperatureTrend: 'warming' | 'cooling' | 'stable' = 'stable';
    
    if (month >= 3 && month <= 6) {
      // Spring - increasing flows, warming temperatures
      flowTrend = 'increasing';
      temperatureTrend = 'warming';
    } else if (month >= 7 && month <= 9) {
      // Summer - decreasing flows, stable temperatures
      flowTrend = 'decreasing';
      temperatureTrend = 'stable';
    } else if (month >= 10 && month <= 12) {
      // Fall - stable flows, cooling temperatures
      flowTrend = 'stable';
      temperatureTrend = 'cooling';
    } else {
      // Winter - stable flows, stable temperatures
      flowTrend = 'stable';
      temperatureTrend = 'stable';
    }
    
    return { flow_trend: flowTrend, temperature_trend: temperatureTrend };
  }

  /**
   * Calculate water quality indicators
   */
  private static calculateWaterQualityIndicators(conditions: WaterConditions | null): {
    clarity_rating: 'excellent' | 'good' | 'fair' | 'poor';
    oxygen_level: 'high' | 'moderate' | 'low';
    ph_level: 'optimal' | 'acceptable' | 'concerning';
  } {
    if (!conditions) {
      return {
        clarity_rating: 'fair',
        oxygen_level: 'moderate',
        ph_level: 'acceptable'
      };
    }

    // Clarity rating based on turbidity
    let clarityRating: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';
    if (conditions.turbidity !== undefined) {
      if (conditions.turbidity < 5) clarityRating = 'excellent';
      else if (conditions.turbidity < 15) clarityRating = 'good';
      else if (conditions.turbidity < 30) clarityRating = 'fair';
      else clarityRating = 'poor';
    }

    // Oxygen level
    let oxygenLevel: 'high' | 'moderate' | 'low' = 'moderate';
    if (conditions.dissolvedOxygen !== undefined) {
      if (conditions.dissolvedOxygen > 8) oxygenLevel = 'high';
      else if (conditions.dissolvedOxygen > 5) oxygenLevel = 'moderate';
      else oxygenLevel = 'low';
    }

    // pH level
    let phLevel: 'optimal' | 'acceptable' | 'concerning' = 'acceptable';
    if (conditions.pH !== undefined) {
      if (conditions.pH >= 6.5 && conditions.pH <= 8.5) phLevel = 'optimal';
      else if (conditions.pH >= 6.0 && conditions.pH <= 9.0) phLevel = 'acceptable';
      else phLevel = 'concerning';
    }

    return {
      clarity_rating: clarityRating,
      oxygen_level: oxygenLevel,
      ph_level: phLevel
    };
  }

  /**
   * Get default water conditions when no data is available
   */
  public static getDefaultWaterConditions(coordinates: Coordinates): WaterConditions {
    return {
      flowRate: 100,
      waterLevel: 5.0,
      waterTemperature: 60,
      gaugeHeight: 5.0,
      turbidity: 10,
      dissolvedOxygen: 7.5,
      pH: 7.2,
      conductivity: 200,
      stationId: 'DEFAULT',
      stationName: 'Estimated Conditions',
      lastUpdated: new Date().toISOString(),
      dataSource: 'CUSTOM',
      dataQuality: 'FAIR',
      isActive: true
    };
  }

  /**
   * Get estimated water conditions when no real data is available
   */
  private static async getEstimatedWaterConditions(coordinates: Coordinates): Promise<WaterConditions> {
    // Check if this is a known Utah fishing location
    const utahLocation = this.getKnownUtahLocation(coordinates);
    
    if (utahLocation) {
      console.log(`🎣 Found known Utah location: ${utahLocation.name}`);
      return {
        flowRate: utahLocation.flowRate,
        waterLevel: utahLocation.waterLevel,
        waterTemperature: utahLocation.waterTemperature,
        gaugeHeight: utahLocation.gaugeHeight,
        stationName: utahLocation.name,
        dataSource: 'UTAH_DATABASE',
        lastUpdated: new Date().toISOString(),
        isActive: true,
        dataQuality: 'GOOD'
      };
    }
    
    // Default estimation for unknown locations
    return {
      flowRate: this.estimateFlowRate(coordinates),
      waterLevel: this.estimateWaterLevel(coordinates),
      waterTemperature: this.estimateWaterTemperature(coordinates),
      gaugeHeight: this.estimateGaugeHeight(coordinates),
      dataSource: 'CUSTOM',
      lastUpdated: new Date().toISOString(),
      isActive: true,
      dataQuality: 'FAIR'
    };
  }
  
  /**
   * Estimate flow rate based on location and season
   */
  private static estimateFlowRate(coordinates: Coordinates): number {
    const month = new Date().getMonth();
    const season = month >= 2 && month <= 4 ? 'spring' : 
                   month >= 5 && month <= 7 ? 'summer' : 
                   month >= 8 && month <= 10 ? 'fall' : 'winter';
    
    // Estimate elevation from latitude (northern Utah is generally higher)
    const estimatedElevation = 4000 + (coordinates.latitude - 37) * 600 + Math.abs(coordinates.longitude + 111) * 200;
    
    // Higher elevation = different flow patterns
    const elevationFactor = estimatedElevation > 7000 ? 0.6 : estimatedElevation > 5500 ? 0.8 : 1.0;
    
    // Base flow rates by season (cfs)
    const baseFlows = {
      spring: 150, // Higher in spring due to snowmelt
      summer: 80,  // Lower in summer
      fall: 100,   // Moderate in fall
      winter: 60   // Lowest in winter
    };
    
    // Create unique variation based on precise coordinates
    // Use a hash-like function to ensure same location always gets same value
    const coordHash = Math.abs(Math.sin(coordinates.latitude * 12.9898 + coordinates.longitude * 78.233) * 43758.5453);
    const variation = (coordHash % 1) * 80 - 40; // Range: -40 to +40
    
    // Longitude affects flow (western Utah is drier)
    const longitudeFactor = coordinates.longitude < -112 ? 0.7 : coordinates.longitude < -111 ? 0.9 : 1.0;
    
    const estimatedFlow = baseFlows[season] * elevationFactor * longitudeFactor + variation;
    
    return Math.max(10, Math.round(estimatedFlow)); // Minimum 10 cfs
  }
  
  /**
   * Estimate water level based on location
   */
  private static estimateWaterLevel(coordinates: Coordinates): number {
    // Estimate elevation more accurately using topographic relationships
    // Utah elevation ranges from ~4000 ft (Great Salt Lake) to ~13,000 ft (peaks)
    
    // Base elevation from latitude (north-south gradient)
    const latElevation = 4000 + (coordinates.latitude - 37) * 800;
    
    // Adjust for longitude (east-west gradient - higher elevations in eastern Utah)
    const lonElevation = Math.abs(coordinates.longitude + 109) * 150;
    
    // Create location-specific variation
    const coordHash = Math.abs(Math.sin(coordinates.latitude * 43.12 + coordinates.longitude * 92.45) * 23847.2343);
    const localVariation = (coordHash % 1) * 1000 - 500; // Range: -500 to +500
    
    const estimatedElevation = latElevation + lonElevation + localVariation;
    
    return Math.max(4000, Math.min(10000, Math.round(estimatedElevation))); // Clamp between 4000-10000 ft
  }
  
  /**
   * Estimate water temperature based on location and season
   */
  private static estimateWaterTemperature(coordinates: Coordinates): number {
    const month = new Date().getMonth();
    const season = month >= 2 && month <= 4 ? 'spring' : 
                   month >= 5 && month <= 7 ? 'summer' : 
                   month >= 8 && month <= 10 ? 'fall' : 'winter';
    
    // Base temperatures by season (Fahrenheit)
    const baseTemps = {
      spring: 45,
      summer: 65,
      fall: 55,
      winter: 35
    };
    
    // Adjust based on latitude (northern locations are colder)
    const latitudeAdjustment = (40 - coordinates.latitude) * 1.5;
    
    // Estimate elevation effect (higher = colder, roughly 3.5°F per 1000 ft)
    const estimatedElevation = 4000 + (coordinates.latitude - 37) * 800 + Math.abs(coordinates.longitude + 111) * 200;
    const elevationAdjustment = -((estimatedElevation - 5000) / 1000) * 3.5;
    
    // Create location-specific variation
    const coordHash = Math.abs(Math.sin(coordinates.latitude * 23.45 + coordinates.longitude * 67.89) * 98765.4321);
    const localVariation = (coordHash % 1) * 6 - 3; // Range: -3 to +3
    
    // Tailwater vs. freestone consideration (western coordinates might be tailwaters)
    const waterSourceFactor = (coordinates.longitude < -109.5 && coordinates.longitude > -109.7) ? 5 : 0; // Warmer tailwaters
    
    const estimatedTemp = baseTemps[season] + latitudeAdjustment + elevationAdjustment + localVariation + waterSourceFactor;
    
    return Math.max(28, Math.min(75, Math.round(estimatedTemp))); // Clamp between 28-75°F
  }
  
  /**
   * Estimate gauge height
   */
  private static estimateGaugeHeight(coordinates: Coordinates): number {
    // Flow rate affects gauge height
    const estimatedFlow = this.estimateFlowRate(coordinates);
    
    // Base gauge height from flow (logarithmic relationship)
    const baseGauge = Math.log(estimatedFlow + 10) / Math.log(10); // Range: ~1 to ~3
    
    // Create location-specific variation
    const coordHash = Math.abs(Math.sin(coordinates.latitude * 56.78 + coordinates.longitude * 34.12) * 65432.9876);
    const localVariation = (coordHash % 1) * 1.5 - 0.75; // Range: -0.75 to +0.75
    
    const estimatedGauge = baseGauge + localVariation;
    
    return Math.max(0.5, Math.min(8.0, Math.round(estimatedGauge * 10) / 10)); // Clamp between 0.5-8.0 ft
  }
  
  /**
   * Calculate distance between two coordinates (in miles)
   */
  private static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(coord1.latitude)) * Math.cos(this.toRadians(coord2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }
  
  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Check if coordinates match a known Utah fishing location
   */
  private static getKnownUtahLocation(coordinates: Coordinates): any | null {
    const utahLocations = [
      // Provo River System
      {
        name: 'Provo River - Above Jordanelle',
        latitude: 40.6447,
        longitude: -111.1896,
        flowRate: 85, 
        waterLevel: 7200, 
        waterTemperature: 36,
        gaugeHeight: 1.5,
        radius: 0.04,
        usgsStationId: '10154200'
      },
      {
        name: 'Provo River - Middle Provo',
        latitude: 40.5378,
        longitude: -111.3672,
        flowRate: 125,
        waterLevel: 5600,
        waterTemperature: 38,
        gaugeHeight: 2.1,
        radius: 0.05,
        usgsStationId: '10155200'
      },
      {
        name: 'Provo River - Lower Provo',
        latitude: 40.2889,
        longitude: -111.6733,
        flowRate: 95,
        waterLevel: 4480,
        waterTemperature: 40,
        gaugeHeight: 1.8,
        radius: 0.05,
        usgsStationId: '10163000'
      },
      {
        name: 'Provo River - Heber Valley',
        latitude: 40.5156,
        longitude: -111.4125,
        flowRate: 110,
        waterLevel: 5580,
        waterTemperature: 37,
        gaugeHeight: 1.9,
        radius: 0.04
      },
      
      // Weber River System
      {
        name: 'Weber River - Oakley',
        latitude: 40.7136,
        longitude: -111.3003,
        flowRate: 65,
        waterLevel: 6500,
        waterTemperature: 35,
        gaugeHeight: 1.4,
        radius: 0.04,
        usgsStationId: '10128500'
      },
      {
        name: 'Weber River - Echo Canyon',
        latitude: 40.9697,
        longitude: -111.4267,
        flowRate: 180,
        waterLevel: 5480,
        waterTemperature: 36,
        gaugeHeight: 2.5,
        radius: 0.06,
        usgsStationId: '10130500'
      },
      {
        name: 'Weber River - Morgan',
        latitude: 41.0361,
        longitude: -111.6764,
        flowRate: 150,
        waterLevel: 4950,
        waterTemperature: 38,
        gaugeHeight: 2.2,
        radius: 0.05,
        usgsStationId: '10141000'
      },
      {
        name: 'Weber River - Plain City',
        latitude: 41.2983,
        longitude: -112.0861,
        flowRate: 120,
        waterLevel: 4300,
        waterTemperature: 42,
        gaugeHeight: 2.0,
        radius: 0.05
      },
      
      // Green River System
      {
        name: 'Green River - Flaming Gorge Dam',
        latitude: 40.9173,
        longitude: -109.4247,
        flowRate: 850,
        waterLevel: 6040,
        waterTemperature: 42,
        gaugeHeight: 3.8,
        radius: 0.08,
        usgsStationId: '09234500'
      },
      {
        name: 'Green River - Little Hole',
        latitude: 40.8839,
        longitude: -109.4919,
        flowRate: 820,
        waterLevel: 5980,
        waterTemperature: 44,
        gaugeHeight: 3.6,
        radius: 0.06,
        usgsStationId: '09234600'
      },
      {
        name: 'Green River - Browns Park',
        latitude: 40.7536,
        longitude: -109.5708,
        flowRate: 800,
        waterLevel: 5560,
        waterTemperature: 46,
        gaugeHeight: 3.5,
        radius: 0.1
      },
      {
        name: 'Green River - Jensen',
        latitude: 40.3658,
        longitude: -109.3478,
        flowRate: 750,
        waterLevel: 4750,
        waterTemperature: 48,
        gaugeHeight: 3.2,
        radius: 0.08,
        usgsStationId: '09261000'
      },
      
      // Logan River System
      {
        name: 'Logan River - Upper Logan',
        latitude: 41.8803,
        longitude: -111.5344,
        flowRate: 45,
        waterLevel: 5200,
        waterTemperature: 32,
        gaugeHeight: 1.2,
        radius: 0.04
      },
      {
        name: 'Logan River - Logan Canyon',
        latitude: 41.7739,
        longitude: -111.6808,
        flowRate: 55,
        waterLevel: 4850,
        waterTemperature: 34,
        gaugeHeight: 1.4,
        radius: 0.05,
        usgsStationId: '10109000'
      },
      {
        name: 'Logan River - Lower Logan',
        latitude: 41.7358,
        longitude: -111.8347,
        flowRate: 65,
        waterLevel: 4480,
        waterTemperature: 38,
        gaugeHeight: 1.6,
        radius: 0.04
      },
      
      // Bear River System
      {
        name: 'Bear River - Evanston Area',
        latitude: 41.2644,
        longitude: -110.9633,
        flowRate: 180,
        waterLevel: 6750,
        waterTemperature: 35,
        gaugeHeight: 2.4,
        radius: 0.06,
        usgsStationId: '10011500'
      },
      {
        name: 'Bear River - Woodruff',
        latitude: 41.5194,
        longitude: -111.2142,
        flowRate: 220,
        waterLevel: 6280,
        waterTemperature: 37,
        gaugeHeight: 2.8,
        radius: 0.06
      },
      {
        name: 'Bear River - Cutler Reservoir',
        latitude: 41.8206,
        longitude: -112.0217,
        flowRate: 0,
        waterLevel: 4408,
        waterTemperature: 40,
        gaugeHeight: 0,
        radius: 0.1
      },
      
      // Reservoirs - Northern Utah
      {
        name: 'Deer Creek Reservoir',
        latitude: 40.4258,
        longitude: -111.5358,
        flowRate: 0,
        waterLevel: 5417,
        waterTemperature: 35,
        gaugeHeight: 0,
        radius: 0.1
      },
      {
        name: 'Jordanelle Reservoir',
        latitude: 40.6269,
        longitude: -111.4103,
        flowRate: 0,
        waterLevel: 6175,
        waterTemperature: 33,
        gaugeHeight: 0,
        radius: 0.1
      },
      {
        name: 'Rockport Reservoir',
        latitude: 40.7075,
        longitude: -111.3586,
        flowRate: 0,
        waterLevel: 6040,
        waterTemperature: 34,
        gaugeHeight: 0,
        radius: 0.08
      },
      {
        name: 'Echo Reservoir',
        latitude: 40.9514,
        longitude: -111.4181,
        flowRate: 0,
        waterLevel: 5560,
        waterTemperature: 36,
        gaugeHeight: 0,
        radius: 0.08
      },
      {
        name: 'Pineview Reservoir',
        latitude: 41.2522,
        longitude: -111.8186,
        flowRate: 0,
        waterLevel: 4878,
        waterTemperature: 38,
        gaugeHeight: 0,
        radius: 0.09
      },
      {
        name: 'Causey Reservoir',
        latitude: 41.2928,
        longitude: -111.5856,
        flowRate: 0,
        waterLevel: 5700,
        waterTemperature: 34,
        gaugeHeight: 0,
        radius: 0.06
      },
      {
        name: 'Hyrum Reservoir',
        latitude: 41.6339,
        longitude: -111.8508,
        flowRate: 0,
        waterLevel: 4680,
        waterTemperature: 37,
        gaugeHeight: 0,
        radius: 0.07
      },
      
      // Reservoirs - Central Utah
      {
        name: 'Strawberry Reservoir',
        latitude: 40.1786,
        longitude: -111.1658,
        flowRate: 0,
        waterLevel: 7607,
        waterTemperature: 32,
        gaugeHeight: 0,
        radius: 0.15
      },
      {
        name: 'Currant Creek Reservoir',
        latitude: 40.2553,
        longitude: -111.0403,
        flowRate: 0,
        waterLevel: 8000,
        waterTemperature: 31,
        gaugeHeight: 0,
        radius: 0.06
      },
      {
        name: 'Scofield Reservoir',
        latitude: 39.7781,
        longitude: -111.1578,
        flowRate: 0,
        waterLevel: 7618,
        waterTemperature: 33,
        gaugeHeight: 0,
        radius: 0.09
      },
      {
        name: 'Huntington Reservoir',
        latitude: 39.3942,
        longitude: -110.9642,
        flowRate: 0,
        waterLevel: 8400,
        waterTemperature: 30,
        gaugeHeight: 0,
        radius: 0.07
      },
      {
        name: 'Electric Lake',
        latitude: 39.4928,
        longitude: -111.2364,
        flowRate: 0,
        waterLevel: 8700,
        waterTemperature: 29,
        gaugeHeight: 0,
        radius: 0.05
      },
      {
        name: 'Flaming Gorge Reservoir',
        latitude: 40.9239,
        longitude: -109.4736,
        flowRate: 0,
        waterLevel: 6040,
        waterTemperature: 35,
        gaugeHeight: 0,
        radius: 0.2
      },
      
      // Duchesne River System
      {
        name: 'Duchesne River - Upper',
        latitude: 40.5042,
        longitude: -110.5933,
        flowRate: 75,
        waterLevel: 7800,
        waterTemperature: 34,
        gaugeHeight: 1.6,
        radius: 0.05
      },
      {
        name: 'Duchesne River - Hanna',
        latitude: 40.4281,
        longitude: -110.8178,
        flowRate: 95,
        waterLevel: 6100,
        waterTemperature: 37,
        gaugeHeight: 1.9,
        radius: 0.05,
        usgsStationId: '09279000'
      },
      {
        name: 'Duchesne River - Lower',
        latitude: 40.1619,
        longitude: -110.3869,
        flowRate: 120,
        waterLevel: 4800,
        waterTemperature: 40,
        gaugeHeight: 2.2,
        radius: 0.06
      },
      
      // Beaver/Sevier System (Southern Utah)
      {
        name: 'Beaver River',
        latitude: 38.2775,
        longitude: -112.6411,
        flowRate: 25,
        waterLevel: 5800,
        waterTemperature: 40,
        gaugeHeight: 0.9,
        radius: 0.05
      },
      {
        name: 'Minersville Reservoir',
        latitude: 38.2192,
        longitude: -112.9139,
        flowRate: 0,
        waterLevel: 5550,
        waterTemperature: 38,
        gaugeHeight: 0,
        radius: 0.08
      },
      {
        name: 'Piute Reservoir',
        latitude: 38.3322,
        longitude: -112.1194,
        flowRate: 0,
        waterLevel: 6020,
        waterTemperature: 36,
        gaugeHeight: 0,
        radius: 0.08
      },
      {
        name: 'Otter Creek Reservoir',
        latitude: 38.1861,
        longitude: -111.9861,
        flowRate: 0,
        waterLevel: 6400,
        waterTemperature: 37,
        gaugeHeight: 0,
        radius: 0.09
      },
      {
        name: 'Sevier River - Upper',
        latitude: 38.6528,
        longitude: -112.1772,
        flowRate: 45,
        waterLevel: 6800,
        waterTemperature: 38,
        gaugeHeight: 1.1,
        radius: 0.05
      },
      
      // Fish Lake Area
      {
        name: 'Fish Lake',
        latitude: 38.5372,
        longitude: -111.7294,
        flowRate: 0,
        waterLevel: 8848,
        waterTemperature: 32,
        gaugeHeight: 0,
        radius: 0.08
      },
      {
        name: 'Johnson Valley Reservoir',
        latitude: 38.4906,
        longitude: -111.7894,
        flowRate: 0,
        waterLevel: 8400,
        waterTemperature: 33,
        gaugeHeight: 0,
        radius: 0.06
      },
      
      // Price River System
      {
        name: 'Price River',
        latitude: 39.5728,
        longitude: -110.8108,
        flowRate: 55,
        waterLevel: 5500,
        waterTemperature: 39,
        gaugeHeight: 1.3,
        radius: 0.06,
        usgsStationId: '09314500'
      },
      
      // Boulder Mountain Lakes
      {
        name: 'Boulder Mountain - Thousands Lake',
        latitude: 38.1442,
        longitude: -111.4861,
        flowRate: 0,
        waterLevel: 9500,
        waterTemperature: 30,
        gaugeHeight: 0,
        radius: 0.05
      },
      
      // Ogden River
      {
        name: 'Ogden River - Upper',
        latitude: 41.2639,
        longitude: -111.6631,
        flowRate: 35,
        waterLevel: 5200,
        waterTemperature: 36,
        gaugeHeight: 1.0,
        radius: 0.04
      },
      {
        name: 'Ogden River - Lower',
        latitude: 41.2231,
        longitude: -111.9736,
        flowRate: 45,
        waterLevel: 4300,
        waterTemperature: 40,
        gaugeHeight: 1.2,
        radius: 0.04,
        usgsStationId: '10141300'
      }
    ];
    
    // Check if coordinates are within any known location radius
    for (const location of utahLocations) {
      const distance = this.calculateDistance(coordinates, {
        latitude: location.latitude,
        longitude: location.longitude
      });
      
      if (distance <= (location.radius * 69)) { // Convert radius to miles (1 degree ≈ 69 miles)
        return location;
      }
    }
    
    return null;
  }
  
  /**
   * Get water condition summary for display
   */
  static getWaterConditionSummary(conditions: WaterConditions): string {
    if (!conditions) return 'No water data available';
    
    const parts = [];
    
    if (conditions.flowRate) {
      parts.push(`${conditions.flowRate} cfs flow`);
    }
    
    if (conditions.waterTemperature) {
      parts.push(`${conditions.waterTemperature}°F water`);
    }
    
    if (conditions.gaugeHeight) {
      parts.push(`${conditions.gaugeHeight}ft gauge`);
    }
    
    if (conditions.dataSource) {
      parts.push(`(${conditions.dataSource})`);
    }
    
    return parts.join(' • ') || 'Water conditions unknown';
  }
  
  /**
   * Get water condition rating for fly fishing
   */
  static getWaterConditionRating(conditions: WaterConditions): {
    rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    description: string;
    factors: string[];
  } {
    if (!conditions) {
      return {
        rating: 'FAIR',
        description: 'No water data available',
        factors: ['Limited data']
      };
    }
    
    const factors = [];
    let score = 50; // Base score
    
    // Evaluate flow rate
    if (conditions.flowRate) {
      if (conditions.flowRate >= 50 && conditions.flowRate <= 200) {
        score += 20;
        factors.push('Optimal flow rate');
      } else if (conditions.flowRate >= 25 && conditions.flowRate <= 300) {
        score += 10;
        factors.push('Good flow rate');
      } else if (conditions.flowRate < 25) {
        score -= 15;
        factors.push('Low flow rate');
      } else {
        score -= 10;
        factors.push('High flow rate');
      }
    }
    
    // Evaluate water temperature
    if (conditions.waterTemperature) {
      if (conditions.waterTemperature >= 45 && conditions.waterTemperature <= 65) {
        score += 15;
        factors.push('Good water temperature');
      } else if (conditions.waterTemperature >= 35 && conditions.waterTemperature <= 75) {
        score += 5;
        factors.push('Moderate water temperature');
      } else {
        score -= 10;
        factors.push('Extreme water temperature');
      }
    }
    
    // Evaluate data quality
    if (conditions.dataQuality === 'GOOD') {
      score += 10;
      factors.push('Reliable data');
    } else if (conditions.dataQuality === 'FAIR') {
      score += 5;
      factors.push('Estimated data');
    }
    
    // Determine rating
    let rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    let description: string;
    
    if (score >= 80) {
      rating = 'EXCELLENT';
      description = 'Excellent fishing conditions';
    } else if (score >= 65) {
      rating = 'GOOD';
      description = 'Good fishing conditions';
    } else if (score >= 45) {
      rating = 'FAIR';
      description = 'Fair fishing conditions';
    } else {
      rating = 'POOR';
      description = 'Challenging fishing conditions';
    }
    
    return { rating, description, factors };
  }
}
