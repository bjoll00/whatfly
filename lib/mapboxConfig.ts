// Mapbox configuration
// You'll need to get these tokens from https://account.mapbox.com/

export const MAPBOX_CONFIG = {
  // Public access token for client-side map rendering
  ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoid2hhdGZseSIsImEiOiJjbWdjdndvcmcwOGR6MmpwczAwdzFzbzBnIn0.UnxcMVxCP3aMw7njywx7lA',
  
  // Download token for offline maps (optional)
  DOWNLOAD_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_DOWNLOAD_TOKEN || 'pk.eyJ1Ijoid2hhdGZseSIsImEiOiJjbWdjdndvcmcwOGR6MmpwczAwdzFzbzBnIn0.UnxcMVxCP3aMw7njywx7lA',
  
  // Default map style
  DEFAULT_STYLE: 'mapbox://styles/mapbox/streets-v12',
  
  // Default camera settings
  DEFAULT_CAMERA: {
    centerCoordinate: [-111.6, 40.3] as [number, number], // Provo River
    zoomLevel: 12,
    animationDuration: 1000,
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
