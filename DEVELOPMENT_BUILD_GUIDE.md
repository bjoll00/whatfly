# Development Build Guide for Mapbox Integration

## Why Development Build?

The `@rnmapbox/maps` package requires native modules that are not available in Expo Go. To use the full interactive map functionality, you need to create a development build.

## Quick Setup

### Option 1: EAS Build (Recommended)

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to your Expo account**:
   ```bash
   eas login
   ```

3. **Configure EAS Build**:
   ```bash
   eas build:configure
   ```

4. **Create development build**:
   ```bash
   # For iOS (requires Apple Developer account)
   eas build --profile development --platform ios
   
   # For Android
   eas build --profile development --platform android
   ```

5. **Install the build on your device**:
   - iOS: Install via TestFlight or direct installation
   - Android: Download and install the APK

### Option 2: Local Development Build

1. **Install Expo Dev Client**:
   ```bash
   npx expo install expo-dev-client
   ```

2. **Create local build**:
   ```bash
   # For iOS (requires Xcode)
   npx expo run:ios
   
   # For Android (requires Android Studio)
   npx expo run:android
   ```

## Current Workaround (Expo Go)

While waiting for a development build, the app provides a **location selector interface** that works in Expo Go:

### Features Available in Expo Go:
- ✅ **Location Selection**: Tap on predefined fishing locations
- ✅ **Weather Data**: Mock weather information
- ✅ **Water Conditions**: Mock USGS water data
- ✅ **Fly Recommendations**: Full integration with your fly suggestion service
- ✅ **Results Modal**: Complete location details and fly suggestions

### How to Use:
1. Open the **Map** tab
2. Tap on any of the fishing location buttons:
   - 🏞️ Provo River - Main Stem
   - 🌊 Provo River - Lower Section  
   - 🏔️ Deer Creek Reservoir
3. View the results modal with fly recommendations

## What You'll Get with Development Build

### Full Interactive Map Features:
- 🗺️ **Interactive Map**: Pan, zoom, and navigate
- 📍 **Tap Anywhere**: Select any location on the map
- 🎯 **Real-time Markers**: Visual feedback for selected locations
- 🧭 **GPS Integration**: Use device location
- 📱 **Native Performance**: Optimized rendering

## EAS Build Configuration

Your `eas.json` should include:

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  }
}
```

## Testing the Map Feature

### In Expo Go (Current):
1. Navigate to **Map** tab
2. Tap location buttons to test functionality
3. Verify fly recommendations work
4. Check results modal displays correctly

### In Development Build:
1. Install development build on device
2. Navigate to **Map** tab  
3. See full interactive map
4. Tap anywhere on map to select location
5. Verify all features work as expected

## Troubleshooting

### Common Issues:
1. **Map not loading**: Check Mapbox token configuration
2. **Build fails**: Ensure all dependencies are properly installed
3. **Permissions**: Grant location permissions when prompted

### Debug Steps:
1. Check console logs for Mapbox loading status
2. Verify token is correctly configured
3. Test with different devices/platforms

## Production Deployment

For production apps:
1. Use EAS Build with production profile
2. Submit to app stores
3. Users will have full map functionality
4. No Expo Go limitations

## Summary

- **Current State**: Location selector works in Expo Go
- **Full Features**: Require development build
- **Next Step**: Create development build for full map experience
- **Fallback**: Use location buttons for testing functionality

The map integration is fully functional - it just needs a development build to unlock the interactive map UI! 🎣
