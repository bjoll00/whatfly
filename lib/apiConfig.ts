/**
 * API Configuration
 * 
 * Centralized configuration for backend API endpoints
 * Automatically detects the correct URL for web/simulator vs physical devices
 */

import { Platform } from 'react-native';

/**
 * Get the appropriate backend URL based on platform
 * - Web/Simulator: Uses localhost
 * - Physical device: Uses network IP from env, or tries localhost first
 */
function getApiBaseUrl(): string {
  // Production URL takes precedence
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // For web platform, always use localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:3001';
  }

  // For native platforms (iOS/Android), try network IP from env first
  // If not set, will fallback to localhost (works for simulator)
  // For physical devices, set EXPO_PUBLIC_API_BASE_URL in .env with your network IP
  return 'http://localhost:3001';
}

// Backend API base URL
// Automatically uses localhost for web/simulator, network IP for physical devices
export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  // Health check
  health: `${API_BASE_URL}/health`,
  
  // Weather endpoints
  weather: {
    current: (lat: number, lon: number) => 
      `${API_BASE_URL}/api/weather/current?lat=${lat}&lon=${lon}`,
    forecast: (lat: number, lon: number, days: number = 5) =>
      `${API_BASE_URL}/api/weather/forecast?lat=${lat}&lon=${lon}&days=${days}`,
  },
  
  // Water conditions endpoints
  waterConditions: {
    current: (lat: number, lon: number) =>
      `${API_BASE_URL}/api/water-conditions/current?lat=${lat}&lon=${lon}`,
  },
};

/**
 * Helper function to handle API errors
 */
export async function handleApiError(response: Response): Promise<never> {
  const errorData = await response.json().catch(() => ({
    error: 'Unknown error',
    message: response.statusText,
  }));
  
  throw new Error(errorData.message || errorData.error || 'API request failed');
}

/**
 * Helper function to make API requests with error handling
 * Automatically tries network IP if localhost fails (for physical devices)
 */
export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const tryRequest = async (requestUrl: string): Promise<T> => {
    const response = await fetch(requestUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return await response.json();
  };

  try {
    return await tryRequest(url);
  } catch (error) {
    // For physical devices, if localhost fails, try network IP from env
    if (
      error instanceof TypeError && 
      error.message.includes('fetch') &&
      Platform.OS !== 'web' &&
      url.includes('localhost') &&
      process.env.EXPO_PUBLIC_API_BASE_URL &&
      process.env.EXPO_PUBLIC_API_BASE_URL.includes('192.168.')
    ) {
      console.log('🔄 localhost failed, trying network IP...');
      const networkUrl = url.replace('localhost', process.env.EXPO_PUBLIC_API_BASE_URL.replace('http://', '').split(':')[0]);
      try {
        return await tryRequest(networkUrl);
      } catch (networkError) {
        console.error('🌐 Both localhost and network IP failed');
        throw networkError;
      }
    }

    // Handle network errors (connection refused, timeout, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const connectionError = new Error(
        `Cannot connect to backend server at ${url}. Make sure the backend is running on ${API_BASE_URL}`
      );
      console.error('🌐 Connection error:', connectionError.message);
      throw connectionError;
    }
    
    console.error('API request error:', error);
    throw error;
  }
}

