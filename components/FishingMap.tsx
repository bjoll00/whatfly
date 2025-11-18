import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MAPBOX_CONFIG } from '../lib/mapboxConfig';
import { fetchFishingData } from '../lib/fetchFishingData';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useFishing } from '../lib/FishingContext';
import { convertMapDataToFishingConditions } from '../lib/mapDataConverter';
import { useAuth } from '../lib/AuthContext';
import { flySuggestionService } from '../lib/flySuggestionService';
import { newFlySuggestionService } from '../lib/newFlySuggestionService';
import { FlySuggestion } from '../lib/types';
import FlySuggestionsModal from './FlySuggestionsModal';

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
  // Fetch user's current location on mount (for display only, not auto-fetching)
  const { location: userLocation, isLoading: isLoadingLocation, error: locationError } = useCurrentLocation();
  
  // Get FishingContext to store conditions for fly suggestions
  const { setFishingConditions, clearFishingConditions, fishingConditions } = useFishing();
  
  // Get user for usage tracking
  const { user } = useAuth();
  
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fishingData, setFishingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [suggestions, setSuggestions] = useState<FlySuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
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
        
        // Convert map data to FishingConditions format and store in context
        // This makes the data available for fly suggestion algorithms
        const fishingConditions = convertMapDataToFishingConditions(
          data,
          `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          latitude,
          longitude
        );
        
        // Store in FishingContext so fly suggestion services can access it
        setFishingConditions(fishingConditions);
        
        console.log('✅ Map data converted and stored in FishingContext for fly suggestions');
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
    // Clear fishing conditions from context when selection is cleared
    clearFishingConditions();
    // Close suggestions modal if open
    setShowSuggestionsModal(false);
    setSuggestions([]);
    setSuggestionsError(null);
  };

  const handleGetFlySuggestions = async () => {
    // Check if we have fishing conditions from context
    if (!fishingConditions || !fishingConditions.location || !fishingConditions.latitude || !fishingConditions.longitude) {
      setSuggestionsError('Please wait for location data to load, or select a location on the map.');
      setShowSuggestionsModal(true);
      return;
    }

    setIsLoadingSuggestions(true);
    setSuggestionsError(null);
    setShowSuggestionsModal(true);

    try {
      console.log('🎣 Getting fly suggestions for conditions:', {
        location: fishingConditions.location,
        lat: fishingConditions.latitude,
        lng: fishingConditions.longitude,
        weather: fishingConditions.weather_conditions,
        water: fishingConditions.water_conditions,
      });

      // Use the NEW fly suggestion service that properly uses all fly attributes
      const result = await newFlySuggestionService.getSuggestions(
        fishingConditions,
        user?.id
      );

      console.log('🎣 Fly suggestions result:', {
        suggestionsCount: result.suggestions?.length || 0,
        canPerform: result.canPerform,
        error: result.error,
        hasSuggestions: (result.suggestions?.length || 0) > 0,
        firstSuggestion: result.suggestions?.[0]?.fly?.name || 'none',
      });

      if (result.error) {
        console.error('❌ Fly suggestion error:', result.error);
        setSuggestionsError(result.error);
        setSuggestions([]);
      } else if (!result.canPerform) {
        console.warn('⚠️ Cannot perform fly suggestions:', result);
        setSuggestionsError('Unable to get suggestions. Please try again.');
        setSuggestions([]);
      } else if (!result.suggestions || result.suggestions.length === 0) {
        console.warn('⚠️ No fly suggestions returned. Possible causes:');
        console.warn('  - Database might be empty (no flies)');
        console.warn('  - Conditions might not match any flies');
        console.warn('  - Service might have encountered an error');
        setSuggestionsError('No fly suggestions available. The database might be empty or conditions don\'t match any flies.');
        setSuggestions([]);
      } else {
        setSuggestions(result.suggestions);
        setSuggestionsError(null);
        console.log(`✅ Got ${result.suggestions.length} fly suggestions`);
      }
    } catch (error) {
      console.error('Error getting fly suggestions:', error);
      setSuggestionsError(
        error instanceof Error ? error.message : 'Failed to get fly suggestions. Please try again.'
      );
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
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
                    centerCoordinate: userLocation 
                      ? [userLocation.longitude, userLocation.latitude]
                      : MAPBOX_CONFIG.DEFAULT_CAMERA.centerCoordinate,
                    zoomLevel: MAPBOX_CONFIG.DEFAULT_CAMERA.zoomLevel,
                  }}
                  centerCoordinate={userLocation 
                    ? [userLocation.longitude, userLocation.latitude]
                    : MAPBOX_CONFIG.DEFAULT_CAMERA.centerCoordinate}
                />

        {/* User's current location marker (blue dot) */}
        {userLocation && (
          <Mapbox.PointAnnotation
            id="userLocationPoint"
            coordinate={[userLocation.longitude, userLocation.latitude]}
          >
            <View style={styles.userLocationMarker} />
          </Mapbox.PointAnnotation>
        )}

        {/* Selected location marker (yellow, for manually selected locations) */}
        {selectedCoordinates && (
          <Mapbox.PointAnnotation
            id="selectedPoint"
            coordinate={[selectedCoordinates.longitude, selectedCoordinates.latitude]}
          >
            <View style={styles.marker} />
          </Mapbox.PointAnnotation>
        )}
      </Mapbox.MapView>

      {/* Loading Indicator - Only show when fetching fishing data */}
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

          <ScrollView 
            style={styles.dataContent}
            contentContainerStyle={styles.dataContentContainer}
            showsVerticalScrollIndicator={true}
          >
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

                {/* Celestial Data (Moon Phase Only) */}
                {fishingData.moonPhase !== null && (
                  <>
                    <View style={styles.sectionDivider} />
                    <Text style={styles.sectionTitle}>🌙 Moon Phase</Text>

                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Moon Phase:</Text>
                      <Text style={styles.dataValue}>{fishingData.moonPhase}</Text>
                    </View>
                  </>
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

                    {fishingData.waterTemperature !== null ? (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Water Temperature:</Text>
                        <Text style={styles.dataValue}>
                          {((fishingData.waterTemperature * 9/5) + 32).toFixed(1)}°F
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Water Temperature:</Text>
                        <Text style={styles.noDataText}>Not available</Text>
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

                {/* Get Fly Suggestions Button */}
                <View style={styles.sectionDivider} />
                <TouchableOpacity
                  style={styles.suggestionsButton}
                  onPress={handleGetFlySuggestions}
                  disabled={isLoadingSuggestions}
                >
                  {isLoadingSuggestions ? (
                    <ActivityIndicator size="small" color="#25292e" />
                  ) : (
                    <>
                      <Text style={styles.suggestionsButtonIcon}>🎣</Text>
                      <Text style={styles.suggestionsButtonText}>Get Fly Suggestions</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : !isLoading && (
              <View style={styles.dataRow}>
                <Text style={styles.noDataText}>No data available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Fly Suggestions Modal */}
      <FlySuggestionsModal
        visible={showSuggestionsModal}
        suggestions={suggestions}
        isLoading={isLoadingSuggestions}
        error={suggestionsError}
        onClose={() => {
          setShowSuggestionsModal(false);
          setSuggestionsError(null);
        }}
        onFlySelect={(suggestion) => {
          console.log('Fly selected:', suggestion.fly.name);
          // You can add additional logic here, like showing fly details
        }}
      />
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
  userLocationMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF', // iOS blue
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // Android shadow
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
    flex: 1,
  },
  dataContentContainer: {
    padding: 16,
    paddingBottom: 20,
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
  suggestionsButton: {
    backgroundColor: '#ffd33d',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  suggestionsButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  suggestionsButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
