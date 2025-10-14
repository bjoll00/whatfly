import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { MAPBOX_CONFIG } from '../lib/mapboxConfig';
import { savedLocationsService } from '../lib/savedLocationsService';

// Check if Mapbox is available (only in production builds)
let Mapbox: any = null;
let mapboxAvailable = false;

try {
  Mapbox = require('@rnmapbox/maps');
  if (Mapbox && Mapbox.setAccessToken) {
    Mapbox.setAccessToken(MAPBOX_CONFIG.ACCESS_TOKEN);
    mapboxAvailable = true;
  }
} catch (error) {
  console.log('Mapbox not available in development mode:', error);
  mapboxAvailable = false;
}

interface LocationPickerProps {
  onLocationSelect: (location: {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
  currentLocation?: {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface SavedLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  created_at: string;
}

export default function LocationPicker({ onLocationSelect, currentLocation }: LocationPickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  } | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { user } = useAuth();
  
  const cameraRef = useRef<Mapbox.Camera>(null);

  useEffect(() => {
    if (isVisible) {
      getCurrentLocation();
      loadSavedLocations();
    }
  }, [isVisible]);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied', 
          'Location permission is required to show your current location on the map.'
        );
        setIsLoading(false);
        return;
      }

      // Get current location with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
        maximumAge: 60000, // Accept location up to 1 minute old
      });

      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      
      // Set camera to user location if Mapbox is available
      if (mapboxAvailable && cameraRef.current) {
        cameraRef.current.setCamera({
            centerCoordinate: [location.coords.longitude, location.coords.latitude],
            zoomLevel: 12,
            animationDuration: 1000,
          });
        }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Location Error', 'Could not get your current location. Please enable location services.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedLocations = async () => {
    if (!user) return;
    
    try {
      const locations = await savedLocationsService.getSavedLocations(user.id);
      setSavedLocations(locations);
    } catch (error) {
      console.error('Error loading saved locations:', error);
      // Fallback to mock data if service fails
      const mockLocations: SavedLocation[] = [
        {
          id: '1',
          user_id: user.id,
          name: 'Provo River',
          latitude: 40.2181,
          longitude: -111.6133,
          address: 'Provo, UT',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: user.id,
          name: 'Weber River',
          latitude: 41.2220,
          longitude: -111.9733,
          address: 'Ogden, UT',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setSavedLocations(mockLocations);
    }
  };

  const handleMapPress = async (feature: any) => {
    try {
      setIsLoading(true);
      const [longitude, latitude] = feature.geometry.coordinates;
      
      // Get address using reverse geocoding
      const address = await getAddressFromCoordinates(latitude, longitude);
      
      setSelectedLocation({
        latitude,
        longitude,
        name: address?.name || 'Selected Location',
        address: address?.full_address,
      });
    } catch (error) {
      console.error('Error handling map press:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      // Use Mapbox Geocoding API for reverse geocoding
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_CONFIG.ACCESS_TOKEN}&types=place,locality,neighborhood`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return {
          name: feature.text,
          full_address: feature.place_name,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect({
        name: selectedLocation.name || 'Selected Location',
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: selectedLocation.address,
      });
      setIsVisible(false);
      setSelectedLocation(null);
    }
  };

  const handleSavedLocationSelect = (location: SavedLocation) => {
    onLocationSelect({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
    });
    setIsVisible(false);
  };

  const handleCurrentLocationSelect = () => {
    if (userLocation) {
      onLocationSelect({
        name: 'Current Location',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
      setIsVisible(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedLocation || !user) return;
    
    try {
      const locationName = selectedLocation.name || 'Selected Location';
      const savedLocation = await savedLocationsService.saveLocation(user.id, {
        name: locationName,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: selectedLocation.address,
      });

      if (savedLocation) {
        Alert.alert('Success', 'Location saved successfully!');
        // Reload saved locations
        await loadSavedLocations();
      } else {
        Alert.alert('Error', 'Could not save location. Please try again.');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Could not save location. Please try again.');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.locationButtonText}>
          {currentLocation ? currentLocation.name : '📍 Select Location'}
        </Text>
        <Text style={styles.locationSubtext}>
          {currentLocation ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` : 'Tap to choose fishing spot'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Fishing Location</Text>
            <TouchableOpacity
              style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]}
              onPress={handleConfirmLocation}
              disabled={!selectedLocation}
            >
              <Text style={[styles.confirmButtonText, !selectedLocation && styles.confirmButtonTextDisabled]}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>

          {/* Saved Locations */}
          {savedLocations.length > 0 && (
            <View style={styles.savedLocationsContainer}>
              <Text style={styles.sectionTitle}>Saved Locations</Text>
              <View style={styles.savedLocationsList}>
                {savedLocations.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={styles.savedLocationItem}
                    onPress={() => handleSavedLocationSelect(location)}
                  >
                    <Text style={styles.savedLocationName}>{location.name}</Text>
                    <Text style={styles.savedLocationAddress}>{location.address}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleCurrentLocationSelect}
              disabled={!userLocation}
            >
              <Text style={styles.quickActionText}>📍 Use Current Location</Text>
            </TouchableOpacity>
          </View>

          {/* Map or Fallback */}
          <View style={styles.mapContainer}>
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#ffd33d" />
                <Text style={styles.loadingText}>Loading location...</Text>
              </View>
            )}
            
            {mapboxAvailable ? (
              <Mapbox.MapView
                style={styles.map}
                styleURL={MAPBOX_CONFIG.DEFAULT_STYLE}
                onPress={handleMapPress}
                logoEnabled={false}
                attributionEnabled={false}
                projection="mercator"
                compassEnabled={true}
                scaleBarEnabled={false}
              >
                <Mapbox.Camera
                  ref={cameraRef}
                  centerCoordinate={userLocation ? [userLocation.longitude, userLocation.latitude] : [-111.8904, 40.7608]}
                  zoomLevel={12}
                />
                
                {/* User location marker */}
                {userLocation && (
                  <Mapbox.PointAnnotation
                    id="user-location"
                    coordinate={[userLocation.longitude, userLocation.latitude]}
                  >
                    <View style={styles.userLocationMarker}>
                      <View style={styles.userLocationPulse} />
                    </View>
                  </Mapbox.PointAnnotation>
                )}
                
                {/* Selected location marker */}
                {selectedLocation && (
                  <Mapbox.PointAnnotation
                    id="selected-location"
                    coordinate={[selectedLocation.longitude, selectedLocation.latitude]}
                  >
                    <View style={styles.selectedLocationMarker}>
                      <Text style={styles.selectedLocationText}>📍</Text>
                    </View>
                  </Mapbox.PointAnnotation>
                )}
                
                {/* Saved locations markers */}
                {savedLocations.map((location) => (
                  <Mapbox.PointAnnotation
                    key={location.id}
                    id={`saved-${location.id}`}
                    coordinate={[location.longitude, location.latitude]}
                  >
                    <View style={styles.savedLocationMarker}>
                      <Text style={styles.savedLocationMarkerText}>🎣</Text>
                    </View>
                  </Mapbox.PointAnnotation>
                ))}
              </Mapbox.MapView>
            ) : (
              /* Fallback UI for development mode */
              <View style={styles.fallbackContainer}>
                <Text style={styles.fallbackTitle}>📍 Location Selection</Text>
                <Text style={styles.fallbackText}>
                  Map view is not available in development mode.
                </Text>
                <Text style={styles.fallbackText}>
                  You can still select from saved locations or enter coordinates manually.
                </Text>
                
                {/* Manual coordinate input */}
                <View style={styles.coordinateInput}>
                  <Text style={styles.coordinateLabel}>Or enter coordinates:</Text>
                  <View style={styles.coordinateRow}>
                    <TextInput
                      style={styles.coordinateInputField}
                      placeholder="Latitude"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        const lat = parseFloat(text);
                        if (!isNaN(lat)) {
                          setSelectedLocation({
                            latitude: lat,
                            longitude: selectedLocation?.longitude || -111.8910,
                            name: 'Manual Location',
                          });
                        }
                      }}
                    />
                    <TextInput
                      style={styles.coordinateInputField}
                      placeholder="Longitude"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        const lng = parseFloat(text);
                        if (!isNaN(lng)) {
                          setSelectedLocation({
                            latitude: selectedLocation?.latitude || 40.7608,
                            longitude: lng,
                            name: 'Manual Location',
                          });
                        }
                      }}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Selected location info */}
          {selectedLocation && (
            <View style={styles.selectedLocationInfo}>
              <Text style={styles.selectedLocationTitle}>Selected Location</Text>
              <Text style={styles.selectedLocationName}>{selectedLocation.name}</Text>
              {selectedLocation.address && (
                <Text style={styles.selectedLocationAddress}>{selectedLocation.address}</Text>
              )}
              <Text style={styles.selectedLocationCoords}>
                {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
              </Text>
              
              {/* Save Location Button */}
              {user && (
                <TouchableOpacity
                  style={styles.saveLocationButton}
                  onPress={handleSaveLocation}
                >
                  <Text style={styles.saveLocationButtonText}>💾 Save This Location</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <Text style={styles.instructionText}>
            Tap on the map to select a fishing location, or choose from your saved locations above.
          </Text>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  locationButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#555',
    marginBottom: 15,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationSubtext: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#ffd33d',
    fontSize: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: '#666',
  },
  confirmButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButtonTextDisabled: {
    color: '#999',
  },
  savedLocationsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  savedLocationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  savedLocationItem: {
    backgroundColor: '#3a3a3a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    minWidth: 120,
  },
  savedLocationName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  savedLocationAddress: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  quickActions: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  quickActionButton: {
    backgroundColor: '#3a3a3a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    alignItems: 'center',
  },
  quickActionText: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
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
    zIndex: 1000,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffd33d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationPulse: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 211, 61, 0.3)',
    position: 'absolute',
  },
  selectedLocationMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  selectedLocationText: {
    fontSize: 16,
  },
  savedLocationMarker: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  savedLocationMarkerText: {
    fontSize: 14,
  },
  selectedLocationInfo: {
    padding: 16,
    backgroundColor: '#3a3a3a',
    borderTopWidth: 1,
    borderTopColor: '#555',
  },
  selectedLocationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedLocationName: {
    color: '#ffd33d',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedLocationAddress: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  selectedLocationCoords: {
    color: '#999',
    fontSize: 12,
  },
  instructionText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
    lineHeight: 20,
  },
  saveLocationButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  saveLocationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2a2a2a',
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  fallbackText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  coordinateInput: {
    width: '100%',
    marginTop: 20,
  },
  coordinateLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  coordinateInputField: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#555',
  },
});
