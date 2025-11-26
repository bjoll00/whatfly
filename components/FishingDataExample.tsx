/**
 * Example React Native Component using fetchFishingData
 * 
 * This demonstrates how to use the fetchFishingData function
 * in a React Native component with Mapbox integration.
 */

import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { fetchFishingData } from '../lib/fetchFishingData';

// Optional: Use your backend API instead of direct OpenWeatherMap calls
// If OWM_API_KEY is not provided, fetchFishingData will use your backend
const OWM_API_KEY = undefined; // Set to 'YOUR_OWM_KEY' if calling OWM directly

export default function FishingDataExample() {
  const [weatherMarker, setWeatherMarker] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleMapPress = async (event: any) => {
    try {
      // Extract coordinates from Mapbox event
      let longitude: number;
      let latitude: number;

      if (event?.geometry?.coordinates) {
        [longitude, latitude] = event.geometry.coordinates;
      } else {
        console.error('Invalid map press event');
        return;
      }

      setLoading(true);

      // Fetch fishing data (weather + water conditions)
      const fishingData = await fetchFishingData(latitude, longitude, OWM_API_KEY);

      if (!fishingData) {
        Alert.alert('Error', 'Failed to fetch fishing data');
        return;
      }

      // Update state for Mapbox PointAnnotation
      setWeatherMarker(fishingData);

      // Log the results
      console.log('Fishing Data:', {
        location: `[${longitude}, ${latitude}]`,
        airTemp: `${fishingData.airTemp}°C`,
        weather: fishingData.weatherDescription,
        streamFlow: fishingData.streamFlow ? `${fishingData.streamFlow} cfs` : 'N/A',
        waterTemp: fishingData.waterTemperature ? `${fishingData.waterTemperature}°C` : 'N/A',
        station: fishingData.usgsStationId || 'No station',
      });

    } catch (error) {
      console.error('Error handling map press:', error);
      Alert.alert('Error', 'Failed to process location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/outdoors-v12"
        onPress={handleMapPress}
      >
        <Mapbox.Camera
          defaultSettings={{
            centerCoordinate: [-111.6, 40.3],
            zoomLevel: 9,
          }}
        />

        {/* Weather Marker */}
        {weatherMarker && (
          <Mapbox.PointAnnotation
            id="weatherMarker"
            coordinate={weatherMarker.coordinate}
          >
            <View style={styles.markerContainer}>
              <View style={styles.marker}>
                <Text style={styles.markerText}>
                  {weatherMarker.airTemperature.toFixed(0)}°C
                </Text>
                <Text style={styles.markerSubtext}>
                  {weatherMarker.streamFlow
                    ? `${weatherMarker.streamFlow.toFixed(0)} cfs`
                    : 'No flow'}
                </Text>
              </View>
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading fishing data...</Text>
          </View>
        )}
      </Mapbox.MapView>

      {/* Data Display */}
      {weatherMarker && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Fishing Conditions</Text>
          <Text style={styles.dataText}>
            Air: {weatherMarker.airTemperature.toFixed(1)}°C
          </Text>
          <Text style={styles.dataText}>
            Weather: {weatherMarker.weatherDescription}
          </Text>
          {weatherMarker.streamFlow && (
            <Text style={styles.dataText}>
              Flow: {weatherMarker.streamFlow.toFixed(0)} cfs
            </Text>
          )}
          {weatherMarker.waterTemperature && (
            <Text style={styles.dataText}>
              Water Temp: {weatherMarker.waterTemperature.toFixed(1)}°C
            </Text>
          )}
          {weatherMarker.usgsStationId && (
            <Text style={styles.dataSubtext}>
              Station: {weatherMarker.usgsStationId}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    backgroundColor: '#ffd33d',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#fff',
    minWidth: 80,
    alignItems: 'center',
  },
  markerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#25292e',
  },
  markerSubtext: {
    fontSize: 10,
    color: '#25292e',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
  },
  dataContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(37, 41, 46, 0.95)',
    padding: 16,
    borderRadius: 12,
  },
  dataTitle: {
    color: '#ffd33d',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dataText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  dataSubtext: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 8,
  },
});

