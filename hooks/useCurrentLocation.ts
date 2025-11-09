/**
 * Custom hook for fetching and managing user's current location
 * Uses expo-location to get GPS coordinates with fallback to default location
 */

import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { MAPBOX_CONFIG } from '../lib/mapboxConfig';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface UseCurrentLocationReturn {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  permissionGranted: boolean;
}

/**
 * Default location fallback (used when permission denied or location unavailable)
 * Uses the default camera center from Mapbox config
 */
const DEFAULT_LOCATION: UserLocation = {
  latitude: MAPBOX_CONFIG.DEFAULT_CAMERA.centerCoordinate[1],
  longitude: MAPBOX_CONFIG.DEFAULT_CAMERA.centerCoordinate[0],
};

/**
 * Custom hook to fetch user's current location
 * 
 * @returns {UseCurrentLocationReturn} Object containing location, loading state, error, and permission status
 */
export function useCurrentLocation(): UseCurrentLocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchLocation() {
      try {
        setIsLoading(true);
        setError(null);

        // Step 1: Request foreground location permissions
        console.log('📍 Requesting location permissions...');
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          console.warn('⚠️ Location permission denied. Using default location.');
          setPermissionGranted(false);
          // Fallback to default location
          if (isMounted) {
            setLocation(DEFAULT_LOCATION);
            setIsLoading(false);
          }
          return;
        }

        setPermissionGranted(true);
        console.log('✅ Location permission granted');

        // Step 2: Get current position with balanced accuracy
        console.log('📍 Fetching current location...');
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          const userLocation: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || undefined,
          };

          console.log(`✅ Current location: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`);
          setLocation(userLocation);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('❌ Error fetching location:', err);
        if (isMounted) {
          setError(err.message || 'Failed to get location');
          // Fallback to default location on error
          setLocation(DEFAULT_LOCATION);
          setPermissionGranted(false);
          setIsLoading(false);
        }
      }
    }

    fetchLocation();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Run only once on mount

  return {
    location,
    isLoading,
    error,
    permissionGranted,
  };
}

