// Mapbox configuration
// You'll need to get these tokens from https://account.mapbox.com/

export const MAPBOX_CONFIG = {
  // Public access token for client-side map rendering
  ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoid2hhdGZseSIsImEiOiJjbWdjdndvcmcwOGR6MmpwczAwdzFzbzBnIn0.UnxcMVxCP3aMw7njywx7lA',
  
  // Download token for offline maps (optional)
  DOWNLOAD_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_DOWNLOAD_TOKEN || 'pk.eyJ1Ijoid2hhdGZseSIsImEiOiJjbWdjdndvcmcwOGR6MmpwczAwdzFzbzBnIn0.UnxcMVxCP3aMw7njywx7lA',
  
  // Map styles optimized for fishing
  STYLES: {
    // Outdoors: Best for highlighting water bodies, trails, and terrain
    OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',
    
    // Satellite: Real satellite imagery for visual context
    SATELLITE: 'mapbox://styles/mapbox/satellite-v9',
    
    // Satellite Streets: Hybrid with labels
    SATELLITE_STREETS: 'mapbox://styles/mapbox/satellite-streets-v12',
    
    // Streets: Standard road map (less ideal for fishing)
    STREETS: 'mapbox://styles/mapbox/streets-v12',
    
    // Light: Minimalist style (good for custom overlays)
    LIGHT: 'mapbox://styles/mapbox/light-v11',
  },
  
  // Default map style - Outdoors is best for fishing as it emphasizes water bodies
  DEFAULT_STYLE: 'mapbox://styles/mapbox/outdoors-v12',
  
  // Default camera settings
  DEFAULT_CAMERA: {
    centerCoordinate: [-111.6, 40.3] as [number, number], // Provo River
    zoomLevel: 9, // Zoom out a bit to show more water bodies
    animationDuration: 1000,
  },
  
  // Custom colors for water bodies and fishing features
  COLORS: {
    // Water bodies
    RIVER: '#4A90E2',
    LAKE: '#5CA9E6',
    RESERVOIR: '#7EC8E3',
    STREAM: '#3B7FB8',
    
    // Fishing location markers
    MARKER_RIVER: '#2E7BC4',
    MARKER_LAKE: '#4CAF50',
    MARKER_RESERVOIR: '#8BC34A',
    MARKER_SELECTED: '#FFD700',
    
    // Water quality indicators
    EXCELLENT: '#4CAF50',
    GOOD: '#8BC34A',
    FAIR: '#FF9800',
    POOR: '#F44336',
  },
  
  // Zoom levels for different features
  ZOOM_LEVELS: {
    OVERVIEW: 8,    // See all of Utah
    REGIONAL: 10,   // See major rivers and reservoirs
    LOCAL: 12,      // See specific fishing spots
    DETAILED: 14,   // See stream details
  },
};

// Instructions for setting up Mapbox tokens:
// 1. Go to https://account.mapbox.com/
// 2. Create an account or sign in
// 3. Go to your account page and copy your default public token
// 4. Create a .env file in your project root with:
//    EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_access_token_here
//    EXPO_PUBLIC_MAPBOX_DOWNLOAD_TOKEN=your_download_token_here
// 5. Or replace the tokens directly in this file for testing
