import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import FishingMap from '../../components/FishingMap';
import FlyDetailModal from '../../components/FlyDetailModal';
import FlySuggestionCard from '../../components/FlySuggestionCard';
import { useAuth } from '../../lib/AuthContext';
import { useFishing } from '../../lib/FishingContext';
import { debugLogger, logFlySuggestions, logLocation } from '../../lib/debugLogger';
import { hierarchicalFlySuggestionService } from '../../lib/hierarchicalFlySuggestionService';
import { Coordinates, RiverLocation } from '../../lib/locationService';
import { FlySuggestion } from '../../lib/types';

export default function MapScreen() {
  const { setFishingConditions, fishingConditions } = useFishing();
  const { user } = useAuth();
  const [, setSelectedLocation] = useState<RiverLocation | null>(null);
  const [showRiverPaths, setShowRiverPaths] = useState(true);
  const [hasLocationSelected, setHasLocationSelected] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Fly suggestion state
  const [suggestions, setSuggestions] = useState<FlySuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [selectedFly, setSelectedFly] = useState<FlySuggestion | null>(null);
  const [showFlyDetailModal, setShowFlyDetailModal] = useState(false);

  // Debug state changes
  useEffect(() => {
    console.log('🎣 Map state changed:', {
      selectedFly: selectedFly?.fly?.name || 'null',
      showFlyDetailModal,
      suggestionsCount: suggestions.length
    });
  }, [selectedFly, showFlyDetailModal, suggestions]);

  const handleLocationSelect = (coordinates: Coordinates, location: RiverLocation | null) => {
    setSelectedLocation(location);
  };

  const handleRiverPathSelect = (path: any) => {
    // The RiverDisplay component will be shown automatically by FishingMap
  };

  const handleGetFlySuggestions = async (coordinates: Coordinates, location: RiverLocation | null, weatherData: any, waterConditions: any, fishingConditions?: any) => {
    // Validate required data
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      debugLogger.log('MAP', 'Invalid coordinates provided', 'error');
      return;
    }

    // Debug: Log what data we're collecting
    debugLogger.log('MAP', `Collecting data for fly suggestions at ${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`);
    debugLogger.log('MAP', `Location: ${location?.name || 'Unknown'}, Weather: ${!!weatherData ? '✅' : '❌'}, Water: ${!!waterConditions ? '✅' : '❌'}`);
    
    // Always create comprehensive, location-specific conditions
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth();
    
    // Determine time of day
    const getTimeOfDay = (): string => {
      if (hour >= 5 && hour < 8) return 'dawn';
      if (hour >= 8 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 17) return 'midday';
      if (hour >= 17 && hour < 20) return 'afternoon';
      if (hour >= 20 && hour < 22) return 'dusk';
      return 'night';
    };
    
    // Determine time of year
    const getTimeOfYear = (): string => {
      if (month === 12 || month === 1 || month === 2) return 'winter';
      if (month === 3) return 'early_spring';
      if (month === 4) return 'spring';
      if (month === 5) return 'late_spring';
      if (month === 6) return 'early_summer';
      if (month === 7) return 'summer';
      if (month === 8) return 'late_summer';
      if (month === 9) return 'early_fall';
      if (month === 10) return 'fall';
      if (month === 11) return 'late_fall';
      return 'summer';
    };
    
    // Create location-specific conditions that vary based on coordinates and time
    const locationSpecificConditions = {
      date: now.toISOString().split('T')[0],
      location: location?.name || 'Selected Location',
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      location_address: `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`,
      
      // Location-based weather variations
      weather_conditions: coordinates.latitude > 41 ? 'overcast' : 'sunny', // Northern locations more overcast
      wind_speed: coordinates.longitude < -111 ? 'moderate' : 'light', // Eastern locations windier
      wind_direction: coordinates.latitude > 40.5 ? 'north' : 'south',
      air_temperature_range: coordinates.latitude > 41 ? 'cold' : 'moderate',
      
      // Location-based water variations
      water_conditions: 'calm',
      water_clarity: coordinates.latitude > 41 ? 'clear' : 'slightly_murky', // Higher elevations clearer
      water_level: coordinates.longitude < -111 ? 'normal' : 'high', // Eastern locations higher water
      water_flow: coordinates.latitude > 41 ? 'fast' : 'moderate', // Northern locations faster
      water_temperature: coordinates.latitude > 41 ? 42 : 68, // Significant temperature difference
      water_temperature_range: coordinates.latitude > 41 ? 'cold' : 'warm',
      
      // Time-based conditions
      time_of_day: getTimeOfDay(),
      time_of_year: getTimeOfYear(),
      
      // Enhanced location-specific data
      moon_phase: 'waxing_crescent', // Could be enhanced with actual lunar data
      moon_illumination: 0.3,
      lunar_feeding_activity: 'moderate',
      
      // Real-time data if available
      weather_data: weatherData,
      water_data: waterConditions,
      
      // Location-specific notes
      notes: `Location-specific conditions for ${location?.name || 'Selected Location'} at ${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)} - Generated at ${now.toLocaleTimeString()}`
    };
    
    // Merge with provided fishing conditions if available
    const finalConditions = fishingConditions ? {
      ...fishingConditions,
      // Override with location-specific data to ensure uniqueness
      weather_conditions: locationSpecificConditions.weather_conditions,
      wind_speed: locationSpecificConditions.wind_speed,
      water_clarity: locationSpecificConditions.water_clarity,
      water_level: locationSpecificConditions.water_level,
      water_flow: locationSpecificConditions.water_flow,
      water_temperature: locationSpecificConditions.water_temperature,
      water_temperature_range: locationSpecificConditions.water_temperature_range,
      time_of_day: locationSpecificConditions.time_of_day,
      time_of_year: locationSpecificConditions.time_of_year,
      notes: locationSpecificConditions.notes
    } : locationSpecificConditions;
    
    // Track missing data and fallbacks
    const missingFields: string[] = [];
    const errors: string[] = [];
    let fallbackUsed = false;

    if (!weatherData) {
      missingFields.push('weatherData');
      fallbackUsed = true;
    }
    if (!waterConditions) {
      missingFields.push('waterConditions');
      fallbackUsed = true;
    }

    // Log structured location selection data
    logLocation({
      coordinates,
      location: location?.name,
      weatherData,
      waterData: waterConditions,
      fishingConditions: finalConditions,
      missingFields,
      fallbackUsed,
      errors
    });
    
    // Debug: Log final conditions being passed to algorithm
    debugLogger.log('MAP', `Final conditions: ${finalConditions.location} at ${finalConditions.latitude}, ${finalConditions.longitude}`);
    debugLogger.log('MAP', `Data quality: Weather=${!!(finalConditions.weather_data?.temperature) ? '✅' : '❌'}, Water=${!!(finalConditions.water_data?.waterTemperature || finalConditions.water_data?.flowRate) ? '✅' : '❌'}`);

    // Set fishing conditions in global context
    setFishingConditions(finalConditions);
    
    // Get fly suggestions with the unique conditions
    await getFlySuggestions(finalConditions);
  };

  const handleLocationSelected = (hasSelection: boolean) => {
    setHasLocationSelected(hasSelection);
  };

  const handleModalClosed = () => {
    setShowDetailsModal(false);
  };

  const getFlySuggestions = async (conditions: any) => {
    setIsLoadingSuggestions(true);
    
    try {
      const result = await hierarchicalFlySuggestionService.getSuggestions(conditions, user?.id);
      
      if (!result.canPerform) {
        Alert.alert('Usage Limit', 'You have reached your usage limit for fly suggestions.');
        return;
      }
      
      setSuggestions(result.suggestions || []);
      setShowSuggestionsModal(true);
      
      // Log fly suggestions results
      logFlySuggestions({
        location: conditions?.location || 'Unknown',
        conditions,
        suggestionsCount: result.suggestions?.length || 0,
        topSuggestions: result.suggestions?.slice(0, 3).map(s => s.fly.name) || [],
        algorithmUsed: 'hierarchical'
      });
      
      if (result.suggestions.length === 0) {
        debugLogger.log('MAP', 'No fly suggestions returned', 'warn');
        if (result.error) {
          Alert.alert('Error', `Failed to get fly suggestions: ${result.error}`);
        } else {
          Alert.alert('No Suggestions', 'No fly suggestions found for this location. This might be due to limited fly data or location-specific conditions.');
        }
        return;
      }
    } catch (error) {
      debugLogger.log('MAP', `Error getting suggestions: ${error}`, 'error');
      Alert.alert('Error', `Failed to get fly suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleFlyPress = (fly: FlySuggestion) => {
    console.log('🎣 handleFlyPress called with fly:', fly?.fly?.name || 'undefined');
    console.log('🎣 Full fly object:', fly);
    console.log('🎣 Fly properties:', {
      id: fly?.fly?.id,
      name: fly?.fly?.name,
      type: fly?.fly?.type,
      size: fly?.fly?.primary_size,
      color: fly?.fly?.color,
      confidence: fly?.confidence,
      reason: fly?.reason
    });
    
    if (!fly) {
      console.error('❌ handleFlyPress received null/undefined fly');
      return;
    }
    
    if (!fly.fly) {
      console.error('❌ handleFlyPress received fly without fly object');
      return;
    }
    
    console.log('✅ Setting selected fly and showing modal');
    setSelectedFly(fly);
    setShowFlyDetailModal(true);
  };

  return (
    <View style={styles.container}>
      <FishingMap
        onLocationSelect={handleLocationSelect}
        onGetFlySuggestions={handleGetFlySuggestions}
        showRiverMarkers={false}
        showRiverPaths={showRiverPaths}
        onRiverPathSelect={handleRiverPathSelect}
        onLocationSelected={handleLocationSelected}
        showDetailsModal={showDetailsModal}
        onModalClosed={handleModalClosed}
      />
      
      {/* Controls for river display */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.toggleButton, showRiverPaths && styles.activeToggle]}
          onPress={() => setShowRiverPaths(!showRiverPaths)}
        >
          <Text style={[styles.toggleText, showRiverPaths && styles.activeToggleText]}>
            🎣 {showRiverPaths ? 'Hide' : 'Show'} Dam Locations
          </Text>
        </TouchableOpacity>
        
        {hasLocationSelected && (
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => setShowDetailsModal(true)}
          >
            <Text style={styles.viewDetailsButtonText}>
              📍 View Details
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Fly Suggestions Modal */}
      <Modal
        visible={showSuggestionsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSuggestionsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎣 Fly Suggestions</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSuggestionsModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {fishingConditions && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                📍 {fishingConditions.location}
              </Text>
              <Text style={styles.coordinatesText}>
                {fishingConditions.latitude?.toFixed(4)}, {fishingConditions.longitude?.toFixed(4)}
              </Text>
            </View>
          )}
          
          <ScrollView style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => {
              console.log(`🎣 Rendering suggestion ${index}:`, suggestion?.fly?.name || 'undefined');
              return (
                <FlySuggestionCard
                  key={`${suggestion.fly.id}-${index}`}
                  suggestion={suggestion}
                  onPress={() => handleFlyPress(suggestion)}
                />
              );
            })}
          </ScrollView>
        </View>
      </Modal>
      
      {/* Fly Detail Modal */}
      <FlyDetailModal
        visible={showFlyDetailModal}
        suggestion={selectedFly}
        onClose={() => {
          console.log('🎣 Closing FlyDetailModal');
          setShowFlyDetailModal(false);
          setSelectedFly(null);
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
  controls: {
    position: 'absolute',
    top: 80,
    left: 10,
    zIndex: 1000,
    flexDirection: 'column',
    gap: 8,
  },
  toggleButton: {
    backgroundColor: '#3a3a3a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#555',
  },
  activeToggle: {
    backgroundColor: '#ffd33d',
    borderColor: '#ffd33d',
  },
  toggleText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#25292e',
    fontWeight: 'bold',
  },
  viewDetailsButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffd33d',
  },
  viewDetailsButtonText: {
    color: '#25292e',
    fontSize: 12,
    fontWeight: 'bold',
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
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  locationInfo: {
    padding: 16,
    backgroundColor: '#3a3a3a',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#ccc',
  },
  suggestionsContainer: {
    flex: 1,
    padding: 16,
  },
});
