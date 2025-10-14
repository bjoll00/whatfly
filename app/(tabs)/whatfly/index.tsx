import { Picker } from '@react-native-picker/picker';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import LocationPicker from '../../../components/LocationPicker';
import PopularFliesSection from '../../../components/PopularFliesSection';
import PremiumUpgradeModal from '../../../components/PremiumUpgradeModal';
import WaterConditionsInput from '../../../components/WaterConditionsInput';
import { useAuth } from '../../../lib/AuthContext';
import { APP_CONFIG } from '../../../lib/appConfig';
import { autoDetectionService } from '../../../lib/autoDetectionService';
import { getFlyImage, hasFlyImage } from '../../../lib/flyImages';
import { flySuggestionService } from '../../../lib/flySuggestionService';
import { FishingConditions, FlySuggestion, WeatherData } from '../../../lib/types';
import { WaterConditionsService } from '../../../lib/waterConditionsService';
import { weatherService } from '../../../lib/weatherService';

export default function WhatFlyScreen() {
  const { user } = useAuth();
  
  // Mode selection: 'trip' or 'current'
  const [mode, setMode] = useState<'trip' | 'current'>('current');
  
  // Trip planning state
  const [tripDate, setTripDate] = useState<string>('');
  const [tripEndDate, setTripEndDate] = useState<string>('');
  const [isMultiDayTrip, setIsMultiDayTrip] = useState(false);
  const [tripLocation, setTripLocation] = useState<{
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  
  // Conditions state
  const [conditions, setConditions] = useState<Partial<FishingConditions>>({
    location: '',
    latitude: undefined,
    longitude: undefined,
    location_address: undefined,
    weather_conditions: 'sunny',
    water_clarity: 'clear',
    water_level: 'normal',
    water_flow: 'moderate',
    time_of_day: 'morning',
    time_of_year: 'summer',
    water_temperature: undefined,
  });

  // Results state
  const [suggestions, setSuggestions] = useState<FlySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherInsights, setWeatherInsights] = useState<string[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [autoDetectedInfo, setAutoDetectedInfo] = useState<{
    timeDetected: string;
    locationDetected: string;
    weatherDetected: boolean;
    waterEstimated: boolean;
  } | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [waterConditions, setWaterConditions] = useState<any>(null);
  
  // Location state
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  // Date picker modal state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startMonth, setStartMonth] = useState('');
  const [startDay, setStartDay] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endDay, setEndDay] = useState('');
  const [endYear, setEndYear] = useState('');

  const handleInputChange = (field: keyof FishingConditions, value: any) => {
    setConditions(prev => ({ ...prev, [field]: value }));
  };

  // Manual location refresh function
  const refreshLocation = async () => {
    console.log('Manual location refresh requested');
    await getCurrentLocation();
  };

  // Get current location automatically
  const getCurrentLocation = async () => {
    try {
      setIsLocationLoading(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to automatically detect your location.');
        return;
      }

      // Get current location with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      
      // Debug location data
      console.log('Raw location data:', {
        latitude,
        longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      });
      
      // Get address from coordinates
      let address = 'Current Location';
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        
        console.log('Reverse geocode result:', reverseGeocode);
        
        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          address = [place.city, place.region, place.country]
            .filter(Boolean)
            .join(', ') || 'Current Location';
        }
      } catch (error) {
        console.log('Could not get address from coordinates:', error);
        // Fallback: Create a readable address from coordinates
        address = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°W`;
      }

      // Update current location state
      setCurrentLocation({
        latitude,
        longitude,
        address,
      });

      // Update conditions with current location
      setConditions(prev => ({
        ...prev,
        location: address,
        latitude,
        longitude,
        location_address: address,
      }));

      console.log('Current location detected:', { latitude, longitude, address });
      
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Location Error', 'Could not get your current location. You can still select a location manually.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Auto-detect location when component mounts
  useEffect(() => {
    if (mode === 'current' && !currentLocation) {
      getCurrentLocation();
    }
  }, [mode]);

  // Helper functions for date picker
  const getMonths = () => {
    return [
      { label: 'January', value: '01' },
      { label: 'February', value: '02' },
      { label: 'March', value: '03' },
      { label: 'April', value: '04' },
      { label: 'May', value: '05' },
      { label: 'June', value: '06' },
      { label: 'July', value: '07' },
      { label: 'August', value: '08' },
      { label: 'September', value: '09' },
      { label: 'October', value: '10' },
      { label: 'November', value: '11' },
      { label: 'December', value: '12' },
    ];
  };

  const getDays = (month: string, year: string) => {
    if (!month || !year) return [];
    
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const days = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        label: i.toString(),
        value: i.toString().padStart(2, '0')
      });
    }
    
    return days;
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Show current year and next 2 years
    for (let i = 0; i < 3; i++) {
      const year = currentYear + i;
      years.push({
        label: year.toString(),
        value: year.toString()
      });
    }
    
    return years;
  };

  const openDatePicker = () => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    // Set default start date (today)
    setStartMonth((today.getMonth() + 1).toString().padStart(2, '0'));
    setStartDay(today.getDate().toString().padStart(2, '0'));
    setStartYear(today.getFullYear().toString());
    
    // Set default end date (tomorrow)
    setEndMonth((tomorrow.getMonth() + 1).toString().padStart(2, '0'));
    setEndDay(tomorrow.getDate().toString().padStart(2, '0'));
    setEndYear(tomorrow.getFullYear().toString());
    
    setShowDatePicker(true);
  };

  const confirmDates = () => {
    if (!startMonth || !startDay || !startYear || !endMonth || !endDay || !endYear) {
      Alert.alert('Invalid Dates', 'Please select all date fields.');
      return;
    }

    const startDateString = `${startYear}-${startMonth}-${startDay}`;
    const endDateString = `${endYear}-${endMonth}-${endDay}`;
    
    const startDateObj = new Date(startDateString);
    const endDateObj = new Date(endDateString);

    if (endDateObj < startDateObj) {
      Alert.alert('Invalid Date', 'End date must be after start date.');
      return;
    }

    setTripDate(startDateString);
    setTripEndDate(endDateString);
    setIsMultiDayTrip(true);
    setShowDatePicker(false);

    Alert.alert(
      'Dates Selected!',
      `Trip dates: ${startDateObj.toLocaleDateString()} - ${endDateObj.toLocaleDateString()}`
    );
  };

  const handleLocationSelect = async (location: {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    setConditions(prev => ({
      ...prev,
      location: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      location_address: location.address,
    }));

    // Fetch weather data for the selected location
    await fetchWeatherData(location.latitude, location.longitude);
  };

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      setIsLoadingWeather(true);
      const weather = await weatherService.getWeatherForLocation(latitude, longitude);
      
      if (weather) {
        setWeatherData(weather);
        
        // Convert weather to fishing conditions and update form
        const fishingConditions = weatherService.convertToFishingConditions(weather);
        setConditions(prev => ({
          ...prev,
          weather_conditions: fishingConditions.weather_conditions,
          wind_speed: fishingConditions.wind_speed,
          wind_direction: fishingConditions.wind_direction,
          air_temperature_range: fishingConditions.air_temperature_range,
        }));

        // Get fishing insights
        const insights = weatherService.getFishingInsights(weather);
        setWeatherInsights(insights);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      Alert.alert('Weather Error', 'Could not fetch weather data for this location. You can still enter conditions manually.');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const getSuggestions = async () => {
    if (!conditions.location) {
      Alert.alert('Missing Information', 'Please enter a location.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Getting suggestions for conditions:', conditions);
      const result = await flySuggestionService.getSuggestions(
        conditions as FishingConditions,
        user?.id
      );
      
      console.log('Received suggestions result:', result);
      
      if (!result.canPerform && APP_CONFIG.ENABLE_USAGE_LIMITS) {
        // User hit usage limit
        setUsageInfo(result.usageInfo);
        setShowUpgradeModal(true);
        return;
      }
      
      setSuggestions(result.suggestions);
      setUsageInfo(result.usageInfo);
      
      if (result.suggestions.length === 0) {
        Alert.alert('No Suggestions', 'No fly suggestions found. The database might be empty or there might be a connection issue.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get fly suggestions. Please try again.');
      console.error('Error getting suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setConditions({
      location: '',
      latitude: undefined,
      longitude: undefined,
      location_address: undefined,
      weather_conditions: 'sunny',
      water_clarity: 'clear',
      water_level: 'normal',
      water_flow: 'moderate',
      time_of_day: 'morning',
      time_of_year: 'summer',
      water_temperature: undefined,
    });
    setTripDate('');
    setTripEndDate('');
    setIsMultiDayTrip(false);
    setTripLocation(null);
    setSuggestions([]);
    setWeatherData(null);
    setWeatherInsights([]);
    setAutoDetectedInfo(null);
    setSmartSuggestions([]);
  };

  // Handle trip location selection
  const handleTripLocationSelect = (location: {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    setTripLocation(location);
  };

  // Handle current location quick suggest
  const handleCurrentLocationSuggest = async () => {
    setIsLoading(true);
    try {
      console.log('Starting current location quick suggest...');
      
      // Use default location if none selected
      const latitude = conditions.latitude || 40.7608; // Salt Lake City default
      const longitude = conditions.longitude || -111.8910;
      const locationName = conditions.location || 'Current Location';
      
      // Auto-detect all conditions
      const autoDetected = await autoDetectionService.getAutoDetectedConditions(
        latitude,
        longitude,
        locationName
      );
      
      console.log('Auto-detected conditions:', autoDetected);
      
      // Fetch real-time water conditions
      console.log('Fetching real-time water conditions...');
      const waterConditions = await WaterConditionsService.getWaterConditions({ latitude, longitude });
      setWaterConditions(waterConditions);
      
      if (waterConditions) {
        console.log('Water conditions found:', {
          flowRate: waterConditions.flowRate,
          waterTemperature: waterConditions.waterTemperature,
          gaugeHeight: waterConditions.gaugeHeight,
          stationName: waterConditions.stationName,
          dataSource: waterConditions.dataSource
        });
        
        // Enhance conditions with real water data
        const enhancedConditions = {
          ...autoDetected.conditions,
          water_data: waterConditions,
          water_temperature: waterConditions.waterTemperature || autoDetected.conditions.water_temperature,
        };
        setConditions(enhancedConditions);
      } else {
        setConditions(autoDetected.conditions);
      }
      
      setAutoDetectedInfo(autoDetected.autoDetectedInfo);
      
      // Get weather data if available
      if (autoDetected.weatherData) {
        setWeatherData(autoDetected.weatherData);
        const insights = weatherService.getFishingInsights(autoDetected.weatherData);
        setWeatherInsights(insights);
      }
      
      // Get smart suggestions
      const smartSuggestions = autoDetectionService.getSmartSuggestions(autoDetected.conditions);
      setSmartSuggestions(smartSuggestions);
      
      // Get fly suggestions
      const result = await flySuggestionService.getSuggestions(
        autoDetected.conditions as FishingConditions,
        user?.id
      );
      
      console.log('Received suggestions result:', result);
      
      if (!result.canPerform && APP_CONFIG.ENABLE_USAGE_LIMITS) {
        setUsageInfo(result.usageInfo);
        setShowUpgradeModal(true);
        return;
      }
      
      setSuggestions(result.suggestions);
      setUsageInfo(result.usageInfo);
      
      if (result.suggestions.length === 0) {
        Alert.alert('No Suggestions', 'No fly suggestions found. The database might be empty or there might be a connection issue.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location suggestions. Please try again.');
      console.error('Error getting current location suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle trip planning suggestions
  const handleTripPlanningSuggest = async () => {
    if (!tripDate || !tripLocation) {
      Alert.alert('Missing Information', 'Please select both dates and location for your trip.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting trip planning suggestions...');
      
      // Calculate conditions for the trip date
      const tripDateObj = new Date(tripDate);
      const tripHour = 10; // Assume mid-morning trip
      
      // Determine time of day for trip
      const getTimeOfDay = (hour: number): FishingConditions['time_of_day'] => {
        if (hour >= 5 && hour < 8) return 'dawn';
        if (hour >= 8 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'midday';
        if (hour >= 17 && hour < 20) return 'afternoon';
        if (hour >= 20 && hour < 22) return 'dusk';
        return 'night';
      };
      
      // Determine time of year for trip
      const getTimeOfYear = (date: Date): FishingConditions['time_of_year'] => {
        const month = date.getMonth() + 1;
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

      // Get weather forecast for trip date (if available)
      let forecastWeather: WeatherData | null = null;
      try {
        const forecast = await weatherService.getWeatherForecast(
          tripLocation.latitude, 
          tripLocation.longitude, 
          5
        );
        // Use forecast for the trip date (simplified - in reality you'd match the exact date)
        if (forecast.length > 0) {
          forecastWeather = forecast[0]; // Use first forecast day
        }
      } catch (error) {
        console.error('Error getting forecast:', error);
      }

      // Build trip conditions
      const tripConditions: Partial<FishingConditions> = {
        location: tripLocation.name,
        latitude: tripLocation.latitude,
        longitude: tripLocation.longitude,
        location_address: tripLocation.address,
        date: tripDate,
        time_of_day: getTimeOfDay(tripHour),
        time_of_year: getTimeOfYear(tripDateObj),
        weather_conditions: forecastWeather ? 
          weatherService.convertToFishingConditions(forecastWeather).weather_conditions : 
          'sunny',
        wind_speed: forecastWeather ? 
          weatherService.convertToFishingConditions(forecastWeather).wind_speed : 
          'light',
        wind_direction: forecastWeather ? 
          weatherService.convertToFishingConditions(forecastWeather).wind_direction : 
          'variable',
        air_temperature_range: forecastWeather ? 
          weatherService.convertToFishingConditions(forecastWeather).air_temperature_range : 
          'moderate',
        water_clarity: 'clear',
        water_level: 'normal',
        water_flow: 'moderate',
        water_temperature: forecastWeather ? Math.max(32, forecastWeather.temperature - 10) : 65,
      };

      // Update conditions
      setConditions(tripConditions);
      setWeatherData(forecastWeather);
      
      // Set auto-detected info for trip
      setAutoDetectedInfo({
        timeDetected: `${getTimeOfDay(tripHour)} on ${getTimeOfYear(tripDateObj)} ${tripDate}`,
        locationDetected: tripLocation.name,
        weatherDetected: !!forecastWeather,
        waterEstimated: true,
      });

      // Get smart suggestions for trip
      const smartSuggestions = autoDetectionService.getSmartSuggestions(tripConditions);
      setSmartSuggestions(smartSuggestions);

      // Get fly suggestions
      const result = await flySuggestionService.getSuggestions(
        tripConditions as FishingConditions,
        user?.id
      );
      
      if (!result.canPerform && APP_CONFIG.ENABLE_USAGE_LIMITS) {
        setUsageInfo(result.usageInfo);
        setShowUpgradeModal(true);
        return;
      }
      
      setSuggestions(result.suggestions);
      setUsageInfo(result.usageInfo);
      
      if (result.suggestions.length === 0) {
        Alert.alert('No Suggestions', 'No fly suggestions found for your trip.');
      } else {
        Alert.alert(
          'Trip Planning Complete!', 
          `Found ${result.suggestions.length} fly suggestions for your ${tripDate} trip to ${tripLocation.name}.`
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get trip planning suggestions. Please try again.');
      console.error('Error getting trip suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlyLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Could not open the link. Please try again.');
    }
  };



  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What Fly Should I Use?</Text>
        <Text style={styles.subtitle}>
          Choose your fishing scenario to get personalized fly suggestions
        </Text>
        
        {/* Mode Selection */}
        <View style={styles.modeSelectionContainer}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'current' && styles.modeButtonActive]}
            onPress={() => setMode('current')}
          >
            <Text style={[styles.modeButtonIcon, mode === 'current' && styles.modeButtonIconActive]}>📍</Text>
            <Text style={[styles.modeButtonTitle, mode === 'current' && styles.modeButtonTitleActive]}>Current Location</Text>
            <Text style={[styles.modeButtonSubtitle, mode === 'current' && styles.modeButtonSubtitleActive]}>
              Fish right now
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modeButton, mode === 'trip' && styles.modeButtonActive]}
            onPress={() => setMode('trip')}
          >
            <Text style={[styles.modeButtonIcon, mode === 'trip' && styles.modeButtonIconActive]}>🗓️</Text>
            <Text style={[styles.modeButtonTitle, mode === 'trip' && styles.modeButtonTitleActive]}>Plan a Trip</Text>
            <Text style={[styles.modeButtonSubtitle, mode === 'trip' && styles.modeButtonSubtitleActive]}>
              Future fishing
            </Text>
          </TouchableOpacity>
        </View>


        {/* Trip Planning Mode */}
        {mode === 'trip' && (
          <View style={styles.modeContent}>
            {/* Trip Date Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Trip Dates</Text>
              
              {/* Select Dates Button */}
              <TouchableOpacity
                style={styles.selectDatesButton}
                onPress={openDatePicker}
              >
                <Text style={styles.selectDatesIcon}>📅</Text>
                <View style={styles.selectDatesTextContainer}>
                  <Text style={styles.selectDatesTitle}>Select Dates</Text>
                  <Text style={styles.selectDatesSubtitle}>
                    Choose your fishing trip dates
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Quick Date Presets */}
              <View style={styles.quickDatesContainer}>
                <Text style={styles.quickDatesLabel}>Quick Options:</Text>
                <View style={styles.quickDatesButtons}>
                  <TouchableOpacity
                    style={styles.quickDateButton}
                    onPress={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      const dayAfter = new Date();
                      dayAfter.setDate(dayAfter.getDate() + 2);
                      setTripDate(tomorrow.toISOString().split('T')[0]);
                      setTripEndDate(dayAfter.toISOString().split('T')[0]);
                      setIsMultiDayTrip(true);
                    }}
                  >
                    <Text style={styles.quickDateButtonText}>Tomorrow + 1</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.quickDateButton}
                    onPress={() => {
                      const nextWeekend = new Date();
                      const daysUntilSaturday = (6 - nextWeekend.getDay()) % 7;
                      const saturday = new Date(nextWeekend);
                      saturday.setDate(nextWeekend.getDate() + (daysUntilSaturday || 7));
                      const sunday = new Date(saturday);
                      sunday.setDate(saturday.getDate() + 1);
                      setTripDate(saturday.toISOString().split('T')[0]);
                      setTripEndDate(sunday.toISOString().split('T')[0]);
                      setIsMultiDayTrip(true);
                    }}
                  >
                    <Text style={styles.quickDateButtonText}>Weekend</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.quickDateButton}
                    onPress={() => {
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      const weekAfter = new Date(nextWeek);
                      weekAfter.setDate(nextWeek.getDate() + 7);
                      setTripDate(nextWeek.toISOString().split('T')[0]);
                      setTripEndDate(weekAfter.toISOString().split('T')[0]);
                      setIsMultiDayTrip(true);
                    }}
                  >
                    <Text style={styles.quickDateButtonText}>Next Week</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Trip Summary */}
              {tripDate && (
                <View style={styles.tripSummaryContainer}>
                  <Text style={styles.tripSummaryLabel}>Trip Summary:</Text>
                  <Text style={styles.tripSummaryText}>
                    {tripEndDate && tripEndDate !== tripDate ? (
                      `${new Date(tripDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })} - ${new Date(tripEndDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}`
                    ) : (
                      new Date(tripDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    )}
                  </Text>
                  {tripEndDate && tripEndDate !== tripDate && (
                    <Text style={styles.tripDurationText}>
                      Duration: {Math.ceil((new Date(tripEndDate).getTime() - new Date(tripDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Trip Location Selection */}
            <LocationPicker
              onLocationSelect={handleTripLocationSelect}
              currentLocation={tripLocation ? {
                name: tripLocation.name,
                latitude: tripLocation.latitude,
                longitude: tripLocation.longitude,
                address: tripLocation.address,
              } : undefined}
            />

            {/* Trip Planning Button */}
            <TouchableOpacity
              style={[
                styles.tripPlanningButton,
                (!tripDate || !tripLocation || isLoading) && styles.tripPlanningButtonDisabled
              ]}
              onPress={handleTripPlanningSuggest}
              disabled={!tripDate || !tripLocation || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#25292e" size="small" />
              ) : (
                <>
                  <Text style={styles.tripPlanningIcon}>🎒</Text>
                  <View style={styles.tripPlanningTextContainer}>
                    <Text style={styles.tripPlanningTitle}>Plan My Trip</Text>
                    <Text style={styles.tripPlanningSubtitle}>
                      Get fly suggestions for your planned trip
                    </Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {/* Advanced Options (Only show in current mode for manual override) */}
        {mode === 'current' && (
          <View style={styles.advancedSection}>
            <Text style={styles.advancedSectionTitle}>Advanced Options</Text>
            <Text style={styles.advancedSectionSubtitle}>
              Override auto-detected conditions if needed
            </Text>
            
            {/* Current Location Status */}
            {isLocationLoading && (
              <View style={styles.locationStatusContainer}>
                <ActivityIndicator size="small" color="#ffd33d" />
                <Text style={styles.locationStatusText}>Detecting your location...</Text>
              </View>
            )}
            
            {currentLocation && !isLocationLoading && (
              <View style={styles.locationStatusContainer}>
                <Text style={styles.locationStatusText}>📍 Current Location: {currentLocation.address}</Text>
                <Text style={styles.locationCoordsText}>
                  Coordinates: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </Text>
                <TouchableOpacity
                  style={styles.useCurrentLocationButton}
                  onPress={refreshLocation}
                >
                  <Text style={styles.useCurrentLocationButtonText}>🔄 Refresh Location</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Location Picker */}
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              currentLocation={conditions.location ? {
                name: conditions.location,
                latitude: conditions.latitude || 0,
                longitude: conditions.longitude || 0,
                address: conditions.location_address,
              } : undefined}
            />

        {/* Weather Data Display */}
        {weatherData && (
          <View style={styles.weatherContainer}>
            <Text style={styles.weatherTitle}>🌤️ Current Weather</Text>
            <View style={styles.weatherGrid}>
              <View style={styles.weatherItem}>
                <Text style={styles.weatherLabel}>Temperature</Text>
                <Text style={styles.weatherValue}>{weatherData.temperature}°F</Text>
              </View>
              <View style={styles.weatherItem}>
                <Text style={styles.weatherLabel}>Conditions</Text>
                <Text style={styles.weatherValue}>{weatherData.weather_description}</Text>
              </View>
              <View style={styles.weatherItem}>
                <Text style={styles.weatherLabel}>Wind</Text>
                <Text style={styles.weatherValue}>{weatherData.wind_speed} mph</Text>
              </View>
              <View style={styles.weatherItem}>
                <Text style={styles.weatherLabel}>Humidity</Text>
                <Text style={styles.weatherValue}>{weatherData.humidity}%</Text>
              </View>
            </View>
            
            {/* Weather Insights */}
            {weatherInsights.length > 0 && (
              <View style={styles.insightsContainer}>
                <Text style={styles.insightsTitle}>💡 Fishing Insights</Text>
                {weatherInsights.map((insight, index) => (
                  <Text key={index} style={styles.insightText}>{insight}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Loading Weather Indicator */}
        {isLoadingWeather && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ffd33d" />
            <Text style={styles.loadingText}>Loading weather data...</Text>
          </View>
        )}

        {/* Auto-Detected Information */}
        {autoDetectedInfo && (
          <View style={styles.autoDetectedContainer}>
            <Text style={styles.autoDetectedTitle}>🎯 Auto-Detected Conditions</Text>
            <View style={styles.autoDetectedGrid}>
              <View style={styles.autoDetectedItem}>
                <Text style={styles.autoDetectedLabel}>Time</Text>
                <Text style={styles.autoDetectedValue}>{autoDetectedInfo.timeDetected}</Text>
              </View>
              <View style={styles.autoDetectedItem}>
                <Text style={styles.autoDetectedLabel}>Location</Text>
                <Text style={styles.autoDetectedValue}>{autoDetectedInfo.locationDetected}</Text>
              </View>
              <View style={styles.autoDetectedItem}>
                <Text style={styles.autoDetectedLabel}>Weather</Text>
                <Text style={styles.autoDetectedValue}>
                  {autoDetectedInfo.weatherDetected ? '✅ Real-time' : '📊 Estimated'}
                </Text>
              </View>
              <View style={styles.autoDetectedItem}>
                <Text style={styles.autoDetectedLabel}>Water</Text>
                <Text style={styles.autoDetectedValue}>
                  {autoDetectedInfo.waterEstimated ? '🧠 Smart Estimate' : '📝 Manual'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Real-Time Water Conditions */}
        {waterConditions && (
          <View style={styles.waterConditionsCard}>
            <Text style={styles.waterConditionsTitle}>🌊 Real-Time Water Conditions</Text>
            <View style={styles.waterConditionsContent}>
              <Text style={styles.waterConditionsSummary}>
                {WaterConditionsService.getWaterConditionSummary(waterConditions)}
              </Text>
              
              {waterConditions.flowRate && (
                <Text style={styles.waterConditionsDetail}>
                  Flow Rate: {waterConditions.flowRate} cfs
                </Text>
              )}
              {waterConditions.waterTemperature && (
                <Text style={styles.waterConditionsDetail}>
                  Water Temp: {waterConditions.waterTemperature}°F
                </Text>
              )}
              {waterConditions.gaugeHeight && (
                <Text style={styles.waterConditionsDetail}>
                  Gauge Height: {waterConditions.gaugeHeight} ft
                </Text>
              )}
              {waterConditions.stationName && (
                <Text style={styles.waterConditionsDetail}>
                  Station: {waterConditions.stationName}
                </Text>
              )}
              
              {/* Water condition rating */}
              {(() => {
                const rating = WaterConditionsService.getWaterConditionRating(waterConditions);
                return (
                  <View style={styles.waterRatingContainer}>
                    <Text style={[
                      styles.waterRatingText,
                      { color: rating.rating === 'EXCELLENT' ? '#4CAF50' :
                               rating.rating === 'GOOD' ? '#8BC34A' :
                               rating.rating === 'FAIR' ? '#FF9800' : '#F44336' }
                    ]}>
                      🎣 {rating.description}
                    </Text>
                    {rating.factors.map((factor, index) => (
                      <Text key={index} style={styles.waterFactorText}>• {factor}</Text>
                    ))}
                  </View>
                );
              })()}
              
              <View style={styles.dataSourceContainer}>
                <Text style={styles.dataSourceText}>
                  Data Source: {waterConditions.dataSource || 'Unknown'}
                </Text>
                {waterConditions.lastUpdated && (
                  <Text style={styles.dataSourceText}>
                    Updated: {new Date(waterConditions.lastUpdated).toLocaleString()}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Smart Suggestions */}
        {smartSuggestions.length > 0 && (
          <View style={styles.smartSuggestionsContainer}>
            <Text style={styles.smartSuggestionsTitle}>💡 Smart Fishing Tips</Text>
            {smartSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.smartSuggestionItem}>
                <Text style={styles.smartSuggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}

            {/* Water Conditions Input */}
            <WaterConditionsInput
              conditions={conditions}
              onConditionsChange={handleInputChange}
              showAdvanced={true}
            />

            {/* Manual Get Suggestions Button */}
            <TouchableOpacity
              style={[styles.suggestButton, isLoading && styles.suggestButtonDisabled]}
              onPress={getSuggestions}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#25292e" size="small" />
              ) : (
                <Text style={styles.suggestButtonText}>Get Manual Suggestions</Text>
              )}
            </TouchableOpacity>

            {/* Clear Form Button */}
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearForm}
            >
              <Text style={styles.clearButtonText}>Clear Form</Text>
            </TouchableOpacity>
          </View>
        )}


        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>Recommended Flies</Text>
            {suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.flyName}>{suggestion.fly.name}</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      {Math.round(suggestion.confidence)}%
                    </Text>
                  </View>
                </View>
                
                {hasFlyImage(suggestion.fly.name) && (
                  <View style={styles.flyImageContainer}>
                    <Image 
                      source={getFlyImage(suggestion.fly.name)} 
                      style={styles.flyImage}
                      contentFit="contain"
                    />
                  </View>
                )}
                
                <Text style={styles.flyType}>
                  {suggestion.fly.type.toUpperCase()} • Size {suggestion.fly.size} • {suggestion.fly.color}
                </Text>
                <Text style={styles.flyDescription}>
                  {suggestion.fly.description || 'No description available'}
                </Text>
                <Text style={styles.reasonText}>
                  💡 {suggestion.reason}
                </Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statText}>
                    Success Rate: {Math.round(suggestion.fly.success_rate * 100)}%
                  </Text>
                  <Text style={styles.statText}>
                    Uses: {suggestion.fly.total_uses}
                  </Text>
                </View>
                {suggestion.fly.link && (
                  <TouchableOpacity 
                    style={styles.learnMoreButton}
                    onPress={() => handleFlyLink(suggestion.fly.link!)}
                  >
                    <Text style={styles.learnMoreText}>
                      🔗 Learn More & Purchase
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Popular Flies Section */}
        <PopularFliesSection />

        {suggestions.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Select your fishing conditions above to get personalized fly suggestions!
            </Text>
          </View>
        )}

        {/* Usage Info Display */}
        {usageInfo && user && (
          <View style={styles.usageInfo}>
            <Text style={styles.usageText}>
              {usageInfo.usage.isPremium 
                ? '🌟 Premium - Unlimited suggestions'
                : `📊 ${usageInfo.usage.flySuggestionsUsed}/${usageInfo.limit} suggestions used today`
              }
            </Text>
            {!usageInfo.usage.isPremium && (
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={() => setShowUpgradeModal(true)}
              >
                <Text style={styles.upgradeButtonText}>Upgrade for Unlimited</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={(planId) => {
          // TODO: Implement subscription upgrade
          console.log('Upgrade to plan:', planId);
          setShowUpgradeModal(false);
        }}
        feature="unlimited_fly_suggestions"
      />

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Trip Dates</Text>
            
            {/* Start Date */}
            <View style={styles.dateSection}>
              <Text style={styles.dateSectionTitle}>Start Date</Text>
              <View style={styles.datePickerRow}>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Month</Text>
                  <Picker
                    selectedValue={startMonth}
                    onValueChange={setStartMonth}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Select Month" value="" />
                    {getMonths().map(month => (
                      <Picker.Item key={month.value} label={month.label} value={month.value} />
                    ))}
                  </Picker>
                </View>
                
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Day</Text>
                  <Picker
                    selectedValue={startDay}
                    onValueChange={setStartDay}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Day" value="" />
                    {getDays(startMonth, startYear).map(day => (
                      <Picker.Item key={day.value} label={day.label} value={day.value} />
                    ))}
                  </Picker>
                </View>
                
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Year</Text>
                  <Picker
                    selectedValue={startYear}
                    onValueChange={setStartYear}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Year" value="" />
                    {getYears().map(year => (
                      <Picker.Item key={year.value} label={year.label} value={year.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            {/* End Date */}
            <View style={styles.dateSection}>
              <Text style={styles.dateSectionTitle}>End Date</Text>
              <View style={styles.datePickerRow}>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Month</Text>
                  <Picker
                    selectedValue={endMonth}
                    onValueChange={setEndMonth}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Select Month" value="" />
                    {getMonths().map(month => (
                      <Picker.Item key={month.value} label={month.label} value={month.value} />
                    ))}
                  </Picker>
                </View>
                
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Day</Text>
                  <Picker
                    selectedValue={endDay}
                    onValueChange={setEndDay}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Day" value="" />
                    {getDays(endMonth, endYear).map(day => (
                      <Picker.Item key={day.value} label={day.label} value={day.value} />
                    ))}
                  </Picker>
                </View>
                
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Year</Text>
                  <Picker
                    selectedValue={endYear}
                    onValueChange={setEndYear}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Year" value="" />
                    {getYears().map(year => (
                      <Picker.Item key={year.value} label={year.label} value={year.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmDates}
              >
                <Text style={styles.confirmButtonText}>Confirm Dates</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    overflow: 'hidden',
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  picker: {
    color: '#fff',
    height: 60,
    backgroundColor: 'transparent',
    width: '100%',
  },
  pickerItem: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    height: 60,
    lineHeight: 60,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 0,
    flex: 1,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#666',
    marginRight: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestButton: {
    backgroundColor: '#ffd33d',
    marginLeft: 10,
  },
  suggestButtonDisabled: {
    backgroundColor: '#666',
  },
  suggestButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsSection: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  suggestionCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#555',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  flyImageContainer: {
    alignItems: 'center',
    marginVertical: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
  },
  flyImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  confidenceBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  flyType: {
    fontSize: 14,
    color: '#ffd33d',
    marginBottom: 8,
  },
  flyDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#999',
  },
  learnMoreButton: {
    backgroundColor: '#ffd33d',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  learnMoreText: {
    color: '#25292e',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  usageInfo: {
    backgroundColor: '#1a1d21',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  usageText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: '#ffd33d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  upgradeButtonText: {
    color: '#1a1d21',
    fontSize: 14,
    fontWeight: '600',
  },
  weatherContainer: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#555',
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weatherItem: {
    width: '48%',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  weatherLabel: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd33d',
  },
  insightsContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 4,
    lineHeight: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  loadingText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 8,
  },
  quickSuggestButton: {
    backgroundColor: '#ffd33d',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffed4e',
    shadowColor: '#ffd33d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  quickSuggestButtonDisabled: {
    backgroundColor: '#666',
    borderColor: '#888',
  },
  quickSuggestIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  quickSuggestTextContainer: {
    flex: 1,
  },
  quickSuggestTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#25292e',
    marginBottom: 4,
  },
  quickSuggestSubtitle: {
    fontSize: 14,
    color: '#25292e',
    opacity: 0.8,
  },
  autoDetectedContainer: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#555',
  },
  autoDetectedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
    textAlign: 'center',
  },
  autoDetectedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  autoDetectedItem: {
    width: '48%',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  autoDetectedLabel: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 4,
    fontWeight: '600',
  },
  autoDetectedValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffd33d',
    textAlign: 'center',
  },
  smartSuggestionsContainer: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#555',
  },
  smartSuggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 12,
    textAlign: 'center',
  },
  smartSuggestionItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  smartSuggestionText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  modeSelectionContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#555',
  },
  modeButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  modeButtonActive: {
    backgroundColor: '#ffd33d',
  },
  modeButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  modeButtonIconActive: {
    // Icon color stays the same
  },
  modeButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ccc',
    marginBottom: 4,
  },
  modeButtonTitleActive: {
    color: '#25292e',
  },
  modeButtonSubtitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  modeButtonSubtitleActive: {
    color: '#25292e',
    opacity: 0.8,
  },
  modeContent: {
    marginBottom: 20,
  },
  advancedSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#555',
  },
  advancedSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 8,
    textAlign: 'center',
  },
  advancedSectionSubtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  selectDatesButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A9EFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selectDatesIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  selectDatesTextContainer: {
    flex: 1,
  },
  selectDatesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  selectDatesSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  quickDatesContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  quickDatesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 10,
    textAlign: 'center',
  },
  quickDatesButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#555',
    alignItems: 'center',
  },
  quickDateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tripSummaryContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginTop: 10,
  },
  tripSummaryLabel: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tripSummaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tripDurationText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  tripPlanningButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#66BB6A',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tripPlanningButtonDisabled: {
    backgroundColor: '#666',
    borderColor: '#888',
  },
  tripPlanningIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  tripPlanningTextContainer: {
    flex: 1,
  },
  tripPlanningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  tripPlanningSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 24,
    width: '95%',
    maxWidth: 500,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
    borderWidth: 1,
    borderColor: '#888',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3a3a3a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  locationStatusText: {
    color: '#ffd33d',
    fontSize: 14,
    flex: 1,
  },
  locationCoordsText: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  useCurrentLocationButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  useCurrentLocationButtonText: {
    color: '#25292e',
    fontSize: 12,
    fontWeight: 'bold',
  },
  waterConditionsCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  waterConditionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 15,
  },
  waterConditionsContent: {
    gap: 10,
  },
  waterConditionsSummary: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 10,
  },
  waterConditionsDetail: {
    fontSize: 14,
    color: '#ccc',
  },
  waterRatingContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  waterRatingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  waterFactorText: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 2,
  },
  dataSourceContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  dataSourceText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});