import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Coordinates,
    fetchUSGS,
    fetchWeather,
    findNearestRiver,
    getRecommendedFlies,
    RiverLocation,
    USGSWaterData,
    WeatherData
} from '../lib/locationService';
import { MAPBOX_CONFIG } from '../lib/mapboxConfig';

// Import Mapbox for native platforms
let Mapbox: any = null;
try {
  if (Platform.OS !== 'web') {
    Mapbox = require('@rnmapbox/maps');
    // Configure Mapbox
    Mapbox.setAccessToken(MAPBOX_CONFIG.ACCESS_TOKEN);
    console.log('Mapbox loaded successfully for platform:', Platform.OS);
  }
} catch (error) {
  console.error('Failed to load Mapbox:', error);
  Mapbox = null;
}

interface FishingMapProps {
  onLocationSelect?: (coordinates: Coordinates, location: RiverLocation | null) => void;
  onFliesRecommended?: (flies: any[]) => void;
}

export default function FishingMap({ onLocationSelect, onFliesRecommended }: FishingMapProps) {
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<RiverLocation | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [waterData, setWaterData] = useState<USGSWaterData | null>(null);
  const [recommendedFlies, setRecommendedFlies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const mapRef = useRef<Mapbox.MapView>(null);

  // Default camera position (Provo River)
  const defaultCamera = MAPBOX_CONFIG.DEFAULT_CAMERA;

  const handleMapPress = useCallback(async (feature: any, coordinates: [number, number]) => {
    console.log('Map pressed at coordinates:', coordinates);
    
    const [longitude, latitude] = coordinates;
    const coords: Coordinates = { latitude, longitude };
    
    setSelectedCoordinates(coords);
    setIsLoading(true);

    try {
      // Find nearest river
      const nearestRiver = await findNearestRiver(latitude, longitude);
      setSelectedLocation(nearestRiver);

      // Fetch weather data
      const weather = await fetchWeather(latitude, longitude);
      setWeatherData(weather);

      // Fetch water data if we found a river
      let waterData: USGSWaterData | null = null;
      if (nearestRiver) {
        waterData = await fetchUSGS(nearestRiver.id);
        setWaterData(waterData);
      }

      // Get fly recommendations
      if (nearestRiver) {
        const flies = await getRecommendedFlies({
          river: nearestRiver,
          weather,
          waterData,
          season: getCurrentSeason(),
        });
        setRecommendedFlies(flies);
        onFliesRecommended?.(flies);
      }

      // Notify parent component
      onLocationSelect?.(coords, nearestRiver);

      // Show results modal
      setShowResults(true);

    } catch (error) {
      console.error('Error processing location:', error);
      Alert.alert('Error', 'Failed to get location data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onLocationSelect, onFliesRecommended]);

  const clearSelection = useCallback(() => {
    setSelectedCoordinates(null);
    setSelectedLocation(null);
    setWeatherData(null);
    setWaterData(null);
    setRecommendedFlies([]);
    setShowResults(false);
  }, []);

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  const formatCoordinates = (coords: Coordinates): string => {
    return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
  };

  const ResultsModal = () => (
    <Modal
      visible={showResults}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Fishing Location Details</Text>
          <TouchableOpacity onPress={() => setShowResults(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedCoordinates && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>📍 Selected Location</Text>
              <Text style={styles.cardText}>Coordinates: {formatCoordinates(selectedCoordinates)}</Text>
            </View>
          )}

          {selectedLocation && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>🏞️ Nearest Fishing Spot</Text>
              <Text style={styles.cardText}>Name: {selectedLocation.name}</Text>
              <Text style={styles.cardText}>Type: {selectedLocation.type}</Text>
              {selectedLocation.description && (
                <Text style={styles.cardText}>Description: {selectedLocation.description}</Text>
              )}
            </View>
          )}

          {weatherData && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>🌤️ Current Weather</Text>
              <Text style={styles.cardText}>Temperature: {weatherData.temperature}°F</Text>
              <Text style={styles.cardText}>Condition: {weatherData.condition}</Text>
              <Text style={styles.cardText}>Wind: {weatherData.windSpeed} mph {weatherData.windDirection}</Text>
              <Text style={styles.cardText}>Humidity: {weatherData.humidity}%</Text>
            </View>
          )}

          {waterData && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>💧 Water Conditions</Text>
              <Text style={styles.cardText}>Flow Rate: {waterData.flowRate} cfs</Text>
              <Text style={styles.cardText}>Water Temperature: {waterData.waterTemperature}°F</Text>
              <Text style={styles.cardText}>Water Level: {waterData.waterLevel} ft</Text>
              <Text style={styles.cardText}>Station: {waterData.stationName}</Text>
            </View>
          )}

          {recommendedFlies.length > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>🎣 Recommended Flies</Text>
              {recommendedFlies.map((fly, index) => (
                <View key={index} style={styles.flyItem}>
                  <Text style={styles.flyName}>{fly.fly.name}</Text>
                  <Text style={styles.flyDetails}>
                    {fly.fly.type.toUpperCase()} • Size {fly.fly.size} • {fly.fly.color}
                  </Text>
                  <Text style={styles.flyReason}>💡 {fly.reason}</Text>
                  <Text style={styles.flyConfidence}>
                    Confidence: {Math.round(fly.confidence * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
              <Text style={styles.clearButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  // Debug logging
  console.log('Platform.OS:', Platform.OS);
  console.log('Mapbox available:', !!Mapbox);
  console.log('Mapbox object:', Mapbox);

  // Show placeholder for web or if Mapbox is not available
  if (Platform.OS === 'web' || !Mapbox) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderTitle}>🗺️ Fishing Map</Text>
          <Text style={styles.placeholderText}>
            Interactive map requires a development build for full functionality.
          </Text>
          <Text style={styles.placeholderSubtext}>
            For now, you can select from these popular fishing locations:
          </Text>
          
          <View style={styles.locationButtons}>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => {
                const coords = { latitude: 40.3, longitude: -111.6 };
                handleMapPress(null, [coords.longitude, coords.latitude]);
              }}
            >
              <Text style={styles.locationButtonText}>🏞️ Provo River - Main Stem</Text>
              <Text style={styles.locationButtonSubtext}>40.3°N, 111.6°W</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => {
                const coords = { latitude: 40.25, longitude: -111.7 };
                handleMapPress(null, [coords.longitude, coords.latitude]);
              }}
            >
              <Text style={styles.locationButtonText}>🌊 Provo River - Lower Section</Text>
              <Text style={styles.locationButtonSubtext}>40.25°N, 111.7°W</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => {
                const coords = { latitude: 40.45, longitude: -111.5 };
                handleMapPress(null, [coords.longitude, coords.latitude]);
              }}
            >
              <Text style={styles.locationButtonText}>🏔️ Deer Creek Reservoir</Text>
              <Text style={styles.locationButtonSubtext}>40.45°N, 111.5°W</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.noteText}>
            💡 For the full interactive map experience, build the app with EAS Build
          </Text>
        </View>
        <ResultsModal />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MAPBOX_CONFIG.DEFAULT_STYLE}
      >
        <Mapbox.Camera
          defaultSettings={defaultCamera}
          centerCoordinate={defaultCamera.centerCoordinate}
          zoomLevel={defaultCamera.zoomLevel}
        />

        <Mapbox.ShapeSource
          id="mapPress"
          onPress={handleMapPress}
        >
          <Mapbox.FillLayer id="mapPressFill" style={{ fillOpacity: 0 }} />
        </Mapbox.ShapeSource>

        {selectedCoordinates && (
          <Mapbox.PointAnnotation
            id="selectedPoint"
            coordinate={[selectedCoordinates.longitude, selectedCoordinates.latitude]}
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>📍</Text>
            </View>
          </Mapbox.PointAnnotation>
        )}
      </Mapbox.MapView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffd33d" />
          <Text style={styles.loadingText}>Analyzing location...</Text>
        </View>
      )}

      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Tap anywhere on the map to get fishing recommendations for that location
        </Text>
      </View>

      <ResultsModal />
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  instructions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(37, 41, 46, 0.9)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffd33d',
  },
  instructionsText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#555',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
  },
  flyItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ffd33d',
  },
  flyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  flyDetails: {
    fontSize: 12,
    color: '#ffd33d',
    marginBottom: 5,
  },
  flyReason: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  flyConfidence: {
    fontSize: 12,
    color: '#999',
  },
  modalActions: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  clearButton: {
    backgroundColor: '#666',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  placeholderTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 20,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  demoButton: {
    backgroundColor: '#ffd33d',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationButtons: {
    width: '100%',
    marginTop: 20,
  },
  locationButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#555',
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationButtonSubtext: {
    color: '#ccc',
    fontSize: 12,
  },
  noteText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
