/**
 * DEBUG LOGGING UTILITY
 * Provides structured, clean logging for debugging data flow
 */

interface DebugConfig {
  enabled: boolean;
  showTimestamps: boolean;
  showSessionId: boolean;
}

class DebugLogger {
  private config: DebugConfig = {
    enabled: true,
    showTimestamps: true,
    showSessionId: true
  };
  
  private sessionId: string = this.generateSessionId();

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Main debug logging function
   * @param tag - Category/component name
   * @param data - Data to log
   * @param level - Log level (info, warn, error)
   */
  log(tag: string, data: any, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (!this.config.enabled) return;

    const timestamp = this.config.showTimestamps ? 
      new Date().toLocaleTimeString() : '';
    const session = this.config.showSessionId ? 
      `[${this.sessionId}]` : '';

    const prefix = `${session}${timestamp ? ` ${timestamp}` : ''} [${tag}]`;

    switch (level) {
      case 'warn':
        console.warn(prefix, data);
        break;
      case 'error':
        console.error(prefix, data);
        break;
      default:
        console.log(prefix, data);
    }
  }

  /**
   * Log location selection with simplified format
   */
  logLocationSelection(data: {
    coordinates: { latitude: number; longitude: number };
    location?: string;
    weatherData?: any;
    waterData?: any;
    fishingConditions?: any;
    missingFields?: string[];
    fallbackUsed?: boolean;
    errors?: string[];
  }): void {
    if (!this.config.enabled) return;

    console.log('\n=== LOCATION SELECTED ===');
    console.log(`Time: ${new Date().toLocaleTimeString()}`);
    console.log(`Location: ${data.location || 'Unknown'} (${data.coordinates.latitude.toFixed(4)}, ${data.coordinates.longitude.toFixed(4)})`);
    
    // Simple status indicators
    const weatherStatus = data.weatherData ? '✅' : '❌';
    const usgsStatus = data.waterData ? '✅' : '❌';
    const fallbackIndicator = data.fallbackUsed ? ' (fallback used)' : '';
    
    console.log(`Weather data: ${weatherStatus}${fallbackIndicator}`);
    console.log(`USGS data: ${usgsStatus}${fallbackIndicator}`);
    
    // Show key data points if available
    if (data.weatherData) {
      console.log(`  → ${data.weatherData.temperature}°F, ${data.weatherData.weather_condition}`);
    }
    if (data.waterData) {
      console.log(`  → ${data.waterData.flowRate || 'N/A'} cfs, ${data.waterData.waterTemperature || 'N/A'}°F water`);
    }
    
    // Show missing fields
    if (data.missingFields && data.missingFields.length > 0) {
      console.log(`Missing: ${data.missingFields.join(', ')}`);
    }
    
    console.log('==========================\n');
  }

  /**
   * Log fly suggestion results
   */
  logFlySuggestions(data: {
    location: string;
    conditions: any;
    suggestionsCount: number;
    topSuggestions: string[];
    algorithmUsed: string;
  }): void {
    if (!this.config.enabled) return;

    console.log('\n=== FLY SUGGESTIONS ===');
    console.log(`Time: ${new Date().toLocaleTimeString()}`);
    console.log(`Location: ${data.location}`);
    console.log(`Algorithm: ${data.algorithmUsed}`);
    console.log(`Suggestions: ${data.suggestionsCount} found`);
    console.log(`Top flies: ${data.topSuggestions.join(', ')}`);
    
    // Show which data was used
    const dataUsed = [];
    if (data.conditions.weather_conditions) dataUsed.push('weather');
    if (data.conditions.water_temperature) dataUsed.push('water temp');
    if (data.conditions.time_of_day) dataUsed.push('time of day');
    if (data.conditions.time_of_year) dataUsed.push('season');
    if (data.conditions.moon_phase) dataUsed.push('lunar');
    
    console.log(`Data used: ${dataUsed.join(', ')}`);
    console.log('=======================\n');
  }

  /**
   * Log data collection process
   */
  logDataCollection(data: {
    step: string;
    success: boolean;
    dataType: string;
    details?: any;
    error?: string;
  }): void {
    if (!this.config.enabled) return;

    const status = data.success ? '✅' : '❌';
    const message = `${status} ${data.step}: ${data.dataType}`;
    
    if (data.success) {
      console.log(message, data.details || '');
    } else {
      console.error(message, data.error || '');
    }
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Configure logging options
   */
  configure(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generate new session ID
   */
  newSession(): void {
    this.sessionId = this.generateSessionId();
    this.log('DEBUG', `New session started: ${this.sessionId}`);
  }
}

// Export singleton instance
export const debugLogger = new DebugLogger();

// Convenience functions
export const debugLog = (tag: string, data: any) => debugLogger.log(tag, data);
export const debugWarn = (tag: string, data: any) => debugLogger.log(tag, data, 'warn');
export const debugError = (tag: string, data: any) => debugLogger.log(tag, data, 'error');
export const logLocation = (data: any) => debugLogger.logLocationSelection(data);
export const logFlySuggestions = (data: any) => debugLogger.logFlySuggestions(data);
export const logDataCollection = (data: any) => debugLogger.logDataCollection(data);

// Export for configuration
export { DebugLogger };
