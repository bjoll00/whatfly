import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
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
import FlyDetailModal from '../../../components/FlyDetailModal';
import FlySuggestionCard from '../../../components/FlySuggestionCard';
import LocationPicker from '../../../components/LocationPicker';
import PopularFliesSection from '../../../components/PopularFliesSection';
import PremiumUpgradeModal from '../../../components/PremiumUpgradeModal';
import { useAuth } from '../../../lib/AuthContext';
import { useFishing, useLocationData } from '../../../lib/FishingContext';
import { APP_CONFIG } from '../../../lib/appConfig';
import { autoDetectionService } from '../../../lib/autoDetectionService';
import { enhancedFlySuggestionService } from '../../../lib/enhancedFlySuggestionService';
import { flySuggestionService } from '../../../lib/flySuggestionService';
import { FishingConditions, FlySuggestion, WeatherData } from '../../../lib/types';
import { WaterConditionsService } from '../../../lib/waterConditionsService';
import { weatherService } from '../../../lib/weatherService';

export default function WhatFlyScreen() {
  const { user } = useAuth();
  const { fishingConditions, setFishingConditions } = useFishing();
  const { hasLocation, hasCoordinates, hasCompleteData } = useLocationData();
  const params = useLocalSearchParams();
  const hasProcessedParams = useRef<string | false>(false);
  const [isProcessingMapData, setIsProcessingMapData] = useState(false);
  const finalConditionsRef = useRef<Partial<FishingConditions> | null>(null);
  
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
  
  // Use global fishing conditions from context
  const conditions = fishingConditions || {
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
  };

  // Results state
  const [suggestions, setSuggestions] = useState<FlySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  
  // Fly detail modal
  const [selectedFlySuggestion, setSelectedFlySuggestion] = useState<FlySuggestion | null>(null);
  const [showFlyDetailModal, setShowFlyDetailModal] = useState(false);
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
  
  // Comprehensive conditions display state
  const [showComprehensiveConditions, setShowComprehensiveConditions] = useState(false);
  
  // Date picker modal state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startMonth, setStartMonth] = useState('');
  const [startDay, setStartDay] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endDay, setEndDay] = useState('');
  const [endYear, setEndYear] = useState('');

  const handleInputChange = (field: keyof FishingConditions, value: any) => {
    setFishingConditions({ ...conditions, [field]: value });
  };

  // Check for location data from map via URL params
  useEffect(() => {
    const checkLocationParams = () => {
      console.log('checkLocationParams called with params:', {
        lat: params.lat,
        lng: params.lng,
        name: params.name,
        address: params.address,
        fishingConditions: params.fishingConditions ? 'present' : 'missing',
        allKeys: Object.keys(params)
      });
      
      if (params.lat && params.lng) {
        console.log('Found location params from map:', params);
        
        // Check if this is a new location by comparing coordinates
        const currentCoords = `${params.lat},${params.lng}`;
        const lastProcessedCoords = hasProcessedParams.current;
        
        if (currentCoords !== lastProcessedCoords) {
          console.log('New location detected, processing fresh data...');
          setIsProcessingMapData(true);
          
          // Clear previous suggestions for fresh data
          setSuggestions([]);
          setWeatherInsights([]);
          setSmartSuggestions([]);
          setAutoDetectedInfo(null);
          
          // Mark that we've processed these specific coordinates
          hasProcessedParams.current = currentCoords;
          
          // Mark processing as complete
          setIsProcessingMapData(false);
        
        // Parse weather data if available
        let weatherDataFromMap = null;
        if (params.weatherData) {
          try {
            weatherDataFromMap = JSON.parse(params.weatherData as string);
            console.log('Parsed weather data from map:', weatherDataFromMap);
          } catch (error) {
            console.error('Error parsing weather data:', error);
          }
        }
        
        // Parse water conditions if available
        let waterConditionsFromMap = null;
        if (params.waterConditions) {
          try {
            waterConditionsFromMap = JSON.parse(params.waterConditions as string);
            console.log('Parsed water conditions from map:', waterConditionsFromMap);
          } catch (error) {
            console.error('Error parsing water conditions:', error);
          }
        }
        
        // Parse fishing conditions if available
        let fishingConditionsFromMap = null;
        if (params.fishingConditions) {
          try {
            fishingConditionsFromMap = JSON.parse(params.fishingConditions as string);
            console.log('Parsed fishing conditions from map:', fishingConditionsFromMap);
            console.log('Location in fishing conditions:', fishingConditionsFromMap?.location);
            console.log('All fishing conditions keys:', Object.keys(fishingConditionsFromMap || {}));
          } catch (error) {
            console.error('Error parsing fishing conditions:', error);
          }
        }
        
        // Populate the form with the location data from URL params
        setFishingConditions({
          ...conditions,
          location: params.name as string || 'Selected Location',
          latitude: parseFloat(params.lat as string),
          longitude: parseFloat(params.lng as string),
          location_address: params.address as string || `${parseFloat(params.lat as string).toFixed(4)}, ${parseFloat(params.lng as string).toFixed(4)}`
        });
        
        // Set weather data if available
        if (weatherDataFromMap) {
          setWeatherData(weatherDataFromMap);
          
          // Validate weather data structure before processing
          if (weatherDataFromMap && typeof weatherDataFromMap === 'object') {
            // Ensure required fields exist with fallbacks
            const validatedWeatherData = {
              ...weatherDataFromMap,
              weather_condition: weatherDataFromMap.weather_condition || 'sunny',
              temperature: weatherDataFromMap.temperature || 20,
              humidity: weatherDataFromMap.humidity || 50,
              wind_speed: weatherDataFromMap.wind_speed || 0,
              wind_direction: weatherDataFromMap.wind_direction || 0,
              cloudiness: weatherDataFromMap.cloudiness || 0,
              pressure: weatherDataFromMap.pressure || 1013
            };
            
            // Convert weather data to conditions format with error handling
            try {
              const weatherConditions = weatherService.convertToFishingConditions(validatedWeatherData);
              setFishingConditions({
                ...conditions,
                ...weatherConditions
              });
            } catch (error) {
              console.error('Error converting weather data to fishing conditions:', error);
              // Set default weather conditions if conversion fails
              setFishingConditions({
                ...conditions,
                weather_conditions: 'sunny',
                wind_speed: 'light',
                wind_direction: 'variable',
                air_temperature_range: 'moderate'
              });
            }
          } else {
            console.warn('Invalid weather data structure:', weatherDataFromMap);
            // Set default weather conditions if data is invalid
            setFishingConditions({
              ...conditions,
              weather_conditions: 'sunny',
              wind_speed: 'light',
              wind_direction: 'variable',
              air_temperature_range: 'moderate'
            });
          }
        }
        
        // Set water conditions if available
        if (waterConditionsFromMap) {
          setWaterConditions(waterConditionsFromMap);
        }
        
        // Use fishing conditions from map if available (most comprehensive)
        if (fishingConditionsFromMap) {
          console.log('Using comprehensive fishing conditions from map');
          console.log('Map fishing conditions:', fishingConditionsFromMap);
          
          // Ensure location is set from params if not in fishing conditions
          const finalConditions = {
            ...fishingConditionsFromMap,
            location: fishingConditionsFromMap.location || params.name as string || 'Selected Location',
            location_address: fishingConditionsFromMap.location_address || params.address as string || `${parseFloat(params.lat as string).toFixed(4)}, ${parseFloat(params.lng as string).toFixed(4)}`
          };
          
          console.log('Setting final conditions with location:', {
            originalLocation: fishingConditionsFromMap.location,
            paramsName: params.name,
            finalLocation: finalConditions.location
          });
          
          setFishingConditions(finalConditions);
          
          // Wait for state to update before proceeding
          setTimeout(() => {
            console.log('Final conditions set from map:', {
              location: params.name,
              coordinates: `${params.lat}, ${params.lng}`,
              weatherData: weatherDataFromMap,
              waterConditions: waterConditionsFromMap,
              fishingConditions: fishingConditionsFromMap,
              timestamp: params.timestamp
            });
            
            console.log('Final conditions object after processing:', finalConditions);
            
            // Store finalConditions for use in auto-suggestion
            finalConditionsRef.current = finalConditions;
          }, 100);
        } else {
          // Log the final conditions being used
          console.log('Final conditions set from map:', {
            location: params.name,
            coordinates: `${params.lat}, ${params.lng}`,
            weatherData: weatherDataFromMap,
            waterConditions: waterConditionsFromMap,
            fishingConditions: fishingConditionsFromMap,
            timestamp: params.timestamp
          });
        }
        
          // Automatically get fly suggestions after a short delay
          setTimeout(() => {
            console.log('Getting fly suggestions for map location...');
            // Only auto-suggest if we don't have comprehensive map data
            if (!fishingConditionsFromMap) {
              handleCurrentLocationSuggest();
            } else {
              console.log('🎣 WhatFly Tab: Using comprehensive map data from global context');
              // Get fly suggestions using global context data
              getSuggestions();
            }
          }, 1500); // Increased delay to ensure state is updated
        }
      }
    };
    
    checkLocationParams();
  }, [params.lat, params.lng, params.name, params.address, params.weatherData, params.waterConditions, params.fishingConditions]); // Include all params we use

  // Log when conditions change for debugging
  useEffect(() => {
    console.log('Conditions state changed:', {
      location: conditions.location,
      latitude: conditions.latitude,
      longitude: conditions.longitude,
      hasLocation: !!conditions.location,
      hasCoordinates: !!(conditions.latitude && conditions.longitude),
      timestamp: new Date().toLocaleTimeString(),
      allKeys: Object.keys(conditions)
    });
  }, [conditions]);


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
      setFishingConditions({
        ...conditions,
        location: address,
        latitude,
        longitude,
        location_address: address,
      });

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
    console.log('Auto-detect location check:', {
      mode,
      hasCurrentLocation: !!currentLocation,
      hasConditionsLocation: !!(conditions.latitude && conditions.longitude),
      shouldGetLocation: mode === 'current' && !currentLocation && !conditions.latitude && !conditions.longitude
    });
    
    if (mode === 'current' && !currentLocation && !conditions.latitude && !conditions.longitude) {
      console.log('Getting current location automatically...');
      getCurrentLocation();
    } else if (conditions.latitude && conditions.longitude) {
      console.log('Skipping auto-location - already have location from map');
    }
  }, [mode, currentLocation, conditions.latitude, conditions.longitude]);

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
    setFishingConditions({
      ...conditions,
      location: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      location_address: location.address,
    });

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
        setFishingConditions({
          ...conditions,
          weather_conditions: fishingConditions.weather_conditions,
          wind_speed: fishingConditions.wind_speed,
          wind_direction: fishingConditions.wind_direction,
          air_temperature_range: fishingConditions.air_temperature_range,
        });

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

  const getSuggestions = async (overrideConditions?: Partial<FishingConditions>) => {
    // Use global context conditions directly - no more local state dependency
    const currentConditions = fishingConditions || {};
    
    console.log('🎣 WhatFly Tab: getSuggestions called with global context conditions:', {
      location: currentConditions.location,
      latitude: currentConditions.latitude,
      longitude: currentConditions.longitude,
      hasLocation: !!currentConditions.location,
      hasCoordinates: !!(currentConditions.latitude && currentConditions.longitude),
      hasCompleteData: hasCompleteData,
      allConditionsKeys: Object.keys(currentConditions),
      isProcessingMapData: isProcessingMapData,
      usingOverride: !!overrideConditions,
      contextSource: 'global'
    });
    
    // Wait if map data is still being processed
    if (isProcessingMapData) {
      console.log('Map data still being processed, waiting...');
      setTimeout(() => getSuggestions(), 500);
      return;
    }
    
    // Check if we have basic data from global context or can use defaults
    if (!currentConditions.location && !currentConditions.latitude && !currentConditions.longitude) {
      console.log('🎣 WhatFly Tab: No location data from context, using default conditions');
      // Set default conditions if no data is available
      setFishingConditions({
        location: 'Default Location',
        latitude: 40.2338, // Provo River coordinates as default
        longitude: -111.6585,
        location_address: '40.2338, -111.6585',
        weather_conditions: 'sunny',
        wind_speed: 'light',
        wind_direction: 'variable',
        air_temperature_range: 'moderate',
        water_conditions: 'calm',
        water_clarity: 'clear',
        water_level: 'normal',
        water_flow: 'moderate',
        time_of_day: 'morning',
        time_of_year: 'summer',
        water_temperature_range: 'moderate'
      });
      // Wait a moment for context to update, then continue
      setTimeout(() => {
        console.log('🎣 WhatFly Tab: Retrying getSuggestions with default conditions');
        getSuggestions();
      }, 100);
      return;
    }
    
    // If we have coordinates but no location name, set a default location in context
    if (!currentConditions.location && currentConditions.latitude && currentConditions.longitude) {
      console.log('🎣 WhatFly Tab: Setting default location name in context');
      setFishingConditions({
        ...currentConditions,
        location: `Location at ${currentConditions.latitude?.toFixed(4)}, ${currentConditions.longitude?.toFixed(4)}`
      });
      // Wait a moment for context to update, then continue
      setTimeout(() => {
        console.log('🎣 WhatFly Tab: Retrying getSuggestions after setting location in context');
        getSuggestions();
      }, 100);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🎣 WhatFly Tab: Getting suggestions using global context conditions:', currentConditions);
      console.log('🎣 WhatFly Tab: User ID:', user?.id);
      console.log('🎣 WhatFly Tab: Calling flySuggestionService.getSuggestions...');
      
      const result = await flySuggestionService.getSuggestions(
        currentConditions,
        user?.id
      );
      
      console.log('🎣 WhatFly Tab: Received suggestions result:', {
        hasSuggestions: result.suggestions?.length > 0,
        suggestionsCount: result.suggestions?.length || 0,
        canPerform: result.canPerform,
        hasError: !!result.error,
        error: result.error,
        usageInfo: result.usageInfo
      });
      
      if (!result.canPerform && APP_CONFIG.ENABLE_USAGE_LIMITS) {
        // User hit usage limit
        setUsageInfo(result.usageInfo);
        setShowUpgradeModal(true);
        return;
      }
      
      setSuggestions(result.suggestions);
      setUsageInfo(result.usageInfo);
      
      if (result.suggestions.length === 0) {
        if (result.error) {
          Alert.alert('Error', `Failed to get fly suggestions: ${result.error}`);
        } else {
        Alert.alert('No Suggestions', 'No fly suggestions found. The database might be empty or there might be a connection issue.');
        }
      }
    } catch (error) {
      console.error('🎣 WhatFly Tab: Error getting suggestions:', error);
      console.error('🎣 WhatFly Tab: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        currentConditions: currentConditions
      });
      Alert.alert('Error', `Failed to get fly suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setFishingConditions({
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
      
      // Check if we already have weather and water data from the map
      const hasExistingWeatherData = weatherData && weatherData.temperature;
      const hasExistingWaterData = waterConditions && (waterConditions.flowRate || waterConditions.waterTemperature);
      const hasFishingConditionsFromMap = conditions.location && conditions.latitude && conditions.longitude && conditions.time_of_day;
      
      console.log('Existing data check:', { hasExistingWeatherData, hasExistingWaterData, hasFishingConditionsFromMap });
      
      let finalConditions = { ...conditions };
      let finalWaterConditions = waterConditions;
      let finalWeatherData = weatherData;
      let finalAutoDetectedInfo = autoDetectedInfo;
      
      if (hasFishingConditionsFromMap) {
        console.log('Using comprehensive fishing conditions from map...');
        // Use the complete fishing conditions that were built in the map
        // These already include all weather, water, lunar, and location-specific data
        finalConditions = conditions;
        
        console.log('Using comprehensive map conditions:', finalConditions);
        
        // Don't override conditions - use them as-is
        console.log('Preserving map conditions, not overriding:', finalConditions);
        setFishingConditions(finalConditions);
      } else if (hasExistingWeatherData && hasExistingWaterData) {
        console.log('Using existing weather and water data from map...');
        // Use existing data from map - no need to fetch new data
        // Preserve all conditions that were set from the map
        finalConditions = {
          ...conditions,
          water_data: waterConditions,
          water_temperature: waterConditions.waterTemperature,
        };
        
        console.log('Using map data - final conditions:', finalConditions);
      } else {
        console.log('Fetching fresh weather and water data...');
      // Auto-detect all conditions
      const autoDetected = await autoDetectionService.getAutoDetectedConditions(
        latitude,
        longitude,
        locationName
      );
      
      console.log('Auto-detected conditions:', autoDetected);
      
        // Fetch real-time water conditions only if we don't have them
        if (!hasExistingWaterData) {
      console.log('Fetching real-time water conditions...');
          const newWaterConditions = await WaterConditionsService.getWaterConditions({ latitude, longitude });
          finalWaterConditions = newWaterConditions;
          setWaterConditions(newWaterConditions);
      
          if (newWaterConditions) {
        console.log('Water conditions found:', {
              flowRate: newWaterConditions.flowRate,
              waterTemperature: newWaterConditions.waterTemperature,
              gaugeHeight: newWaterConditions.gaugeHeight,
              stationName: newWaterConditions.stationName,
              dataSource: newWaterConditions.dataSource
            });
          }
        }
        
        // Use fetched or existing water conditions
        if (finalWaterConditions) {
          finalConditions = {
          ...autoDetected.conditions,
            water_data: finalWaterConditions,
            water_temperature: finalWaterConditions.waterTemperature || autoDetected.conditions.water_temperature,
        };
      } else {
          finalConditions = autoDetected.conditions;
      }
      
        finalAutoDetectedInfo = autoDetected.autoDetectedInfo;
      setAutoDetectedInfo(autoDetected.autoDetectedInfo);
      
        // Get weather data if available and we don't have existing data
        if (autoDetected.weatherData && !hasExistingWeatherData) {
          finalWeatherData = autoDetected.weatherData;
        setWeatherData(autoDetected.weatherData);
        }
      }
      
      // Set final conditions only if we didn't already set them from map data
      if (!hasFishingConditionsFromMap) {
        setFishingConditions(finalConditions);
      }
      
      // Get weather insights if we have weather data
      if (finalWeatherData) {
        try {
          const insights = weatherService.getFishingInsights(finalWeatherData);
          setWeatherInsights(insights || []);
        } catch (error) {
          console.error('Error getting weather insights:', error);
          setWeatherInsights([]);
        }
      }
      
      // Get smart suggestions
      try {
        const smartSuggestions = autoDetectionService.getSmartSuggestions(finalConditions);
        setSmartSuggestions(smartSuggestions || []);
      } catch (error) {
        console.error('Error getting smart suggestions:', error);
        setSmartSuggestions([]);
      }
      
      // Get fly suggestions
      const result = await enhancedFlySuggestionService.getSuggestions(
        finalConditions as FishingConditions,
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
      setFishingConditions(tripConditions);
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

  const handleFlySelection = (suggestion: FlySuggestion) => {
    setSelectedFlySuggestion(suggestion);
    setShowFlyDetailModal(true);
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
        
        {/* Show helpful message about using the Map tab */}
        <View style={styles.noLocationCard}>
          <Text style={styles.noLocationTitle}>🎣 Fly Suggestions Moved to Map Tab</Text>
          <Text style={styles.noLocationText}>
            Fly suggestions are now available directly on the Map tab! Select a location on the map to get personalized fly suggestions based on real-time weather and water conditions.
          </Text>
        </View>

        {/* Location Data Display */}
        {(conditions.latitude && conditions.longitude) && (
          <View style={styles.locationDataSection}>
            <Text style={styles.locationDataTitle}>📍 Location Data</Text>
            <Text style={styles.locationDataText}>
              <Text style={styles.locationDataLabel}>Location:</Text> {conditions.location || 'Unknown'}
            </Text>
            <Text style={styles.locationDataText}>
              <Text style={styles.locationDataLabel}>Coordinates:</Text> {conditions.latitude?.toFixed(4)}, {conditions.longitude?.toFixed(4)}
            </Text>
            {weatherData && (
              <Text style={styles.locationDataText}>
                <Text style={styles.locationDataLabel}>Weather:</Text> {weatherData.temperature}°F, {weatherData.weather_condition}, Wind: {weatherData.wind_speed} mph
              </Text>
            )}
            {waterConditions && (
              <Text style={styles.locationDataText}>
                <Text style={styles.locationDataLabel}>Water:</Text> {waterConditions.waterTemperature}°F, Flow: {waterConditions.flowRate} cfs, Level: {waterConditions.waterLevel} ft
              </Text>
            )}
            <Text style={styles.locationDataText}>
              <Text style={styles.locationDataLabel}>Time:</Text> {conditions.time_of_day}, {conditions.time_of_year}
            </Text>
            <Text style={styles.locationDataText}>
              <Text style={styles.locationDataLabel}>Conditions:</Text> {conditions.water_clarity} water, {conditions.water_level} level, {conditions.water_flow} flow
            </Text>
            {conditions.date && (
              <Text style={styles.locationDataText}>
                <Text style={styles.locationDataLabel}>Updated:</Text> {new Date().toLocaleTimeString()}
              </Text>
            )}
          </View>
        )}

        {/* Comprehensive Conditions Display */}
        {conditions.latitude && conditions.longitude && (
          <View style={styles.comprehensiveConditionsSection}>
            <TouchableOpacity
              style={styles.comprehensiveConditionsHeader}
              onPress={() => setShowComprehensiveConditions(!showComprehensiveConditions)}
            >
              <Text style={styles.comprehensiveConditionsTitle}>
                📊 Comprehensive Fishing Conditions
              </Text>
              <Text style={styles.comprehensiveConditionsToggle}>
                {showComprehensiveConditions ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            
            {showComprehensiveConditions && (
              <View style={styles.comprehensiveConditionsContent}>
                {/* Weather Data */}
                {conditions.weather_data && (
                  <View style={styles.conditionGroup}>
                    <Text style={styles.conditionGroupTitle}>🌦️ Weather Data</Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Temperature:</Text> {conditions.weather_data.temperature}°F
                    </Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Humidity:</Text> {conditions.weather_data.humidity}%
                    </Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Pressure:</Text> {conditions.weather_data.pressure} mb
                    </Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Visibility:</Text> {conditions.weather_data.visibility} miles
                    </Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>UV Index:</Text> {conditions.weather_data.uv_index}
                    </Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Cloud Cover:</Text> {conditions.weather_data.cloud_cover}%
                    </Text>
                    {conditions.weather_data.precipitation && (
                      <Text style={styles.conditionDetail}>
                        <Text style={styles.conditionLabel}>Precipitation:</Text> {conditions.weather_data.precipitation.probability}% chance of {conditions.weather_data.precipitation.type}
                      </Text>
                    )}
                  </View>
                )}

                {/* Water Data */}
                {conditions.water_data && (
                  <View style={styles.conditionGroup}>
                    <Text style={styles.conditionGroupTitle}>🌊 Water Conditions</Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Flow Rate:</Text> {conditions.water_data.flowRate} cfs
                    </Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Water Temperature:</Text> {conditions.water_data.waterTemperature}°F
                    </Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Gauge Height:</Text> {conditions.water_data.gaugeHeight} ft
                    </Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Turbidity:</Text> {conditions.water_data.turbidity} NTU
                    </Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Dissolved Oxygen:</Text> {conditions.water_data.dissolvedOxygen} mg/L
                    </Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>pH:</Text> {conditions.water_data.pH}
                    </Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Station:</Text> {conditions.water_data.stationName} ({conditions.water_data.dataSource})
                    </Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Data Quality:</Text> {conditions.water_data.dataQuality}
                    </Text>
                  </View>
                )}

                {/* Lunar Data */}
                {conditions.solunar_periods && (
                  <View style={styles.conditionGroup}>
                    <Text style={styles.conditionGroupTitle}>🌙 Lunar & Solunar Data</Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Moon Phase:</Text> {conditions.moon_phase} ({conditions.moon_illumination}% illuminated)
                    </Text>
                    <Text style={styles.conditionDetail}>
                      <Text style={styles.conditionLabel}>Lunar Feeding Activity:</Text> {conditions.lunar_feeding_activity}
                    </Text>
                    {conditions.solunar_periods.sunrise && (
                      <Text style={styles.conditionDetail}>
                        <Text style={styles.conditionLabel}>Sunrise:</Text> {new Date(conditions.solunar_periods.sunrise).toLocaleTimeString()}
                      </Text>
                    )}
                    {conditions.solunar_periods.sunset && (
                      <Text style={styles.conditionDetail}>
                        <Text style={styles.conditionLabel}>Sunset:</Text> {new Date(conditions.solunar_periods.sunset).toLocaleTimeString()}
                      </Text>
                    )}
                    {conditions.solunar_periods.moonrise && (
                      <Text style={styles.conditionDetail}>
                        <Text style={styles.conditionLabel}>Moonrise:</Text> {new Date(conditions.solunar_periods.moonrise).toLocaleTimeString()}
                      </Text>
                    )}
                    {conditions.solunar_periods.moonset && (
                      <Text style={styles.conditionDetail}>
                        <Text style={styles.conditionLabel}>Moonset:</Text> {new Date(conditions.solunar_periods.moonset).toLocaleTimeString()}
                      </Text>
                    )}
                    {(conditions.solunar_periods as any)?.current_period?.active && (
                      <Text style={styles.conditionDetail}>
                        <Text style={styles.conditionLabel}>Current Solunar Period:</Text> {(conditions.solunar_periods as any).current_period.type} ({Math.round((conditions.solunar_periods as any).current_period.remaining)} min remaining)
                      </Text>
                    )}
                  </View>
                )}

                {/* Hatch Data */}
                {conditions.hatch_data && (
                  <View style={styles.conditionGroup}>
                    <Text style={styles.conditionGroupTitle}>🦟 Hatch Information</Text>
                    {conditions.hatch_data.active_hatches && conditions.hatch_data.active_hatches.length > 0 && (
                      <>
                        <Text style={styles.conditionDetail}>
                          <Text style={styles.conditionLabel}>Active Hatches:</Text>
                        </Text>
                        {conditions.hatch_data.active_hatches.map((hatch: any, index: number) => (
                          <Text key={index} style={styles.conditionDetail}>
                            • {hatch.insect} ({hatch.stage}) - {hatch.intensity} intensity, Size {hatch.size}
                          </Text>
                        ))}
                      </>
                    )}
                    {conditions.hatch_data.local_hatch_info && (
                      <>
                        <Text style={styles.conditionDetail}>
                          <Text style={styles.conditionLabel}>Region:</Text> {conditions.hatch_data.local_hatch_info.region}
                        </Text>
                        <Text style={styles.conditionDetail}>
                          <Text style={styles.conditionLabel}>River System:</Text> {conditions.hatch_data.local_hatch_info.river_system}
                        </Text>
                      </>
                    )}
                  </View>
                )}

                {/* Fly suggestions moved to Map tab */}
                <View style={styles.mapRedirectCard}>
                  <Text style={styles.mapRedirectTitle}>🎣 Get Fly Suggestions</Text>
                  <Text style={styles.mapRedirectText}>
                    Fly suggestions are now available directly on the Map tab! Select a location on the map to get personalized recommendations.
                  </Text>
                  <TouchableOpacity
                    style={styles.mapRedirectButton}
                    onPress={() => router.push('/(tabs)/map')}
                  >
                    <Text style={styles.mapRedirectButtonText}>Go to Map Tab</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Recommendations */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>Recommended Flies</Text>
            <Text style={styles.suggestionsSubtitle}>Tap any fly for detailed information</Text>
            {suggestions.map((suggestion, index) => (
              <FlySuggestionCard
                key={index}
                suggestion={suggestion}
                onPress={handleFlySelection}
              />
            ))}
          </View>
        )}
        
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

      {/* Fly Detail Modal */}
      <FlyDetailModal
        suggestion={selectedFlySuggestion}
        visible={showFlyDetailModal}
        onClose={() => {
          setShowFlyDetailModal(false);
          setSelectedFlySuggestion(null);
        }}
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
  noLocationCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffd33d',
  },
  noLocationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 8,
  },
  noLocationText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  mapRedirectCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  mapRedirectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  mapRedirectText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  mapRedirectButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mapRedirectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  suggestionsSubtitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
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
  locationDataSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  locationDataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 12,
  },
  locationDataText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 6,
    lineHeight: 20,
  },
  locationDataLabel: {
    fontWeight: '600',
    color: '#ccc',
  },
  comprehensiveConditionsSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden',
  },
  comprehensiveConditionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#3a3a3a',
  },
  comprehensiveConditionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd33d',
  },
  comprehensiveConditionsToggle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  comprehensiveConditionsContent: {
    padding: 16,
    gap: 16,
  },
  conditionGroup: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#555',
  },
  conditionGroupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  conditionDetail: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 4,
    lineHeight: 18,
  },
  conditionLabel: {
    fontWeight: '600',
    color: '#ccc',
  },
  getSuggestionsButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  getSuggestionsButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  getSuggestionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});