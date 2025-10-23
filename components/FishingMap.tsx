import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { DAM_LOCATIONS, getDamLocationById } from '../lib/damLocations';
import { getFishingLocationById } from '../lib/fishingLocationsData';
import { getComprehensiveHatchData } from '../lib/hatchCalendar';
import {
    Coordinates,
    fetchWeather,
    findNearestRiver,
    RiverLocation,
    WeatherData
} from '../lib/locationService';
import { LunarService } from '../lib/lunarService';
import { MAPBOX_CONFIG } from '../lib/mapboxConfig';
import { getReservoirPathById } from '../lib/reservoirBasedRiverPaths';
import { getRiverSegmentById, riverSegmentsToGeoJSON } from '../lib/riverData';
import { getRiverPathById } from '../lib/riverPaths';
import type { FishingConditions } from '../lib/types';
import type { WaterConditions } from '../lib/waterConditionsService';
import { WaterConditionsService } from '../lib/waterConditionsService';
import { weatherService } from '../lib/weatherService';
import RiverDisplay from './RiverDisplay';

// Import Mapbox for native platforms
let Mapbox: any = null;
try {
  if (Platform.OS !== 'web') {
    Mapbox = require('@rnmapbox/maps');
    // Configure Mapbox
    Mapbox.setAccessToken(MAPBOX_CONFIG.ACCESS_TOKEN);
  }
} catch (error) {
  console.error('Failed to load Mapbox:', error);
  Mapbox = null;
}

interface FishingMapProps {
  onLocationSelect?: (coordinates: Coordinates, location: RiverLocation | null) => void;
  onGetFlySuggestions?: (coordinates: Coordinates, location: RiverLocation | null, weatherData: any, waterConditions: any, fishingConditions?: any) => void;
  showRiverMarkers?: boolean;
  showRiverPaths?: boolean;
  onRiverSegmentSelect?: (segment: any) => void;
  onRiverPathSelect?: (path: any) => void;
  onLocationSelected?: (hasSelection: boolean) => void;
  showDetailsModal?: boolean;
  onModalClosed?: () => void;
}

export default function FishingMap({ onLocationSelect, onGetFlySuggestions, showRiverMarkers = false, showRiverPaths = true, onRiverSegmentSelect, onRiverPathSelect, onLocationSelected, showDetailsModal, onModalClosed }: FishingMapProps) {
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<RiverLocation | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [waterConditions, setWaterConditions] = useState<WaterConditions | null>(null);
  const [realTimeWeatherData, setRealTimeWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapStyle, setMapStyle] = useState<string>(MAPBOX_CONFIG.DEFAULT_STYLE);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showAllMarkers, setShowAllMarkers] = useState(false); // Default to popular only
  const [selectedRiverSegment, setSelectedRiverSegment] = useState<any>(null);
  const [selectedRiverPath, setSelectedRiverPath] = useState<any>(null);
  const [showRiverDisplay, setShowRiverDisplay] = useState(false);
  const [currentFishingConditions, setCurrentFishingConditions] = useState<any>(null);
  
  const mapRef = useRef<any>(null);

  // Default camera position (Provo River)
  const defaultCamera = MAPBOX_CONFIG.DEFAULT_CAMERA;

  const handleMapPress = useCallback(async (feature: any, coordinates: [number, number]) => {
    
    // Validate coordinates
    const [longitude, latitude] = coordinates;
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      console.error('Invalid coordinates:', { latitude, longitude });
      Alert.alert('Error', 'Invalid location coordinates. Please try again.');
      return;
    }
    
    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      console.error('Coordinates out of valid range:', { latitude, longitude });
      Alert.alert('Error', 'Location is outside valid coordinates range.');
      return;
    }
    
    const coords: Coordinates = { latitude, longitude };
    
    setSelectedCoordinates(coords);
    setIsLoading(true);

    try {
      // Find nearest river
      const nearestRiver = await findNearestRiver(latitude, longitude);
      setSelectedLocation(nearestRiver);

      // Fetch real-time weather data for better accuracy
      const realWeather = await weatherService.getWeatherForLocation(latitude, longitude);
      setRealTimeWeatherData(realWeather);
      
      // Also get legacy weather for display
      const weather = await fetchWeather(latitude, longitude);
      setWeatherData(weather);

      // Fetch water conditions
      const waterConditions = await WaterConditionsService.getWaterConditions(coords);
      setWaterConditions(waterConditions);

      // Build fishing conditions for real-time fly suggestions
      const now = new Date();
      const hour = now.getHours();
      const month = now.getMonth();
      
      // Determine time of day
      const getTimeOfDay = (): FishingConditions['time_of_day'] => {
        if (hour >= 5 && hour < 8) return 'dawn';
        if (hour >= 8 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'midday';
        if (hour >= 17 && hour < 20) return 'afternoon';
        if (hour >= 20 && hour < 22) return 'dusk';
        return 'night';
      };
      
      // Determine time of year
      const getTimeOfYear = (): FishingConditions['time_of_year'] => {
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
      
      // Convert weather data to fishing conditions format
      const fishingWeather = realWeather ? weatherService.convertToFishingConditions(realWeather) : null;
      
      // Determine water clarity from conditions
      const getWaterClarity = (): FishingConditions['water_clarity'] => {
        if (waterConditions?.flowRate) {
          if (waterConditions.flowRate > 300) return 'very_murky';
          if (waterConditions.flowRate > 200) return 'murky';
          if (waterConditions.flowRate > 100) return 'slightly_murky';
        }
        return 'clear';
      };
      
      // Determine water level
      const getWaterLevel = (): FishingConditions['water_level'] => {
        if (waterConditions?.flowRate) {
          if (waterConditions.flowRate > 300) return 'flooding';
          if (waterConditions.flowRate > 200) return 'high';
          if (waterConditions.flowRate < 50) return 'low';
        }
        return 'normal';
      };
      
      // Determine water flow
      const getWaterFlow = (): FishingConditions['water_flow'] => {
        if (waterConditions?.flowRate) {
          if (waterConditions.flowRate > 200) return 'fast';
          if (waterConditions.flowRate < 50) return 'slow';
        }
        return 'moderate';
      };

      // Get lunar data for the location
      const lunarData = LunarService.getMoonPhase(now);
      const solunarData = LunarService.getSolunarPeriods(now, latitude, longitude);
      
      // Build comprehensive fishing conditions with lunar data
      const fishingConditions: Partial<FishingConditions> = {
        date: now.toISOString().split('T')[0],
        location: nearestRiver?.name || 'Selected Location',
        latitude: latitude,
        longitude: longitude,
        location_address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        
        // Weather conditions
        weather_conditions: fishingWeather?.weather_conditions || 'sunny',
        wind_speed: fishingWeather?.wind_speed || 'light',
        wind_direction: fishingWeather?.wind_direction || 'variable',
        air_temperature_range: fishingWeather?.air_temperature_range || 'moderate',
        
        // Water conditions
        water_conditions: 'calm', // Default, could be enhanced based on flow
        water_clarity: getWaterClarity(),
        water_level: getWaterLevel(),
        water_flow: getWaterFlow(),
        water_temperature_range: waterConditions?.waterTemperature ? 
          (waterConditions.waterTemperature < 45 ? 'very_cold' :
           waterConditions.waterTemperature < 55 ? 'cold' :
           waterConditions.waterTemperature < 65 ? 'cool' :
           waterConditions.waterTemperature < 75 ? 'moderate' :
           waterConditions.waterTemperature < 85 ? 'warm' : 'hot') : 'moderate',
        water_temperature: waterConditions?.waterTemperature,
        
        // Time-based conditions
        time_of_day: getTimeOfDay(),
        time_of_year: getTimeOfYear(),
        
        // Lunar conditions
        moon_phase: lunarData.phase,
        moon_illumination: lunarData.illumination,
        lunar_feeding_activity: lunarData.feedingActivity,
        solunar_periods: {
          major_periods: solunarData.major.map(period => ({
            start: period.start.toISOString(),
            end: period.end.toISOString(),
            duration: period.end.getTime() - period.start.getTime(),
            peak: new Date((period.start.getTime() + period.end.getTime()) / 2).toISOString()
          })),
          minor_periods: solunarData.minor.map(period => ({
            start: period.start.toISOString(),
            end: period.end.toISOString(),
            duration: period.end.getTime() - period.start.getTime(),
            peak: new Date((period.start.getTime() + period.end.getTime()) / 2).toISOString()
          })),
          sunrise: new Date().toISOString(), // Placeholder - would need actual sunrise calculation
          sunset: new Date().toISOString(), // Placeholder - would need actual sunset calculation
          moonrise: new Date().toISOString(), // Placeholder - would need actual moonrise calculation
          moonset: new Date().toISOString() // Placeholder - would need actual moonset calculation
        },
        
        // Real-time water data
        water_data: waterConditions ? {
          flowRate: waterConditions.flowRate,
          waterTemperature: waterConditions.waterTemperature,
          gaugeHeight: waterConditions.gaugeHeight,
          turbidity: waterConditions.turbidity,
          dissolvedOxygen: waterConditions.dissolvedOxygen,
          pH: waterConditions.pH,
          conductivity: waterConditions.conductivity,
          stationId: waterConditions.stationId,
          stationName: waterConditions.stationName,
          lastUpdated: waterConditions.lastUpdated,
          dataSource: waterConditions.dataSource,
          dataQuality: waterConditions.dataQuality,
          isActive: waterConditions.isActive
        } : undefined,
        
        // Additional metadata
        notes: `Location selected at ${now.toLocaleTimeString()} - ${nearestRiver?.type || 'General Location'}`
      };

      // Store the fishing conditions for later use
      setCurrentFishingConditions(fishingConditions);


      // Notify parent component with enhanced data
      onLocationSelect?.(coords, nearestRiver);
      
      // Notify parent that a location has been selected
      onLocationSelected?.(true);

      // Show results modal
      setShowResults(true);

    } catch (error) {
      console.error('Error processing location:', error);
      Alert.alert('Error', 'Failed to get location data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onLocationSelect]);

  const handleFishingLocationPress = useCallback(async (locationId: string) => {
    const fishingLocation = getFishingLocationById(locationId);
    if (!fishingLocation) return;
    
    const { longitude, latitude } = fishingLocation.coordinates;
    await handleMapPress(null, [longitude, latitude]);
    
    // Zoom to the location
    if (mapRef.current && Mapbox) {
      mapRef.current.setCamera({
        centerCoordinate: [longitude, latitude],
        zoomLevel: MAPBOX_CONFIG.ZOOM_LEVELS.LOCAL,
        animationDuration: 1000,
      });
    }
  }, [handleMapPress]);

  const handleRiverSegmentPress = useCallback(async (segmentId: string) => {
    const segment = getRiverSegmentById(segmentId);
    if (!segment) {
      console.error('River segment not found:', segmentId);
      Alert.alert('Error', 'River segment not found. Please try again.');
      return;
    }
    
    if (!segment.coordinates || !segment.coordinates.latitude || !segment.coordinates.longitude) {
      console.error('River segment has invalid coordinates:', segment);
      Alert.alert('Error', 'River segment data is incomplete.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get coordinates from the river segment
      const { latitude, longitude } = segment.coordinates;
      
      // Validate coordinates
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        console.error('Invalid river segment coordinates:', { latitude, longitude });
        Alert.alert('Error', 'Invalid river segment coordinates.');
        return;
      }
      
      const coords: Coordinates = { latitude, longitude };
      
      // Set selected coordinates for consistency with regular map press
      setSelectedCoordinates(coords);
      
      // Find nearest river for location context
      const nearestRiver = await findNearestRiver(latitude, longitude);
      setSelectedLocation(nearestRiver);
      
      // Fetch real-time weather data for better accuracy
      const realWeather = await weatherService.getWeatherForLocation(latitude, longitude);
      setRealTimeWeatherData(realWeather);
      
      // Convert weather data to fishing conditions format
      const weatherConditions = realWeather ? weatherService.convertToFishingConditions(realWeather) : null;
      
      // Fetch water conditions for the location
      const waterConditionsData = await WaterConditionsService.getWaterConditions(coords);
      setWaterConditions(waterConditionsData);
      
      // Get current time for time-based calculations
      const now = new Date();
      const hour = now.getHours();
      
      // Helper functions for time-based conditions
      const getTimeOfDay = (): FishingConditions['time_of_day'] => {
        if (hour >= 5 && hour < 8) return 'dawn';
        if (hour >= 8 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'midday';
        if (hour >= 17 && hour < 20) return 'afternoon';
        if (hour >= 20 && hour < 22) return 'dusk';
        return 'night';
      };
      
      const getTimeOfYear = (): FishingConditions['time_of_year'] => {
        const month = now.getMonth() + 1;
        if (month === 12 || month === 1 || month === 2) return 'winter';
        if (month === 3) return 'early_spring';
        if (month === 4) return 'spring';
        if (month === 5) return 'late_spring';
        if (month === 6) return 'early_summer';
        if (month === 7 || month === 8) return 'summer';
        if (month === 9) return 'late_summer';
        if (month === 10) return 'fall';
        if (month === 11) return 'late_fall';
        return 'summer';
      };
      
      // Get lunar data for the location
      const lunarData = LunarService.getMoonPhase(now);
      const solunarData = LunarService.getSolunarPeriods(now, latitude, longitude);
      
      // Build comprehensive fishing conditions with lunar data
      const fishingConditions: Partial<FishingConditions> = {
        date: now.toISOString().split('T')[0],
        location: `${segment.name} - ${segment.riverSystem}`,
        latitude,
        longitude,
        location_address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        
        // Weather conditions
        weather_conditions: weatherConditions?.weather_conditions || 'sunny',
        wind_speed: weatherConditions?.wind_speed || 'light',
        wind_direction: weatherConditions?.wind_direction || 'variable',
        air_temperature_range: weatherConditions?.air_temperature_range || 'moderate',
        
        // Water conditions
        water_conditions: 'calm', // Default, could be enhanced based on flow
        water_clarity: waterConditionsData?.turbidity ? 
          (waterConditionsData.turbidity > 50 ? 'very_murky' :
           waterConditionsData.turbidity > 20 ? 'murky' :
           waterConditionsData.turbidity > 5 ? 'slightly_murky' : 'clear') : 'clear',
        water_level: waterConditionsData?.gaugeHeight ? 
          (waterConditionsData.gaugeHeight > 10 ? 'high' :
           waterConditionsData.gaugeHeight < 3 ? 'low' : 'normal') : 'normal',
        water_flow: waterConditionsData?.flowRate ? 
          (waterConditionsData.flowRate > 200 ? 'fast' :
           waterConditionsData.flowRate < 50 ? 'slow' : 'moderate') : 'moderate',
        water_temperature_range: waterConditionsData?.waterTemperature ? 
          (waterConditionsData.waterTemperature < 45 ? 'very_cold' :
           waterConditionsData.waterTemperature < 55 ? 'cold' :
           waterConditionsData.waterTemperature < 65 ? 'cool' :
           waterConditionsData.waterTemperature < 75 ? 'moderate' :
           waterConditionsData.waterTemperature < 85 ? 'warm' : 'hot') : 'moderate',
        water_temperature: waterConditionsData?.waterTemperature,
        
        // Time-based conditions
        time_of_day: getTimeOfDay(),
        time_of_year: getTimeOfYear(),
        
        // Lunar conditions
        moon_phase: lunarData.phase,
        moon_illumination: lunarData.illumination,
        lunar_feeding_activity: lunarData.feedingActivity,
        solunar_periods: {
          major_periods: solunarData.major.map(period => ({
            start: period.start.toISOString(),
            end: period.end.toISOString(),
            duration: period.end.getTime() - period.start.getTime(),
            peak: new Date((period.start.getTime() + period.end.getTime()) / 2).toISOString()
          })),
          minor_periods: solunarData.minor.map(period => ({
            start: period.start.toISOString(),
            end: period.end.toISOString(),
            duration: period.end.getTime() - period.start.getTime(),
            peak: new Date((period.start.getTime() + period.end.getTime()) / 2).toISOString()
          })),
          sunrise: new Date().toISOString(), // Placeholder - would need actual sunrise calculation
          sunset: new Date().toISOString(), // Placeholder - would need actual sunset calculation
          moonrise: new Date().toISOString(), // Placeholder - would need actual moonrise calculation
          moonset: new Date().toISOString() // Placeholder - would need actual moonset calculation
        },
        
        // Real-time water data
        water_data: waterConditionsData ? {
          flowRate: waterConditionsData.flowRate || 0,
          waterTemperature: waterConditionsData.waterTemperature,
          gaugeHeight: waterConditionsData.gaugeHeight || 0,
          turbidity: waterConditionsData.turbidity,
          dissolvedOxygen: waterConditionsData.dissolvedOxygen,
          pH: waterConditionsData.pH,
          conductivity: waterConditionsData.conductivity,
          stationId: waterConditionsData.stationId,
          stationName: waterConditionsData.stationName || 'River Segment Location',
          lastUpdated: waterConditionsData.lastUpdated,
          dataSource: waterConditionsData.dataSource,
          dataQuality: waterConditionsData.dataQuality || 'UNKNOWN',
          isActive: waterConditionsData.isActive
        } : undefined,
        
        // Additional metadata
        notes: `River segment selected at ${now.toLocaleTimeString()} - ${segment.riverSystem}`
      };
      
      // Store comprehensive fishing conditions
      setCurrentFishingConditions(fishingConditions);
      
      } catch (error) {
      console.error('Error gathering river segment conditions:', error);
      // Continue with basic setup even if real-time data fails
    } finally {
      setIsLoading(false);
    }
    
    setSelectedRiverSegment(segment);
    setShowRiverDisplay(true);
    onRiverSegmentSelect?.(segment);
    
    // Notify parent that a location has been selected
    onLocationSelected?.(true);
    
    // Zoom to the river segment
    if (mapRef.current && Mapbox) {
      mapRef.current.setCamera({
        centerCoordinate: [segment.coordinates.longitude, segment.coordinates.latitude],
        zoomLevel: MAPBOX_CONFIG.ZOOM_LEVELS.LOCAL,
        animationDuration: 1000,
      });
    }
  }, [onRiverSegmentSelect, onLocationSelected]);

  const handleDamLocationPress = useCallback(async (damId: string) => {
    const dam = getDamLocationById(damId);
    if (!dam) {
      console.error('Dam location not found:', damId);
      Alert.alert('Error', 'Dam location not found. Please try again.');
      return;
    }
    
    setSelectedCoordinates({ latitude: dam.coordinates.latitude, longitude: dam.coordinates.longitude });
    setIsLoading(true);
    
    try {
      // Find nearest river for location context
      const nearestRiver = await findNearestRiver(dam.coordinates.latitude, dam.coordinates.longitude);
      
      // Create a proper location object with the dam name
      const damLocation = {
        ...nearestRiver,
        name: dam.name, // Use the dam name as the primary location name
        id: dam.id,
        type: 'dam' as const,
        coordinates: dam.coordinates
      };
      
      setSelectedLocation(damLocation);
      
      // Fetch comprehensive weather data
      let comprehensiveWeather;
      let weatherConditions = null;
      
      try {
        comprehensiveWeather = await weatherService.getComprehensiveWeatherData(dam.coordinates.latitude, dam.coordinates.longitude);
        setRealTimeWeatherData(comprehensiveWeather.current);
        
        if (comprehensiveWeather.current) {
          // Convert weather data to fishing conditions format
          weatherConditions = weatherService.convertToFishingConditions(comprehensiveWeather.current);
          } else {
          console.warn('⚠️ No weather data received, using defaults');
        }
      } catch (error) {
        console.error('❌ Error fetching comprehensive weather data:', error);
        }
      
      // Fetch comprehensive water conditions for the location
      let comprehensiveWaterData;
      
      try {
        comprehensiveWaterData = await WaterConditionsService.getComprehensiveWaterConditions({
          latitude: dam.coordinates.latitude,
          longitude: dam.coordinates.longitude
        });
        
        } catch (error) {
        console.error('❌ Error fetching comprehensive water data:', error);
        // Fallback to basic water conditions
        try {
          if (dam.usgsStation) {
            const directWaterData = await WaterConditionsService.fetchUSGSData(dam.usgsStation.siteCode);
            if (directWaterData) {
              comprehensiveWaterData = {
                water_conditions: {
                  ...directWaterData,
                  stationId: dam.usgsStation.siteCode,
                  stationName: dam.usgsStation.stationName,
                  dataSource: 'USGS' as const,
                  lastUpdated: new Date().toISOString(),
                },
                enhanced_data: {}
              };
            }
          }
          
          if (!comprehensiveWaterData) {
            const basicWaterData = await WaterConditionsService.getWaterConditions({ 
              latitude: dam.coordinates.latitude, 
              longitude: dam.coordinates.longitude 
            });
            comprehensiveWaterData = {
              water_conditions: basicWaterData || WaterConditionsService.getDefaultWaterConditions({
                latitude: dam.coordinates.latitude,
                longitude: dam.coordinates.longitude
              }),
              enhanced_data: {}
            };
          }
        } catch (fallbackError) {
          console.error('❌ Fallback water conditions also failed:', fallbackError);
          comprehensiveWaterData = {
            water_conditions: WaterConditionsService.getDefaultWaterConditions({
              latitude: dam.coordinates.latitude,
              longitude: dam.coordinates.longitude
            }),
            enhanced_data: {}
          };
        }
      }
      
      const waterConditionsData = comprehensiveWaterData.water_conditions;
      
      setWaterConditions(waterConditionsData);
      
      // Log water conditions data for debugging
      if (waterConditionsData) {
        } else {
        console.warn('⚠️ No water conditions data received');
      }
      
      // Get current time for time-based calculations
      const now = new Date();
      const hour = now.getHours();
      
      // Helper functions for time-based conditions
      const getTimeOfDay = (): FishingConditions['time_of_day'] => {
        if (hour >= 5 && hour < 8) return 'dawn';
        if (hour >= 8 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'midday';
        if (hour >= 17 && hour < 20) return 'afternoon';
        if (hour >= 20 && hour < 22) return 'dusk';
        return 'night';
      };
      
      const getTimeOfYear = (): FishingConditions['time_of_year'] => {
        const month = now.getMonth() + 1;
        if (month === 12 || month === 1 || month === 2) return 'winter';
        if (month === 3) return 'early_spring';
        if (month === 4) return 'spring';
        if (month === 5) return 'late_spring';
        if (month === 6) return 'early_summer';
        if (month === 7 || month === 8) return 'summer';
        if (month === 9) return 'late_summer';
        if (month === 10) return 'fall';
        if (month === 11) return 'late_fall';
        return 'summer';
      };
      
      // Get comprehensive lunar and solunar data for the location
      const lunarData = LunarService.getMoonPhase(now);
      const comprehensiveSolunarData = LunarService.getComprehensiveSolunarData(now, dam.coordinates.latitude, dam.coordinates.longitude);
      
      // Get comprehensive hatch data for the location
      const hatchData = getComprehensiveHatchData(
        dam.riverSystem,
        dam.coordinates.latitude,
        dam.coordinates.longitude,
        now,
        waterConditionsData?.waterTemperature,
        getTimeOfDay()
      );
      
      // Debug: Log what data we actually have for this location
      // Build comprehensive fishing conditions with lunar data
      const fishingConditions: Partial<FishingConditions> = {
        date: now.toISOString().split('T')[0],
        location: dam.name,
        latitude: dam.coordinates.latitude,
        longitude: dam.coordinates.longitude,
        location_address: `${dam.coordinates.latitude.toFixed(4)}, ${dam.coordinates.longitude.toFixed(4)}`,
        
        // Weather conditions
        weather_conditions: weatherConditions?.weather_conditions || 'sunny',
        wind_speed: weatherConditions?.wind_speed || 'light',
        wind_direction: weatherConditions?.wind_direction || 'variable',
        air_temperature_range: weatherConditions?.air_temperature_range || 'moderate',
        
        // Water conditions
        water_conditions: 'calm',
        water_clarity: waterConditionsData?.turbidity ? 
          (waterConditionsData.turbidity > 50 ? 'very_murky' :
           waterConditionsData.turbidity > 20 ? 'murky' :
           waterConditionsData.turbidity > 5 ? 'slightly_murky' : 'clear') : 'clear',
        water_level: waterConditionsData?.gaugeHeight ? 
          (waterConditionsData.gaugeHeight > 10 ? 'high' :
           waterConditionsData.gaugeHeight < 3 ? 'low' : 'normal') : 'normal',
        water_flow: waterConditionsData?.flowRate ? 
          (waterConditionsData.flowRate > 200 ? 'fast' :
           waterConditionsData.flowRate < 50 ? 'slow' : 'moderate') : 'moderate',
        water_temperature_range: waterConditionsData?.waterTemperature ? 
          (waterConditionsData.waterTemperature < 45 ? 'very_cold' :
           waterConditionsData.waterTemperature < 55 ? 'cold' :
           waterConditionsData.waterTemperature < 65 ? 'cool' :
           waterConditionsData.waterTemperature < 75 ? 'moderate' :
           waterConditionsData.waterTemperature < 85 ? 'warm' : 'hot') : 'moderate',
        water_temperature: waterConditionsData?.waterTemperature,
        
        // Time-based conditions
        time_of_day: getTimeOfDay(),
        time_of_year: getTimeOfYear(),
        
        // Lunar conditions
        moon_phase: lunarData.phase,
        moon_illumination: lunarData.illumination,
        lunar_feeding_activity: lunarData.feedingActivity,
        solunar_periods: comprehensiveSolunarData,
        
        // Hatch chart data
        hatch_data: hatchData,
        
        // Enhanced weather data
        weather_data: comprehensiveWeather ? {
          temperature: comprehensiveWeather.current.temperature,
          humidity: comprehensiveWeather.detailed.humidity,
          pressure: comprehensiveWeather.detailed.pressure,
          visibility: comprehensiveWeather.detailed.visibility,
          uv_index: comprehensiveWeather.detailed.uv_index,
          cloud_cover: comprehensiveWeather.detailed.cloud_cover,
          precipitation: comprehensiveWeather.detailed.precipitation,
          forecast: comprehensiveWeather.forecast.map(day => ({
            date: new Date().toISOString().split('T')[0], // Use current date as placeholder
            high_temp: day.temperature + 5, // Approximate high
            low_temp: day.temperature - 5,  // Approximate low
            condition: day.weather_condition,
            precipitation_chance: 20 // Default precipitation chance
          }))
        } : undefined,
        
        // Real-time water data
        water_data: waterConditionsData ? {
          flowRate: waterConditionsData.flowRate || 0,
          waterTemperature: waterConditionsData.waterTemperature,
          gaugeHeight: waterConditionsData.gaugeHeight || 0,
          turbidity: waterConditionsData.turbidity,
          dissolvedOxygen: waterConditionsData.dissolvedOxygen,
          pH: waterConditionsData.pH,
          conductivity: waterConditionsData.conductivity,
          stationId: waterConditionsData.stationId,
          stationName: waterConditionsData.stationName || dam.name,
          lastUpdated: waterConditionsData.lastUpdated,
          dataSource: waterConditionsData.dataSource,
          dataQuality: waterConditionsData.dataQuality || 'UNKNOWN',
          isActive: waterConditionsData.isActive
        } : undefined,
        
        // Additional metadata
        notes: `Dam location selected at ${now.toLocaleTimeString()} - ${dam.riverSystem} (${dam.reservoir})`
      };
      
      // Debug: Log the final fishing conditions object
      // Store comprehensive fishing conditions
      setCurrentFishingConditions(fishingConditions);
      
      // Notify parent component with enhanced data
      onLocationSelect?.({ latitude: dam.coordinates.latitude, longitude: dam.coordinates.longitude }, nearestRiver);
      
      // Notify parent that a location has been selected
      onLocationSelected?.(true);
      
      // Show results modal
      setShowResults(true);
      
    } catch (error) {
      console.error('Error processing dam location:', error);
      Alert.alert('Error', 'Failed to get dam location data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onLocationSelect, onLocationSelected]);

  const handleReservoirPathPress = useCallback(async (pathId: string) => {
    const path = getReservoirPathById(pathId);
    if (!path) {
      console.error('Reservoir path not found:', pathId);
      Alert.alert('Error', 'Reservoir path not found. Please try again.');
      return;
    }
    
    if (!path.coordinates || path.coordinates.length === 0) {
      console.error('Reservoir path has no coordinates:', path);
      Alert.alert('Error', 'Reservoir path data is incomplete.');
      return;
    }
    
    setSelectedRiverPath(path);
    setIsLoading(true);
    
    try {
      // Get coordinates from the middle of the reservoir path
      const midPoint = Math.floor(path.coordinates.length / 2);
      const [longitude, latitude] = path.coordinates[midPoint];
      
      // Validate coordinates
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        console.error('Invalid reservoir path coordinates:', { latitude, longitude });
        Alert.alert('Error', 'Invalid reservoir path coordinates.');
        return;
      }
      
      const coords: Coordinates = { latitude, longitude };
      
      // Set selected coordinates for consistency with regular map press
      setSelectedCoordinates(coords);
      
      // Find nearest river for location context
      const nearestRiver = await findNearestRiver(latitude, longitude);
      setSelectedLocation(nearestRiver);
      
      // Fetch real-time weather data for better accuracy
      const realWeather = await weatherService.getWeatherForLocation(latitude, longitude);
      setRealTimeWeatherData(realWeather);
      
      // Convert weather data to fishing conditions format
      const weatherConditions = realWeather ? weatherService.convertToFishingConditions(realWeather) : null;
      
      // Fetch water conditions for the location
      const waterConditionsData = await WaterConditionsService.getWaterConditions(coords);
      setWaterConditions(waterConditionsData);
      
      // Get current time for time-based calculations
      const now = new Date();
      const hour = now.getHours();
      
      // Helper functions for time-based conditions
      const getTimeOfDay = (): FishingConditions['time_of_day'] => {
        if (hour >= 5 && hour < 8) return 'dawn';
        if (hour >= 8 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'midday';
        if (hour >= 17 && hour < 20) return 'afternoon';
        if (hour >= 20 && hour < 22) return 'dusk';
        return 'night';
      };
      
      const getTimeOfYear = (): FishingConditions['time_of_year'] => {
        const month = now.getMonth() + 1;
        if (month === 12 || month === 1 || month === 2) return 'winter';
        if (month === 3) return 'early_spring';
        if (month === 4) return 'spring';
        if (month === 5) return 'late_spring';
        if (month === 6) return 'early_summer';
        if (month === 7 || month === 8) return 'summer';
        if (month === 9) return 'late_summer';
        if (month === 10) return 'fall';
        if (month === 11) return 'late_fall';
        return 'summer';
      };
      
      // Get lunar data for the location
      const lunarData = LunarService.getMoonPhase(now);
      const solunarData = LunarService.getSolunarPeriods(now, latitude, longitude);
      
      // Build comprehensive fishing conditions with lunar data
      const fishingConditions: Partial<FishingConditions> = {
        date: now.toISOString().split('T')[0],
        location: `${path.name} - ${path.riverSystem}`,
        latitude,
        longitude,
        location_address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        
        // Weather conditions
        weather_conditions: weatherConditions?.weather_conditions || 'sunny',
        wind_speed: weatherConditions?.wind_speed || 'light',
        wind_direction: weatherConditions?.wind_direction || 'variable',
        air_temperature_range: weatherConditions?.air_temperature_range || 'moderate',
        
        // Water conditions
        water_conditions: 'calm', // Default, could be enhanced based on flow
        water_clarity: waterConditionsData?.turbidity ? 
          (waterConditionsData.turbidity > 50 ? 'very_murky' :
           waterConditionsData.turbidity > 20 ? 'murky' :
           waterConditionsData.turbidity > 5 ? 'slightly_murky' : 'clear') : 'clear',
        water_level: waterConditionsData?.gaugeHeight ? 
          (waterConditionsData.gaugeHeight > 10 ? 'high' :
           waterConditionsData.gaugeHeight < 3 ? 'low' : 'normal') : 'normal',
        water_flow: waterConditionsData?.flowRate ? 
          (waterConditionsData.flowRate > 200 ? 'fast' :
           waterConditionsData.flowRate < 50 ? 'slow' : 'moderate') : 'moderate',
        water_temperature_range: waterConditionsData?.waterTemperature ? 
          (waterConditionsData.waterTemperature < 45 ? 'very_cold' :
           waterConditionsData.waterTemperature < 55 ? 'cold' :
           waterConditionsData.waterTemperature < 65 ? 'cool' :
           waterConditionsData.waterTemperature < 75 ? 'moderate' :
           waterConditionsData.waterTemperature < 85 ? 'warm' : 'hot') : 'moderate',
        water_temperature: waterConditionsData?.waterTemperature,
        
        // Time-based conditions
        time_of_day: getTimeOfDay(),
        time_of_year: getTimeOfYear(),
        
        // Lunar conditions
        moon_phase: lunarData.phase,
        moon_illumination: lunarData.illumination,
        lunar_feeding_activity: lunarData.feedingActivity,
        solunar_periods: {
          major_periods: solunarData.major.map(period => ({
            start: period.start.toISOString(),
            end: period.end.toISOString(),
            duration: period.end.getTime() - period.start.getTime(),
            peak: new Date((period.start.getTime() + period.end.getTime()) / 2).toISOString()
          })),
          minor_periods: solunarData.minor.map(period => ({
            start: period.start.toISOString(),
            end: period.end.toISOString(),
            duration: period.end.getTime() - period.start.getTime(),
            peak: new Date((period.start.getTime() + period.end.getTime()) / 2).toISOString()
          })),
          sunrise: new Date().toISOString(), // Placeholder - would need actual sunrise calculation
          sunset: new Date().toISOString(), // Placeholder - would need actual sunset calculation
          moonrise: new Date().toISOString(), // Placeholder - would need actual moonrise calculation
          moonset: new Date().toISOString() // Placeholder - would need actual moonset calculation
        },
        
        // Real-time water data
        water_data: waterConditionsData ? {
          flowRate: waterConditionsData.flowRate || 0,
          waterTemperature: waterConditionsData.waterTemperature,
          gaugeHeight: waterConditionsData.gaugeHeight || 0,
          turbidity: waterConditionsData.turbidity,
          dissolvedOxygen: waterConditionsData.dissolvedOxygen,
          pH: waterConditionsData.pH,
          conductivity: waterConditionsData.conductivity,
          stationId: waterConditionsData.stationId,
          stationName: waterConditionsData.stationName || 'Reservoir Path Location',
          lastUpdated: waterConditionsData.lastUpdated,
          dataSource: waterConditionsData.dataSource,
          dataQuality: waterConditionsData.dataQuality || 'UNKNOWN',
          isActive: waterConditionsData.isActive
        } : undefined,
        
        // Additional metadata
        notes: `Reservoir path selected at ${now.toLocaleTimeString()} - ${path.riverSystem} (${path.properties.reservoir})`
      };
      
      // Store comprehensive fishing conditions
      setCurrentFishingConditions(fishingConditions);
      
      } catch (error) {
      console.error('Error gathering reservoir path conditions:', error);
      // Continue with basic setup even if real-time data fails
    } finally {
      setIsLoading(false);
    }
    
    // Create a compatible river segment object for the display component
    const compatibleSegment = {
      id: path.id,
      name: path.name,
      riverSystem: path.riverSystem,
      segmentType: path.segmentType,
      coordinates: {
        longitude: path.coordinates[0][0], // First coordinate
        latitude: path.coordinates[0][1]
      },
      description: `${path.name} - ${path.segmentType} section from ${path.properties.reservoir}`,
      difficulty: path.properties.difficulty,
      access: path.properties.access,
      fishSpecies: path.properties.fishSpecies || [],
      popular: path.properties.popular,
      featured: path.properties.featured,
      waterType: path.segmentType === 'tailwater' ? 'Tailwater' : 'Freestone',
      length: 'Varies',
      elevation: 'Varies',
      bestSeasons: ['spring', 'summer', 'fall'],
      hatches: [
        'Blue Winged Olive',
        'Pale Morning Dun',
        'Caddis',
        'Stonefly'
      ],
      currentConditions: {
        waterLevel: 'normal',
        waterClarity: 'clear',
        waterTemperature: 55,
        flowRate: 'moderate',
        recentHatches: ['Blue Winged Olive', 'Caddis']
      },
      accessPoints: [],
      nearbyServices: {
        flyShops: [],
        restaurants: [],
        lodging: []
      },
      regulations: {
        specialRestrictions: [],
        catchAndRelease: true,
        fishingLicenseRequired: true
      },
      conditions: {
        waterLevel: 'normal',
        waterClarity: 'clear',
        waterTemperature: 'moderate',
        flowRate: 'moderate'
      }
    };
    
    setSelectedRiverSegment(compatibleSegment);
    setShowRiverDisplay(true);
    onRiverPathSelect?.(path);
    
    // Notify parent that a location has been selected
    onLocationSelected?.(true);
    
    // Center map on the middle of the reservoir path
    const midPoint = Math.floor(path.coordinates.length / 2);
    const centerCoord = path.coordinates[midPoint];
    
    if (mapRef.current && Mapbox) {
      mapRef.current.setCamera({
        centerCoordinate: centerCoord,
        zoomLevel: MAPBOX_CONFIG.ZOOM_LEVELS.LOCAL,
        animationDuration: 1000,
      });
    }
  }, [onRiverPathSelect, onLocationSelected]);

  const handleRiverPathPress = useCallback(async (pathId: string) => {
    const path = getRiverPathById(pathId);
    if (!path) {
      console.error('River path not found:', pathId);
      Alert.alert('Error', 'River path not found. Please try again.');
      return;
    }
    
    if (!path.coordinates || path.coordinates.length === 0) {
      console.error('River path has no coordinates:', path);
      Alert.alert('Error', 'River path data is incomplete.');
      return;
    }
    
    setSelectedRiverPath(path);
    setIsLoading(true);
    
    try {
      // Get coordinates from the middle of the river path for better accuracy
      const midPoint = Math.floor(path.coordinates.length / 2);
      const [longitude, latitude] = path.coordinates[midPoint];
      
      // Validate coordinates
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        console.error('Invalid river path coordinates:', { latitude, longitude });
        Alert.alert('Error', 'Invalid river path coordinates.');
        return;
      }
      
      const coords: Coordinates = { latitude, longitude };
      
      // Set selected coordinates for consistency with regular map press
      setSelectedCoordinates(coords);
      
      // Find nearest river for location context
      const nearestRiver = await findNearestRiver(latitude, longitude);
      setSelectedLocation(nearestRiver);
      
      // Fetch real-time weather data for better accuracy
      const realWeather = await weatherService.getWeatherForLocation(latitude, longitude);
      setRealTimeWeatherData(realWeather);
      
      // Convert weather data to fishing conditions format
      const weatherConditions = realWeather ? weatherService.convertToFishingConditions(realWeather) : null;
      
      // Fetch water conditions for the location
      const waterConditionsData = await WaterConditionsService.getWaterConditions(coords);
      setWaterConditions(waterConditionsData);
      
      // Get current time for time-based calculations
      const now = new Date();
      const hour = now.getHours();
      
      // Helper functions for time-based conditions
      const getTimeOfDay = (): FishingConditions['time_of_day'] => {
        if (hour >= 5 && hour < 8) return 'dawn';
        if (hour >= 8 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'midday';
        if (hour >= 17 && hour < 20) return 'afternoon';
        if (hour >= 20 && hour < 22) return 'dusk';
        return 'night';
      };
      
      const getTimeOfYear = (): FishingConditions['time_of_year'] => {
        const month = now.getMonth() + 1;
        if (month === 12 || month === 1 || month === 2) return 'winter';
        if (month === 3) return 'early_spring';
        if (month === 4) return 'spring';
        if (month === 5) return 'late_spring';
        if (month === 6) return 'early_summer';
        if (month === 7 || month === 8) return 'summer';
        if (month === 9) return 'late_summer';
        if (month === 10) return 'fall';
        if (month === 11) return 'late_fall';
        return 'summer';
      };
      
      // Get lunar data for the location
      const lunarData = LunarService.getMoonPhase(now);
      const solunarData = LunarService.getSolunarPeriods(now, latitude, longitude);
      
      // Build comprehensive fishing conditions with lunar data
      const fishingConditions: Partial<FishingConditions> = {
        date: now.toISOString().split('T')[0],
        location: `${path.name} - ${path.riverSystem}`,
        latitude,
        longitude,
        location_address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        
        // Weather conditions
        weather_conditions: weatherConditions?.weather_conditions || 'sunny',
        wind_speed: weatherConditions?.wind_speed || 'light',
        wind_direction: weatherConditions?.wind_direction || 'variable',
        air_temperature_range: weatherConditions?.air_temperature_range || 'moderate',
        
        // Water conditions
        water_conditions: 'calm', // Default, could be enhanced based on flow
        water_clarity: waterConditionsData?.turbidity ? 
          (waterConditionsData.turbidity > 50 ? 'very_murky' :
           waterConditionsData.turbidity > 20 ? 'murky' :
           waterConditionsData.turbidity > 5 ? 'slightly_murky' : 'clear') : 'clear',
        water_level: waterConditionsData?.gaugeHeight ? 
          (waterConditionsData.gaugeHeight > 10 ? 'high' :
           waterConditionsData.gaugeHeight < 3 ? 'low' : 'normal') : 'normal',
        water_flow: waterConditionsData?.flowRate ? 
          (waterConditionsData.flowRate > 200 ? 'fast' :
           waterConditionsData.flowRate < 50 ? 'slow' : 'moderate') : 'moderate',
        water_temperature_range: waterConditionsData?.waterTemperature ? 
          (waterConditionsData.waterTemperature < 45 ? 'very_cold' :
           waterConditionsData.waterTemperature < 55 ? 'cold' :
           waterConditionsData.waterTemperature < 65 ? 'cool' :
           waterConditionsData.waterTemperature < 75 ? 'moderate' :
           waterConditionsData.waterTemperature < 85 ? 'warm' : 'hot') : 'moderate',
        water_temperature: waterConditionsData?.waterTemperature,
        
        // Time-based conditions
        time_of_day: getTimeOfDay(),
        time_of_year: getTimeOfYear(),
        
        // Lunar conditions
        moon_phase: lunarData.phase,
        moon_illumination: lunarData.illumination,
        lunar_feeding_activity: lunarData.feedingActivity,
        solunar_periods: {
          major_periods: solunarData.major.map(period => ({
            start: period.start.toISOString(),
            end: period.end.toISOString(),
            duration: period.end.getTime() - period.start.getTime(),
            peak: new Date((period.start.getTime() + period.end.getTime()) / 2).toISOString()
          })),
          minor_periods: solunarData.minor.map(period => ({
            start: period.start.toISOString(),
            end: period.end.toISOString(),
            duration: period.end.getTime() - period.start.getTime(),
            peak: new Date((period.start.getTime() + period.end.getTime()) / 2).toISOString()
          })),
          sunrise: new Date().toISOString(), // Placeholder - would need actual sunrise calculation
          sunset: new Date().toISOString(), // Placeholder - would need actual sunset calculation
          moonrise: new Date().toISOString(), // Placeholder - would need actual moonrise calculation
          moonset: new Date().toISOString() // Placeholder - would need actual moonset calculation
        },
        
        // Real-time water data
        water_data: waterConditionsData ? {
          flowRate: waterConditionsData.flowRate || 0,
          waterTemperature: waterConditionsData.waterTemperature,
          gaugeHeight: waterConditionsData.gaugeHeight || 0,
          turbidity: waterConditionsData.turbidity,
          dissolvedOxygen: waterConditionsData.dissolvedOxygen,
          pH: waterConditionsData.pH,
          conductivity: waterConditionsData.conductivity,
          stationId: waterConditionsData.stationId,
          stationName: waterConditionsData.stationName || 'River Path Location',
          lastUpdated: waterConditionsData.lastUpdated,
          dataSource: waterConditionsData.dataSource,
          dataQuality: waterConditionsData.dataQuality || 'UNKNOWN',
          isActive: waterConditionsData.isActive
        } : undefined,
        
        // Additional metadata
        notes: `River path selected at ${now.toLocaleTimeString()} - ${path.riverSystem}`
      };
      
      // Store comprehensive fishing conditions
      setCurrentFishingConditions(fishingConditions);
      
      } catch (error) {
      console.error('Error gathering river path conditions:', error);
      // Continue with basic setup even if real-time data fails
    } finally {
      setIsLoading(false);
    }
    
    // Create a compatible river segment object for the display component
    const compatibleSegment = {
      id: path.id,
      name: path.name,
      riverSystem: path.riverSystem,
      segmentType: path.segmentType,
      coordinates: {
        longitude: path.coordinates[0][0], // First coordinate
        latitude: path.coordinates[0][1]
      },
      description: `${path.name} - ${path.segmentType} section of the ${path.riverSystem}`,
      difficulty: path.properties.difficulty,
      access: path.properties.access,
      fishSpecies: path.properties.fishSpecies || [],
      popular: path.properties.popular,
      featured: path.properties.featured,
      waterType: path.segmentType === 'tailwater' ? 'Tailwater' : 'Freestone',
      length: 'Varies',
      elevation: 'Varies',
      bestSeasons: ['spring', 'summer', 'fall'],
      hatches: [
        'Blue Winged Olive',
        'Pale Morning Dun',
        'Caddis',
        'Stonefly'
      ],
      currentConditions: {
        waterLevel: 'normal',
        waterClarity: 'clear',
        waterTemperature: 55,
        flowRate: 'moderate',
        recentHatches: ['Blue Winged Olive', 'Caddis']
      },
      accessPoints: [],
      nearbyServices: {
        flyShops: [],
        restaurants: [],
        lodging: []
      },
      regulations: {
        specialRestrictions: [],
        catchAndRelease: true,
        fishingLicenseRequired: true
      },
      conditions: {
        waterLevel: 'normal',
        waterClarity: 'clear',
        waterTemperature: 'moderate',
        flowRate: 'moderate'
      }
    };
    
    setSelectedRiverSegment(compatibleSegment);
    setShowRiverDisplay(true);
    onRiverPathSelect?.(path);
    
    // Notify parent that a location has been selected
    onLocationSelected?.(true);
    
    // Center map on the middle of the river path
    const midPoint = Math.floor(path.coordinates.length / 2);
    const centerCoord = path.coordinates[midPoint];
    
    if (mapRef.current && Mapbox) {
      mapRef.current.setCamera({
        centerCoordinate: centerCoord,
        zoomLevel: MAPBOX_CONFIG.ZOOM_LEVELS.LOCAL,
        animationDuration: 1000,
      });
    }
  }, [onRiverPathSelect, onLocationSelected]);

  const handleNavigateToRiverSegment = useCallback((coordinates: { latitude: number; longitude: number }) => {
    if (mapRef.current && Mapbox) {
      mapRef.current.setCamera({
        centerCoordinate: [coordinates.longitude, coordinates.latitude],
        zoomLevel: MAPBOX_CONFIG.ZOOM_LEVELS.LOCAL,
        animationDuration: 1000,
      });
    }
  }, []);


  const clearSelection = useCallback(() => {
    setSelectedCoordinates(null);
    setSelectedLocation(null);
    setWeatherData(null);
    setWaterConditions(null);
    setShowResults(false);
    
    // Notify parent that selection has been cleared
    onLocationSelected?.(false);
  }, [onLocationSelected]);

  // Watch for showDetailsModal prop to open modal from parent
  useEffect(() => {
    if (showDetailsModal && selectedCoordinates) {
      setShowResults(true);
    }
  }, [showDetailsModal, selectedCoordinates]);

  // Watch for modal close and notify parent
  useEffect(() => {
    if (!showResults && showDetailsModal) {
      onModalClosed?.();
    }
  }, [showResults, showDetailsModal, onModalClosed]);

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_CONFIG.ACCESS_TOKEN}&types=place,locality,address,poi&limit=5`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        setSearchResults(data.features);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
        Alert.alert('No Results', 'No locations found for your search.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      Alert.alert('Search Error', 'Failed to search for locations. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultSelect = async (result: any) => {
    const [longitude, latitude] = result.center;
    
    // Move map camera to the selected location
    if (mapRef.current && Mapbox) {
      mapRef.current.setCamera({
        centerCoordinate: [longitude, latitude],
        zoomLevel: 12,
        animationDuration: 1000,
      });
    }
    
    // Clear search UI
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    
    // Trigger location analysis
    await handleMapPress(null, [longitude, latitude]);
  };

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
              <Text style={styles.cardText}>Coordinates: {selectedCoordinates ? formatCoordinates(selectedCoordinates) : 'Unknown'}</Text>
            </View>
          )}

          {selectedLocation && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>🏞️ Nearest Fishing Spot</Text>
              <Text style={styles.cardText}>Name: {selectedLocation.name || 'Unknown'}</Text>
              <Text style={styles.cardText}>Type: {selectedLocation.type || 'Unknown'}</Text>
              {selectedLocation.description && (
                <Text style={styles.cardText}>Description: {selectedLocation.description}</Text>
              )}
            </View>
          )}

          {weatherData && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>🌤️ Current Weather</Text>
              <Text style={styles.cardText}>Temperature: {weatherData.temperature || 'Unknown'}°F</Text>
              <Text style={styles.cardText}>Condition: {weatherData.condition || 'Unknown'}</Text>
              <Text style={styles.cardText}>Wind: {weatherData.windSpeed || 'Unknown'} mph {weatherData.windDirection || ''}</Text>
              <Text style={styles.cardText}>Humidity: {weatherData.humidity || 'Unknown'}%</Text>
            </View>
          )}

          {waterConditions && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>🌊 Water Conditions</Text>
              <View style={styles.waterConditionsHeader}>
                <Text style={styles.cardText}>
                  {WaterConditionsService.getWaterConditionSummary(waterConditions) || 'No water data available'}
                </Text>
                <View style={[
                  styles.dataQualityBadge,
                  { backgroundColor: waterConditions.dataQuality === 'GOOD' ? '#4CAF50' : 
                                    waterConditions.dataQuality === 'FAIR' ? '#FF9800' : '#F44336' }
                ]}>
                  <Text style={styles.dataQualityText}>
                    {waterConditions.dataQuality || 'UNKNOWN'}
                  </Text>
                </View>
              </View>
              
              {waterConditions.flowRate && (
                <Text style={styles.cardText}>Flow Rate: {waterConditions.flowRate} cfs</Text>
              )}
              {waterConditions.waterTemperature && (
                <Text style={styles.cardText}>Water Temp: {waterConditions.waterTemperature}°F</Text>
              )}
              {waterConditions.gaugeHeight && (
                <Text style={styles.cardText}>Gauge Height: {waterConditions.gaugeHeight} ft</Text>
              )}
              {waterConditions.stationName && (
                <Text style={styles.cardText}>Station: {waterConditions.stationName}</Text>
              )}
              {waterConditions.dataSource && (
                <Text style={styles.cardText}>Data Source: {waterConditions.dataSource}</Text>
              )}
              {waterConditions.lastUpdated && (
                <Text style={styles.cardSubtext}>
                  Last Updated: {new Date(waterConditions.lastUpdated).toLocaleString()}
                </Text>
              )}
              
              {/* Water condition rating */}
              {(() => {
                const rating = WaterConditionsService.getWaterConditionRating(waterConditions);
                return (
                  <View style={styles.ratingContainer}>
                    <Text style={[
                      styles.ratingText,
                      { color: rating.rating === 'EXCELLENT' ? '#4CAF50' :
                               rating.rating === 'GOOD' ? '#8BC34A' :
                               rating.rating === 'FAIR' ? '#FF9800' : '#F44336' }
                    ]}>
                      🎣 {rating.description || 'Unknown rating'}
                    </Text>
                    {(rating.factors || []).filter(factor => typeof factor === 'string').map((factor, index) => (
                      <Text key={index} style={styles.factorText}>• {factor}</Text>
                    ))}
                  </View>
                );
              })()}
            </View>
          )}


          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.flySuggestionsButton}
              onPress={() => {
                if (onGetFlySuggestions && selectedCoordinates && selectedLocation) {
                  // Use realTimeWeatherData instead of weatherData for consistency
                  onGetFlySuggestions(selectedCoordinates, selectedLocation, realTimeWeatherData, waterConditions, currentFishingConditions);
                  setShowResults(false); // Close the modal
                }
              }}
            >
              <Text style={styles.flySuggestionsButtonText}>🎣 Get Fly Suggestions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
              <Text style={styles.clearButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  // Debug logging
  // Show placeholder for web or if Mapbox is not available
  if (Platform.OS === 'web' || !Mapbox) {
    return (
      <View style={styles.container}>
        {/* Search Bar for Web/Placeholder */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => searchLocation(searchQuery)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                style={styles.clearSearchButton}
              >
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => searchLocation(searchQuery)}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#25292e" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <ScrollView style={styles.searchResultsList}>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.searchResultItem}
                    onPress={() => handleSearchResultSelect(result)}
                  >
                    <Text style={styles.searchResultTitle}>{result.place_name}</Text>
                    <Text style={styles.searchResultSubtitle}>
                      {result.place_type?.join(', ') || 'Location'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

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
            
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => {
                const coords = { latitude: 40.9, longitude: -109.4 };
                handleMapPress(null, [coords.longitude, coords.latitude]);
              }}
            >
              <Text style={styles.locationButtonText}>🌊 Green River - Flaming Gorge</Text>
              <Text style={styles.locationButtonSubtext}>40.9°N, 109.4°W</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => {
                const coords = { latitude: 41.2, longitude: -111.8 };
                handleMapPress(null, [coords.longitude, coords.latitude]);
              }}
            >
              <Text style={styles.locationButtonText}>🏞️ Weber River - Main Stem</Text>
              <Text style={styles.locationButtonSubtext}>41.2°N, 111.8°W</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => {
                const coords = { latitude: 40.2, longitude: -111.2 };
                handleMapPress(null, [coords.longitude, coords.latitude]);
              }}
            >
              <Text style={styles.locationButtonText}>🐟 Strawberry Reservoir</Text>
              <Text style={styles.locationButtonSubtext}>40.2°N, 111.2°W</Text>
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
    <>
    <View style={styles.container}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={mapStyle}
        onPress={(feature: any) => {
          // If we have a feature with coordinates, use those
          if (feature && feature.geometry && feature.geometry.coordinates) {
            handleMapPress(feature, feature.geometry.coordinates);
          }
        }}
        onTouchEnd={(event: any) => {
          // For debugging - we'll handle empty area taps differently
        }}
      >
        <Mapbox.Camera
          defaultSettings={defaultCamera}
          centerCoordinate={defaultCamera.centerCoordinate}
          zoomLevel={defaultCamera.zoomLevel}
        />

        {/* River segment markers */}
        {showRiverMarkers && Mapbox && riverSegmentsToGeoJSON().features.map((feature: any) => (
          <Mapbox.PointAnnotation
            key={feature.properties.id}
            id={`river-${feature.properties.id}`}
            coordinate={feature.geometry.coordinates}
            onSelected={() => handleRiverSegmentPress(feature.properties.id)}
          >
            <View style={[
              styles.riverMarker,
              { 
                backgroundColor: feature.properties.featured ? '#ffd33d' : 
                                feature.properties.popular ? '#4CAF50' : '#2196F3'
              }
            ]}>
              <Text style={styles.riverMarkerText}>🌊</Text>
            </View>
          </Mapbox.PointAnnotation>
        ))}

        {/* Dam location markers */}
        {showRiverPaths && Mapbox && DAM_LOCATIONS.map((dam) => (
          <Mapbox.PointAnnotation
            key={`dam-${dam.id}`}
            id={`dam-${dam.id}`}
            coordinate={[dam.coordinates.longitude, dam.coordinates.latitude]}
            onSelected={() => {
              handleDamLocationPress(dam.id);
            }}
          >
            <View style={[
              styles.damMarker,
              {
                backgroundColor: dam.properties.featured ? '#FF6B35' : 
                                dam.properties.popular ? '#FF8C42' : '#FFA500',
                borderColor: '#FFFFFF',
                borderWidth: 2,
              }
            ]}>
              <Text style={styles.damMarkerText}>
                {dam.properties.featured ? '🏆' : '🎣'}
              </Text>
            </View>
          </Mapbox.PointAnnotation>
        ))}

        {/* Selected point marker (user tapped location) */}
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a location..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => searchLocation(searchQuery)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowSearchResults(false);
              }}
              style={styles.clearSearchButton}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => searchLocation(searchQuery)}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#25292e" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <ScrollView style={styles.searchResultsList}>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultItem}
                  onPress={() => handleSearchResultSelect(result)}
                >
                  <Text style={styles.searchResultTitle}>{result.place_name}</Text>
                  <Text style={styles.searchResultSubtitle}>
                    {result.place_type?.join(', ') || 'Location'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Map Style Switcher */}
      <View style={styles.mapControls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => setShowStylePicker(!showStylePicker)}
        >
          <Text style={styles.controlButtonText}>🗺️</Text>
        </TouchableOpacity>
      </View>

      {/* Style Picker Dropdown */}
      {showStylePicker && (
        <View style={styles.stylePicker}>
          <TouchableOpacity
            style={[styles.styleOption, mapStyle === MAPBOX_CONFIG.STYLES.OUTDOORS && styles.styleOptionActive]}
            onPress={() => {
              setMapStyle(MAPBOX_CONFIG.STYLES.OUTDOORS);
              setShowStylePicker(false);
            }}
          >
            <Text style={styles.styleOptionText}>🏞️ Outdoors (Best for Fishing)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.styleOption, mapStyle === MAPBOX_CONFIG.STYLES.SATELLITE && styles.styleOptionActive]}
            onPress={() => {
              setMapStyle(MAPBOX_CONFIG.STYLES.SATELLITE);
              setShowStylePicker(false);
            }}
          >
            <Text style={styles.styleOptionText}>🛰️ Satellite</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.styleOption, mapStyle === MAPBOX_CONFIG.STYLES.SATELLITE_STREETS && styles.styleOptionActive]}
            onPress={() => {
              setMapStyle(MAPBOX_CONFIG.STYLES.SATELLITE_STREETS);
              setShowStylePicker(false);
            }}
          >
            <Text style={styles.styleOptionText}>🗺️ Satellite + Streets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.styleOption, mapStyle === MAPBOX_CONFIG.STYLES.STREETS && styles.styleOptionActive]}
            onPress={() => {
              setMapStyle(MAPBOX_CONFIG.STYLES.STREETS);
              setShowStylePicker(false);
            }}
          >
            <Text style={styles.styleOptionText}>🚗 Streets</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Legend removed - no markers to display */}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffd33d" />
          <Text style={styles.loadingText}>Analyzing location...</Text>
        </View>
      )}


      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          {selectedCoordinates 
            ? 'Location selected! Use the button above to view details'
            : 'Tap anywhere on the map to get fishing recommendations and water conditions'}
        </Text>
      </View>

      <ResultsModal />
      
      {/* River Display Modal */}
      {selectedRiverSegment && (
        <RiverDisplay
          riverSegment={selectedRiverSegment}
          onClose={() => {
            setShowRiverDisplay(false);
            setSelectedRiverSegment(null);
          }}
          onNavigateToLocation={handleNavigateToRiverSegment}
          onGetFlySuggestions={(coordinates, riverSegment) => {
            if (onGetFlySuggestions) {
              // Create a river location object for consistency
              const riverLocation = {
                id: riverSegment.id,
                name: riverSegment.name,
                type: 'river' as const,
                coordinates: coordinates,
                description: riverSegment.description
              };
              
              // Use existing weather and water data if available
              onGetFlySuggestions(coordinates, riverLocation, realTimeWeatherData, waterConditions, currentFishingConditions);
              
              // Close the river display modal
              setShowRiverDisplay(false);
              setSelectedRiverSegment(null);
            }
          }}
          showModal={showRiverDisplay}
        />
      )}

    </View>

    </>
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
  damMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  damMarkerText: {
    fontSize: 20,
    fontWeight: 'bold',
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
  cardSubtext: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  waterConditionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dataQualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  dataQualityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  ratingContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  factorText: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 2,
  },
  flyItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffd33d',
  },
  flyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  flyItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  flyItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#1a1a1a',
  },
  flyItemInfo: {
    flex: 1,
  },
  flyName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  flyDetails: {
    fontSize: 13,
    color: '#ffd33d',
    marginBottom: 2,
  },
  confidenceBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  flyReason: {
    fontSize: 13,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 18,
  },
  flyDescription: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 8,
    lineHeight: 16,
  },
  matchingFactors: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  matchingFactorsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 6,
  },
  matchingFactor: {
    fontSize: 11,
    color: '#4CAF50',
    marginBottom: 3,
    marginLeft: 4,
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
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#25292e',
    padding: 0,
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearSearchText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#25292e',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchResultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  searchResultsList: {
    maxHeight: 300,
  },
  searchResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#25292e',
    marginBottom: 4,
  },
  searchResultSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  viewDetailsButtonContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  fishingMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  fishingMarkerText: {
    fontSize: 16,
  },
  mapControls: {
    position: 'absolute',
    top: 80,
    right: 10,
    zIndex: 998,
    flexDirection: 'column',
    gap: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 10,
  },
  controlButtonText: {
    fontSize: 24,
  },
  stylePicker: {
    position: 'absolute',
    top: 80,
    right: 70,
    zIndex: 999,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 250,
  },
  styleOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  styleOptionActive: {
    backgroundColor: '#ffd33d',
  },
  styleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#25292e',
  },
  legend: {
    position: 'absolute',
    bottom: 100,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 140,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#25292e',
    marginBottom: 8,
    textAlign: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  legendMarkerText: {
    fontSize: 12,
  },
  legendText: {
    fontSize: 12,
    color: '#25292e',
    fontWeight: '500',
  },
  legendToggle: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffd33d',
    borderRadius: 8,
    alignItems: 'center',
  },
  legendToggleText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#25292e',
  },
  riverMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  riverMarkerText: {
    fontSize: 18,
  },
  flySuggestionsButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  flySuggestionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
