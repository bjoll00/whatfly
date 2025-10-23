/**
 * Reverse Geocoding Service
 * Identifies nearby water bodies and provides location context
 */

import { Coordinates } from './types';

export interface WaterBodyInfo {
  name: string;
  type: 'river' | 'lake' | 'reservoir' | 'stream' | 'creek';
  distance: number; // miles
  description: string;
  region?: string;
}

export class ReverseGeocodingService {
  /**
   * Identify nearby water bodies based on coordinates
   */
  static async identifyNearbyWaterBodies(coordinates: Coordinates): Promise<WaterBodyInfo[]> {
    console.log(`🗺️ Identifying water bodies near ${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`);
    
    const nearbyWaterBodies: WaterBodyInfo[] = [];
    
    // Check all known Utah water bodies
    const waterBodies = this.getUtahWaterBodies();
    
    for (const waterBody of waterBodies) {
      const distance = this.calculateDistance(coordinates, waterBody.coordinates);
      
      // Include water bodies within 50 miles
      if (distance <= 50) {
        nearbyWaterBodies.push({
          name: waterBody.name,
          type: waterBody.type,
          distance: distance,
          description: waterBody.description,
          region: this.getRegion(waterBody.coordinates)
        });
      }
    }
    
    // Sort by distance
    nearbyWaterBodies.sort((a, b) => a.distance - b.distance);
    
    console.log(`✅ Found ${nearbyWaterBodies.length} water bodies within 50 miles`);
    return nearbyWaterBodies.slice(0, 10); // Return top 10
  }
  
  /**
   * Get the closest water body
   */
  static async getClosestWaterBody(coordinates: Coordinates): Promise<WaterBodyInfo | null> {
    const waterBodies = await this.identifyNearbyWaterBodies(coordinates);
    return waterBodies.length > 0 ? waterBodies[0] : null;
  }
  
  /**
   * Get region name based on coordinates
   */
  private static getRegion(coordinates: Coordinates): string {
    const lat = coordinates.latitude;
    const lon = coordinates.longitude;
    
    // Northern Utah
    if (lat > 41.5) return 'Northern Utah';
    if (lat > 41.0) return 'Cache Valley / Ogden Area';
    
    // Wasatch Front
    if (lat > 40.5 && lon > -112.0) return 'Wasatch Front';
    
    // Uinta Mountains / High Country
    if (lon < -110.5 && lat > 40.0) return 'Uinta Basin / High Country';
    
    // Eastern Utah
    if (lon > -110.0) return 'Eastern Utah';
    
    // Green River Area
    if (lon < -109.0) return 'Green River Area';
    
    // Central Utah
    if (lat > 39.0 && lat < 40.5) return 'Central Utah';
    
    // Southern Utah
    if (lat < 39.0) return 'Southern Utah';
    
    return 'Utah';
  }
  
  /**
   * Get all Utah water bodies database
   */
  private static getUtahWaterBodies() {
    return [
      // Provo River System
      { name: 'Provo River - Above Jordanelle', coordinates: { latitude: 40.6447, longitude: -111.1896 }, type: 'river' as const, description: 'Upper Provo River' },
      { name: 'Provo River - Middle Provo', coordinates: { latitude: 40.5378, longitude: -111.3672 }, type: 'river' as const, description: 'Middle Provo' },
      { name: 'Provo River - Lower Provo', coordinates: { latitude: 40.2889, longitude: -111.6733 }, type: 'river' as const, description: 'Lower Provo' },
      { name: 'Provo River - Heber Valley', coordinates: { latitude: 40.5156, longitude: -111.4125 }, type: 'river' as const, description: 'Heber Valley section' },
      
      // Weber River System
      { name: 'Weber River - Oakley', coordinates: { latitude: 40.7136, longitude: -111.3003 }, type: 'river' as const, description: 'Weber near Oakley' },
      { name: 'Weber River - Echo Canyon', coordinates: { latitude: 40.9697, longitude: -111.4267 }, type: 'river' as const, description: 'Echo Canyon section' },
      { name: 'Weber River - Morgan', coordinates: { latitude: 41.0361, longitude: -111.6764 }, type: 'river' as const, description: 'Weber near Morgan' },
      { name: 'Weber River - Plain City', coordinates: { latitude: 41.2983, longitude: -112.0861 }, type: 'river' as const, description: 'Lower Weber' },
      
      // Green River System
      { name: 'Green River - Flaming Gorge Dam', coordinates: { latitude: 40.9173, longitude: -109.4247 }, type: 'river' as const, description: 'World-class tailwater' },
      { name: 'Green River - Little Hole', coordinates: { latitude: 40.8839, longitude: -109.4919 }, type: 'river' as const, description: 'Little Hole section' },
      { name: 'Green River - Browns Park', coordinates: { latitude: 40.7536, longitude: -109.5708 }, type: 'river' as const, description: 'Remote wilderness' },
      { name: 'Green River - Jensen', coordinates: { latitude: 40.3658, longitude: -109.3478 }, type: 'river' as const, description: 'Green River at Jensen' },
      
      // Logan River System
      { name: 'Logan River - Upper', coordinates: { latitude: 41.8803, longitude: -111.5344 }, type: 'river' as const, description: 'Upper Logan' },
      { name: 'Logan River - Logan Canyon', coordinates: { latitude: 41.7739, longitude: -111.6808 }, type: 'river' as const, description: 'Logan Canyon' },
      { name: 'Logan River - Lower', coordinates: { latitude: 41.7358, longitude: -111.8347 }, type: 'river' as const, description: 'Lower Logan' },
      
      // Bear River System
      { name: 'Bear River - Evanston', coordinates: { latitude: 41.2644, longitude: -110.9633 }, type: 'river' as const, description: 'Bear near Evanston' },
      { name: 'Bear River - Woodruff', coordinates: { latitude: 41.5194, longitude: -111.2142 }, type: 'river' as const, description: 'Bear near Woodruff' },
      { name: 'Cutler Reservoir', coordinates: { latitude: 41.8206, longitude: -112.0217 }, type: 'reservoir' as const, description: 'Cutler Reservoir' },
      
      // Reservoirs - Northern Utah
      { name: 'Deer Creek Reservoir', coordinates: { latitude: 40.4258, longitude: -111.5358 }, type: 'reservoir' as const, description: 'Popular reservoir' },
      { name: 'Jordanelle Reservoir', coordinates: { latitude: 40.6269, longitude: -111.4103 }, type: 'reservoir' as const, description: 'Large reservoir' },
      { name: 'Rockport Reservoir', coordinates: { latitude: 40.7075, longitude: -111.3586 }, type: 'reservoir' as const, description: 'Family-friendly' },
      { name: 'Echo Reservoir', coordinates: { latitude: 40.9514, longitude: -111.4181 }, type: 'reservoir' as const, description: 'Echo Reservoir' },
      { name: 'Pineview Reservoir', coordinates: { latitude: 41.2522, longitude: -111.8186 }, type: 'reservoir' as const, description: 'Ogden area' },
      { name: 'Causey Reservoir', coordinates: { latitude: 41.2928, longitude: -111.5856 }, type: 'reservoir' as const, description: 'Mountain reservoir' },
      { name: 'Hyrum Reservoir', coordinates: { latitude: 41.6339, longitude: -111.8508 }, type: 'reservoir' as const, description: 'State park' },
      
      // Reservoirs - Central Utah
      { name: 'Strawberry Reservoir', coordinates: { latitude: 40.1786, longitude: -111.1658 }, type: 'reservoir' as const, description: 'Trophy trout' },
      { name: 'Currant Creek Reservoir', coordinates: { latitude: 40.2553, longitude: -111.0403 }, type: 'reservoir' as const, description: 'High mountain' },
      { name: 'Scofield Reservoir', coordinates: { latitude: 39.7781, longitude: -111.1578 }, type: 'reservoir' as const, description: 'State park' },
      { name: 'Huntington Reservoir', coordinates: { latitude: 39.3942, longitude: -110.9642 }, type: 'reservoir' as const, description: 'Mountain reservoir' },
      { name: 'Electric Lake', coordinates: { latitude: 39.4928, longitude: -111.2364 }, type: 'lake' as const, description: 'High elevation' },
      { name: 'Flaming Gorge Reservoir', coordinates: { latitude: 40.9239, longitude: -109.4736 }, type: 'reservoir' as const, description: 'Massive reservoir' },
      
      // Duchesne River System
      { name: 'Duchesne River - Upper', coordinates: { latitude: 40.5042, longitude: -110.5933 }, type: 'river' as const, description: 'Upper Duchesne' },
      { name: 'Duchesne River - Hanna', coordinates: { latitude: 40.4281, longitude: -110.8178 }, type: 'river' as const, description: 'Near Hanna' },
      { name: 'Duchesne River - Lower', coordinates: { latitude: 40.1619, longitude: -110.3869 }, type: 'river' as const, description: 'Lower Duchesne' },
      
      // Southern Utah
      { name: 'Beaver River', coordinates: { latitude: 38.2775, longitude: -112.6411 }, type: 'river' as const, description: 'Beaver River' },
      { name: 'Minersville Reservoir', coordinates: { latitude: 38.2192, longitude: -112.9139 }, type: 'reservoir' as const, description: 'Minersville' },
      { name: 'Piute Reservoir', coordinates: { latitude: 38.3322, longitude: -112.1194 }, type: 'reservoir' as const, description: 'Piute Reservoir' },
      { name: 'Otter Creek Reservoir', coordinates: { latitude: 38.1861, longitude: -111.9861 }, type: 'reservoir' as const, description: 'State park' },
      { name: 'Sevier River - Upper', coordinates: { latitude: 38.6528, longitude: -112.1772 }, type: 'river' as const, description: 'Upper Sevier' },
      { name: 'Fish Lake', coordinates: { latitude: 38.5372, longitude: -111.7294 }, type: 'lake' as const, description: 'Natural lake, famous for splake' },
      { name: 'Johnson Valley Reservoir', coordinates: { latitude: 38.4906, longitude: -111.7894 }, type: 'reservoir' as const, description: 'Johnson Valley' },
      
      // Other Rivers
      { name: 'Price River', coordinates: { latitude: 39.5728, longitude: -110.8108 }, type: 'river' as const, description: 'Price River' },
      { name: 'Thousands Lake', coordinates: { latitude: 38.1442, longitude: -111.4861 }, type: 'lake' as const, description: 'Boulder Mountain' },
      { name: 'Ogden River - Upper', coordinates: { latitude: 41.2639, longitude: -111.6631 }, type: 'river' as const, description: 'Upper Ogden' },
      { name: 'Ogden River - Lower', coordinates: { latitude: 41.2231, longitude: -111.9736 }, type: 'river' as const, description: 'Lower Ogden' },
    ];
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
   * Get location summary text
   */
  static getLocationSummary(waterBody: WaterBodyInfo): string {
    const distanceText = waterBody.distance < 1 ? 
      'less than 1 mile away' : 
      `${waterBody.distance.toFixed(1)} miles away`;
    
    return `${waterBody.name} (${waterBody.type}) - ${distanceText}${waterBody.region ? ` in ${waterBody.region}` : ''}`;
  }
}

export const reverseGeocodingService = ReverseGeocodingService;


