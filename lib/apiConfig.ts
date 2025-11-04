/**
 * API Configuration
 * 
 * Centralized configuration for backend API endpoints
 * In production, this should point to your deployed backend URL
 */

// Backend API base URL
// Development: Local backend server
// Production: Your deployed backend URL (e.g., https://your-backend.vercel.app)
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_BASE_URL || 
  'http://localhost:3001';

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
 */
export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
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
  } catch (error) {
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

