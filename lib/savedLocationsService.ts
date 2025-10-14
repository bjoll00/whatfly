import { supabase } from './supabase';
import { SavedLocation } from './types';

export class SavedLocationsService {
  // Get all saved locations for a user
  async getSavedLocations(userId: string): Promise<SavedLocation[]> {
    try {
      const { data, error } = await supabase
        .from('saved_locations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved locations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching saved locations:', error);
      return [];
    }
  }

  // Save a new location
  async saveLocation(
    userId: string,
    location: {
      name: string;
      latitude: number;
      longitude: number;
      address?: string;
      notes?: string;
    }
  ): Promise<SavedLocation | null> {
    try {
      const { data, error } = await supabase
        .from('saved_locations')
        .insert({
          user_id: userId,
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          notes: location.notes,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving location:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error saving location:', error);
      return null;
    }
  }

  // Update an existing location
  async updateLocation(
    locationId: string,
    updates: {
      name?: string;
      latitude?: number;
      longitude?: number;
      address?: string;
      notes?: string;
    }
  ): Promise<SavedLocation | null> {
    try {
      const { data, error } = await supabase
        .from('saved_locations')
        .update(updates)
        .eq('id', locationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating location:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating location:', error);
      return null;
    }
  }

  // Delete a saved location
  async deleteLocation(locationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_locations')
        .delete()
        .eq('id', locationId);

      if (error) {
        console.error('Error deleting location:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting location:', error);
      return false;
    }
  }

  // Check if a location is already saved (within a small radius)
  async isLocationSaved(
    userId: string,
    latitude: number,
    longitude: number,
    radiusKm: number = 0.1
  ): Promise<SavedLocation | null> {
    try {
      // Convert radius from km to approximate degrees
      // 1 degree latitude ≈ 111 km
      // 1 degree longitude varies by latitude, but we'll use a rough approximation
      const latRadius = radiusKm / 111;
      const lonRadius = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

      const { data, error } = await supabase
        .from('saved_locations')
        .select('*')
        .eq('user_id', userId)
        .gte('latitude', latitude - latRadius)
        .lte('latitude', latitude + latRadius)
        .gte('longitude', longitude - lonRadius)
        .lte('longitude', longitude + lonRadius);

      if (error) {
        console.error('Error checking saved location:', error);
        return null;
      }

      // Find the closest location within the radius
      let closestLocation: SavedLocation | null = null;
      let closestDistance = Infinity;

      data?.forEach((location) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          location.latitude,
          location.longitude
        );
        
        if (distance < closestDistance && distance <= radiusKm) {
          closestDistance = distance;
          closestLocation = location;
        }
      });

      return closestLocation;
    } catch (error) {
      console.error('Error checking saved location:', error);
      return null;
    }
  }

  // Calculate distance between two coordinates in kilometers
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Get popular fishing locations (most saved by users)
  async getPopularLocations(limit: number = 10): Promise<SavedLocation[]> {
    try {
      const { data, error } = await supabase
        .from('saved_locations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching popular locations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching popular locations:', error);
      return [];
    }
  }

  // Get locations near a specific point
  async getNearbyLocations(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 20
  ): Promise<SavedLocation[]> {
    try {
      // This is a simplified approach - for production, you'd want to use PostGIS
      // or implement proper geographic queries
      const latRadius = radiusKm / 111;
      const lonRadius = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

      const { data, error } = await supabase
        .from('saved_locations')
        .select('*')
        .gte('latitude', latitude - latRadius)
        .lte('latitude', latitude + latRadius)
        .gte('longitude', longitude - lonRadius)
        .lte('longitude', longitude + lonRadius)
        .limit(limit);

      if (error) {
        console.error('Error fetching nearby locations:', error);
        return [];
      }

      // Sort by actual distance
      const locationsWithDistance = data?.map((location) => ({
        ...location,
        distance: this.calculateDistance(
          latitude,
          longitude,
          location.latitude,
          location.longitude
        ),
      })) || [];

      return locationsWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      return [];
    }
  }
}

export const savedLocationsService = new SavedLocationsService();

