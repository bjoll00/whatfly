import React, { useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { MAPBOX_CONFIG } from '../lib/mapboxConfig';
import { fetchFishingData } from '../lib/fetchFishingData';

// Import Mapbox for native platforms
let Mapbox: any = null;
try {
  if (Platform.OS !== 'web') {
    Mapbox = require('@rnmapbox/maps');
    const token = MAPBOX_CONFIG.ACCESS_TOKEN;
    if (!token) {
      console.warn('⚠️ Mapbox token not configured. Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in .env');
    } else {
      Mapbox.setAccessToken(token);
    }
  }
} catch (error) {
  console.error('Failed to load Mapbox:', error);
  Mapbox = null;
}

interface FishingMapProps {
  onLocationSelect?: (coordinates: { latitude: number; longitude: number }) => void;
}

export default function FishingMap({ onLocationSelect }: FishingMapProps) {
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fishingData, setFishingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<any>(null);

  const handleMapPress = async (event: any) => {
    // Mapbox onPress event structure: { geometry: { coordinates: [longitude, latitude] } }
    let longitude: number;
    let latitude: number;

    if (event?.geometry?.coordinates) {
      // Event has geometry.coordinates array
      [longitude, latitude] = event.geometry.coordinates;
    } else if (Array.isArray(event)) {
      // Fallback: if event is directly an array
      [longitude, latitude] = event;
    } else if (event?.coordinates && Array.isArray(event.coordinates)) {
      // Fallback: if event has coordinates array
      [longitude, latitude] = event.coordinates;
    } else {
      console.error('Invalid map press event structure:', event);
      return;
    }

    const coords = { latitude, longitude };
    setSelectedCoordinates(coords);
    setIsLoading(true);
    setFishingData(null); // Clear previous data

    // Notify parent component
    onLocationSelect?.(coords);

    // Fetch fishing data (weather + water conditions)
    try {
      const data = await fetchFishingData(latitude, longitude);
      if (data) {
        setFishingData(data);
      }
    } catch (error) {
      console.error('Error fetching fishing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedCoordinates(null);
    setFishingData(null);
  };

  if (!Mapbox) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Mapbox not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MAPBOX_CONFIG.DEFAULT_STYLE}
        onPress={handleMapPress}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Mapbox.Camera
          defaultSettings={{
            centerCoordinate: MAPBOX_CONFIG.DEFAULT_CAMERA.centerCoordinate,
            zoomLevel: MAPBOX_CONFIG.DEFAULT_CAMERA.zoomLevel,
          }}
        />

        {/* Selected location marker */}
        {selectedCoordinates && (
          <Mapbox.PointAnnotation
            id="selectedPoint"
            coordinate={[selectedCoordinates.longitude, selectedCoordinates.latitude]}
          >
            <View style={styles.marker} />
          </Mapbox.PointAnnotation>
        )}
      </Mapbox.MapView>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffd33d" />
          <Text style={styles.loadingText}>Collecting data...</Text>
        </View>
      )}

      {/* Location Data Display */}
      {selectedCoordinates && (
        <View style={styles.dataContainer}>
          <View style={styles.dataHeader}>
            <Text style={styles.dataTitle}>📍 Selected Location</Text>
            <Text 
              style={styles.closeButton}
              onPress={clearSelection}
            >
              ✕
            </Text>
          </View>

          <View style={styles.dataContent}>
            {/* Coordinates */}
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Coordinates:</Text>
              <Text style={styles.dataValue}>
                {selectedCoordinates.latitude.toFixed(4)}, {selectedCoordinates.longitude.toFixed(4)}
              </Text>
            </View>

                {/* Weather Data */}
                {fishingData ? (
                  <>
                    <View style={styles.sectionDivider} />
                    <Text style={styles.sectionTitle}>🌤️ Weather Conditions</Text>
                    
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Air Temperature:</Text>
                      <Text style={styles.dataValue}>
                        {fishingData.airTemp.toFixed(1)}°C ({((fishingData.airTemp * 9/5) + 32).toFixed(1)}°F)
                      </Text>
                    </View>

                    {fishingData.windSpeedMph !== null && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Wind Speed:</Text>
                        <Text style={styles.dataValue}>
                          {fishingData.windSpeedMph.toFixed(1)} mph
                          {fishingData.windDirectionDeg !== null && ` (${fishingData.windDirectionDeg}°)`}
                        </Text>
                      </View>
                    )}

                    {fishingData.windGustMph !== null && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Wind Gusts:</Text>
                        <Text style={styles.dataValue}>{fishingData.windGustMph.toFixed(1)} mph</Text>
                      </View>
                    )}

                    {fishingData.barometricPressureHpa !== null && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Pressure:</Text>
                        <Text style={styles.dataValue}>{fishingData.barometricPressureHpa.toFixed(1)} hPa</Text>
                      </View>
                    )}

                    {fishingData.cloudCoverPercent !== null && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Cloud Cover:</Text>
                        <Text style={styles.dataValue}>{fishingData.cloudCoverPercent}%</Text>
                      </View>
                    )}

                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Conditions:</Text>
                      <Text style={styles.dataValue}>{fishingData.weatherDescription}</Text>
                    </View>

                    {(fishingData.precipitationRainMm !== null || fishingData.precipitationSnowMm !== null) && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Precipitation:</Text>
                        <Text style={styles.dataValue}>
                          {fishingData.precipitationRainMm !== null && `${fishingData.precipitationRainMm.toFixed(2)} mm rain`}
                          {fishingData.precipitationRainMm !== null && fishingData.precipitationSnowMm !== null && ', '}
                          {fishingData.precipitationSnowMm !== null && `${fishingData.precipitationSnowMm.toFixed(2)} mm snow`}
                        </Text>
                      </View>
                    )}

                    {(fishingData.sunrise !== null || fishingData.sunset !== null) && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Sunrise/Sunset:</Text>
                        <Text style={styles.dataValue}>
                          {fishingData.sunrise !== null && new Date(fishingData.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {fishingData.sunrise !== null && fishingData.sunset !== null && ' / '}
                          {fishingData.sunset !== null && new Date(fishingData.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    )}

                {/* Water Data */}
                {(fishingData.streamFlow !== null || fishingData.waterTemperature !== null) && (
                  <>
                    <View style={styles.sectionDivider} />
                    <Text style={styles.sectionTitle}>🌊 Water Conditions</Text>

                    {fishingData.streamFlow !== null && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Stream Flow:</Text>
                        <Text style={styles.dataValue}>
                          {fishingData.streamFlow.toFixed(1)} cfs
                        </Text>
                      </View>
                    )}

                    {fishingData.waterTemperature !== null && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Water Temperature:</Text>
                        <Text style={styles.dataValue}>
                          {fishingData.waterTemperature.toFixed(1)}°C ({((fishingData.waterTemperature * 9/5) + 32).toFixed(1)}°F)
                        </Text>
                      </View>
                    )}

                    {fishingData.usgsStationId && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>USGS Station:</Text>
                        <Text style={styles.dataValue}>{fishingData.usgsStationId}</Text>
                      </View>
                    )}
                  </>
                )}

                {/* No Water Data Message */}
                {fishingData.streamFlow === null && fishingData.waterTemperature === null && (
                  <>
                    <View style={styles.sectionDivider} />
                    <Text style={styles.noDataText}>🌊 No water data available</Text>
                  </>
                )}
              </>
            ) : !isLoading && (
              <View style={styles.dataRow}>
                <Text style={styles.noDataText}>No data available</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffd33d',
    borderWidth: 3,
    borderColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(37, 41, 46, 0.95)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: '600',
  },
  dataContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(37, 41, 46, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffd33d',
    maxHeight: '60%',
  },
  dataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  dataTitle: {
    color: '#ffd33d',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 4,
  },
  dataContent: {
    padding: 16,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#555',
    marginVertical: 12,
  },
  sectionTitle: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  dataLabel: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  dataValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  noDataText: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});
