/**
 * Example React Native Component
 * 
 * Demonstrates how to use the backend API from a React Native/Expo component
 * This example shows fetching weather data with proper error handling and loading states
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { API_ENDPOINTS, apiRequest } from '../lib/apiConfig';

interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  weather_condition: string;
  weather_description: string;
  cloudiness: number;
  visibility: string | null;
  uv_index?: number;
  sunrise?: string;
  sunset?: string;
}

export default function WeatherExample() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example coordinates (Provo River, Utah)
  const latitude = 40.2889;
  const longitude = -111.6733;

  /**
   * Fetch weather data from backend API
   */
  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call backend API - API key is safely stored on backend
      const data = await apiRequest<WeatherData>(
        API_ENDPOINTS.weather.current(latitude, longitude)
      );

      setWeather(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch weather data';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather on component mount
  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weather Example</Text>
        <Text style={styles.subtitle}>
          This component demonstrates secure API calls via backend
        </Text>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Fetching weather data...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchWeather}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success State */}
      {weather && !loading && (
        <View style={styles.weatherContainer}>
          <Text style={styles.sectionTitle}>Current Weather</Text>
          
          <View style={styles.weatherCard}>
            <Text style={styles.temperature}>
              {weather.temperature}°F
            </Text>
            <Text style={styles.condition}>
              {weather.weather_description}
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Feels Like:</Text>
              <Text style={styles.detailValue}>{weather.feels_like}°F</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Humidity:</Text>
              <Text style={styles.detailValue}>{weather.humidity}%</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Wind Speed:</Text>
              <Text style={styles.detailValue}>{weather.wind_speed.toFixed(1)} mph</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pressure:</Text>
              <Text style={styles.detailValue}>{weather.pressure} hPa</Text>
            </View>

            {weather.visibility && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Visibility:</Text>
                <Text style={styles.detailValue}>{weather.visibility} miles</Text>
              </View>
            )}

            {weather.uv_index !== undefined && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>UV Index:</Text>
                <Text style={styles.detailValue}>{weather.uv_index}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={fetchWeather}
          >
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>🔒 Security Note</Text>
        <Text style={styles.infoText}>
          The API key for OpenWeatherMap is stored securely on the backend server.
          This component only calls your backend API endpoint, never directly accessing
          external APIs with sensitive keys.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffebee',
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  weatherContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  weatherCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  temperature: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  condition: {
    fontSize: 18,
    color: '#666',
    textTransform: 'capitalize',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
});

