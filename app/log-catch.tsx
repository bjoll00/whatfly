import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import {
  COMMON_FISH_SPECIES,
  createCatch,
  CreateCatchInput,
  WATER_CONDITIONS,
  WEATHER_CONDITIONS,
} from '../lib/catchService';

export default function LogCatchScreen() {
  const { user } = useAuth();
  
  // Form state
  const [fishSpecies, setFishSpecies] = useState('');
  const [sizeLength, setSizeLength] = useState('');
  const [sizeWeight, setSizeWeight] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [flyUsed, setFlyUsed] = useState('');
  const [waterTemperature, setWaterTemperature] = useState('');
  const [waterConditions, setWaterConditions] = useState('');
  const [weatherConditions, setWeatherConditions] = useState('');
  const [airTemperature, setAirTemperature] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [caughtAt, setCaughtAt] = useState(new Date());
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
  const [showWaterConditions, setShowWaterConditions] = useState(false);
  const [showWeatherConditions, setShowWeatherConditions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.authPrompt}>
          <Ionicons name="fish-outline" size={64} color="#666" />
          <Text style={styles.authTitle}>Sign In Required</Text>
          <Text style={styles.authSubtitle}>You need an account to log catches</Text>
          <TouchableOpacity style={styles.authButton} onPress={() => router.push('/auth')}>
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      // Try to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const parts = [];
        if (address.name && address.name !== address.city) parts.push(address.name);
        if (address.city) parts.push(address.city);
        if (address.region) parts.push(address.region);
        setLocationName(parts.join(', ') || 'Current Location');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const pickPhoto = async () => {
    Alert.alert('Add Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (permission.granted) {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              setPhotoUri(result.assets[0].uri);
            }
          } else {
            Alert.alert('Permission Denied', 'Camera permission is required');
          }
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (permission.granted) {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              setPhotoUri(result.assets[0].uri);
            }
          } else {
            Alert.alert('Permission Denied', 'Photo library permission is required');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const input: CreateCatchInput = {
        fish_species: fishSpecies || undefined,
        size_length: sizeLength ? parseFloat(sizeLength) : undefined,
        size_weight: sizeWeight ? parseFloat(sizeWeight) : undefined,
        location_name: locationName || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        fly_used: flyUsed || undefined,
        water_temperature: waterTemperature ? parseFloat(waterTemperature) : undefined,
        water_conditions: waterConditions || undefined,
        weather_conditions: weatherConditions || undefined,
        air_temperature: airTemperature ? parseFloat(airTemperature) : undefined,
        photo_uri: photoUri || undefined,
        notes: notes || undefined,
        caught_at: caughtAt,
      };

      const { catch: newCatch, error } = await createCatch(user.id, input);

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      Alert.alert('Success', 'Your catch has been logged!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error logging catch:', error);
      Alert.alert('Error', 'Failed to log catch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDropdown = (
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    isVisible: boolean,
    setVisible: (visible: boolean) => void
  ) => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setVisible(!isVisible)}
      >
        <Text style={[styles.dropdownText, !selectedValue && styles.placeholder]}>
          {selectedValue || `Select ${title}`}
        </Text>
        <Ionicons
          name={isVisible ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#ccc"
        />
      </TouchableOpacity>
      {isVisible && (
        <View style={styles.dropdownList}>
          <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownItem,
                  selectedValue === option && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  onSelect(option);
                  setVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedValue === option && styles.dropdownItemTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Catch</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.headerButton, styles.saveButton]}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#25292e" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Photo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo</Text>
          {photoUri ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setPhotoUri(null)}
              >
                <Ionicons name="close-circle" size={28} color="#ff4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickPhoto}>
              <Ionicons name="camera-outline" size={40} color="#ffd33d" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Fish Species */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fish Species</Text>
          {renderDropdown(
            'Species',
            COMMON_FISH_SPECIES,
            fishSpecies,
            setFishSpecies,
            showSpeciesPicker,
            setShowSpeciesPicker
          )}
        </View>

        {/* Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Size</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Length (in)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 18"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                value={sizeLength}
                onChangeText={setSizeLength}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2.5"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                value={sizeWeight}
                onChangeText={setSizeWeight}
              />
            </View>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When Caught</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.halfInput, styles.dateButton]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#ffd33d" />
              <Text style={styles.dateText}>
                {caughtAt.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.halfInput, styles.dateButton]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#ffd33d" />
              <Text style={styles.dateText}>
                {caughtAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>
          {(showDatePicker || showTimePicker) && (
            <DateTimePicker
              value={caughtAt}
              mode={showDatePicker ? 'date' : 'time'}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(false);
                setShowTimePicker(false);
                if (date) setCaughtAt(date);
              }}
            />
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationRow}>
            <TextInput
              style={[styles.input, styles.locationInput]}
              placeholder="e.g. Provo River"
              placeholderTextColor="#666"
              value={locationName}
              onChangeText={setLocationName}
            />
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={getCurrentLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color="#ffd33d" />
              ) : (
                <Ionicons name="locate" size={24} color="#ffd33d" />
              )}
            </TouchableOpacity>
          </View>
          {latitude && longitude && (
            <Text style={styles.coordsText}>
              GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </Text>
          )}
        </View>

        {/* Fly Used */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fly Used</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Elk Hair Caddis #14"
            placeholderTextColor="#666"
            value={flyUsed}
            onChangeText={setFlyUsed}
          />
        </View>

        {/* Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conditions</Text>
          
          {/* Weather */}
          <Text style={styles.inputLabel}>Weather</Text>
          {renderDropdown(
            'Weather',
            WEATHER_CONDITIONS,
            weatherConditions,
            setWeatherConditions,
            showWeatherConditions,
            setShowWeatherConditions
          )}

          {/* Air Temperature */}
          <View style={styles.tempRow}>
            <Text style={styles.inputLabel}>Air Temp (°F)</Text>
            <TextInput
              style={[styles.input, styles.tempInput]}
              placeholder="e.g. 72"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={airTemperature}
              onChangeText={setAirTemperature}
            />
          </View>

          {/* Water Conditions */}
          <Text style={[styles.inputLabel, { marginTop: 12 }]}>Water Conditions</Text>
          {renderDropdown(
            'Water',
            WATER_CONDITIONS,
            waterConditions,
            setWaterConditions,
            showWaterConditions,
            setShowWaterConditions
          )}

          {/* Water Temperature */}
          <View style={styles.tempRow}>
            <Text style={styles.inputLabel}>Water Temp (°F)</Text>
            <TextInput
              style={[styles.input, styles.tempInput]}
              placeholder="e.g. 55"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={waterTemperature}
              onChangeText={setWaterTemperature}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Any additional details about this catch..."
            placeholderTextColor="#666"
            multiline
            maxLength={500}
            value={notes}
            onChangeText={setNotes}
          />
          <Text style={styles.charCount}>{notes.length}/500</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelText: {
    color: '#ccc',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#ffd33d',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffd33d',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  // Photo styles
  photoContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#25292e',
    borderRadius: 14,
  },
  addPhotoButton: {
    width: 200,
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#444',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  addPhotoText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  // Date & Time styles
  dateButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  // Location styles
  locationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationInput: {
    flex: 1,
  },
  gpsButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coordsText: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  // Dropdown styles
  dropdownContainer: {
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  placeholder: {
    color: '#666',
  },
  dropdownList: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(255, 211, 61, 0.1)',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    color: '#ffd33d',
    fontWeight: '600',
  },
  // Temperature styles
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  tempInput: {
    width: 100,
    textAlign: 'center',
  },
  // Notes styles
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  // Auth prompt styles
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  authButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

