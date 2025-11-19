# Mapbox Integration with React Native + Expo - Complete Guide

## Current Setup Status ✅

Your app already has:
- ✅ `@rnmapbox/maps` v10.1.45 installed
- ✅ `mapbox-gl` v2.15.0 for web support
- ✅ Map components implemented (`FishingMap.tsx`, `LocationPicker.tsx`)
- ✅ Mapbox config file (`lib/mapboxConfig.ts`)
- ✅ Conditional loading for web vs native platforms
- ✅ Location permissions configured in `app.json`

## What's Missing ⚠️

Your `app.json` needs the Mapbox plugin configuration for native builds.

---

## Complete Setup Guide

### 1. Update app.json Configuration

Add the Mapbox plugin to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      "expo-web-browser",
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsDownloadToken": "YOUR_MAPBOX_SECRET_TOKEN"
        }
      ]
    ]
  }
}
```

**Important:** You need a **secret token** (starts with `sk.`) from Mapbox:
1. Go to https://account.mapbox.com/
2. Navigate to Tokens section
3. Create or use existing **Secret token** (not the public token)
4. This token is used to download Mapbox SDKs during build

### 2. Environment Variables

Create `.env` file in project root:
```env
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_public_token_here
```

**Token Types:**
- **Public Token** (pk.*): Used in app code → `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
- **Secret Token** (sk.*): Used in `app.json` plugin → `RNMapboxMapsDownloadToken`

### 3. Platform-Specific Setup

#### iOS Setup

**1. Run prebuild (if not done):**
```bash
npx expo prebuild
```

**2. Install CocoaPods:**
```bash
cd ios
pod install
cd ..
```

**3. Configure .netrc file (for SDK downloads):**
Create `~/.netrc` file in your home directory:
```
machine api.mapbox.com
login mapbox
password YOUR_SECRET_TOKEN
```

**Note:** Replace `YOUR_SECRET_TOKEN` with your actual secret token.

**4. iOS Permissions** (Already in your app.json ✅):
```json
"NSLocationWhenInUseUsageDescription": "This app uses your location to show nearby fishing spots..."
```

#### Android Setup

**1. Run prebuild (if not done):**
```bash
npx expo prebuild
```

**2. Add to `android/build.gradle`:**
```gradle
allprojects {
    repositories {
        // ... existing repositories
        maven {
            url 'https://api.mapbox.com/downloads/v2/releases/maven'
            authentication {
                basic(BasicAuthentication)
            }
            credentials {
                username = 'mapbox'
                password = project.hasProperty('MAPBOX_DOWNLOADS_TOKEN') 
                    ? project.property('MAPBOX_DOWNLOADS_TOKEN') 
                    : System.getenv('MAPBOX_DOWNLOADS_TOKEN')
            }
        }
    }
}
```

**3. Add to `android/gradle.properties`:**
```properties
MAPBOX_DOWNLOADS_TOKEN=your_secret_token_here
```

**4. Android Permissions** (Already in your app.json ✅):
```json
"android.permission.ACCESS_FINE_LOCATION"
"android.permission.INTERNET"
```

### 4. Your Current Implementation

Your code already uses the correct pattern:

**lib/mapboxConfig.ts:**
```typescript
export const MAPBOX_CONFIG = {
  ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1I...'
}
```

**components/FishingMap.tsx:**
```typescript
let Mapbox: any = null;
try {
  if (Platform.OS !== 'web') {
    Mapbox = require('@rnmapbox/maps');
    Mapbox.setAccessToken(MAPBOX_CONFIG.ACCESS_TOKEN);
  }
} catch (error) {
  console.error('Failed to load Mapbox:', error);
  Mapbox = null;
}
```

This is the **correct approach** for Expo + React Native! ✅

---

## Building & Running

### Development

**1. Create development build:**
```bash
npx expo prebuild
```

**2. Run on iOS:**
```bash
npx expo run:ios
```

**3. Run on Android:**
```bash
npx expo run:android
```

### Production Build (EAS)

**1. Update `eas.json` (if using EAS Build):**
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN": "your_public_token",
        "MAPBOX_DOWNLOADS_TOKEN": "your_secret_token"
      }
    }
  }
}
```

**2. Build:**
```bash
eas build --platform ios
eas build --platform android
```

---

## Common Mapbox Components Usage

### Basic Map
```typescript
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_CONFIG } from '../lib/mapboxConfig';

Mapbox.setAccessToken(MAPBOX_CONFIG.ACCESS_TOKEN);

<Mapbox.MapView
  style={styles.map}
  styleURL={MAPBOX_CONFIG.DEFAULT_STYLE}
>
  <Mapbox.Camera
    centerCoordinate={[-111.6, 40.3]} // [longitude, latitude]
    zoomLevel={9}
  />
</Mapbox.MapView>
```

### Markers (PointAnnotation)
```typescript
<Mapbox.PointAnnotation
  id="location-1"
  coordinate={[longitude, latitude]}
  onSelected={() => handlePress()}
>
  <View style={styles.marker}>
    <Text>📍</Text>
  </View>
</Mapbox.PointAnnotation>
```

### Shapes & Layers (River Paths)
```typescript
<Mapbox.ShapeSource
  id="river-path"
  shape={{
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [[lon1, lat1], [lon2, lat2]]
    }
  }}
>
  <Mapbox.LineLayer
    id="river-line"
    style={{
      lineColor: '#4A90E2',
      lineWidth: 3,
    }}
  />
</Mapbox.ShapeSource>
```

### Weather Tiles (Raster Layer)
```typescript
<Mapbox.RasterSource
  id="weather-source"
  url="https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=KEY"
  tileSize={256}
>
  <Mapbox.RasterLayer
    id="weather-layer"
    sourceID="weather-source"
    style={{ rasterOpacity: 0.6 }}
  />
</Mapbox.RasterSource>
```

---

## Troubleshooting

### Issue: "Mapbox not loading"

**Solutions:**
- ✅ Verify access token is set: `Mapbox.setAccessToken(MAPBOX_CONFIG.ACCESS_TOKEN)`
- ✅ Check token is public token (pk.*) not secret token
- ✅ Verify token has proper scopes in Mapbox dashboard
- ✅ Check network connectivity

### Issue: "SDK download failed" during build

**Solutions:**
- ✅ Configure `.netrc` file (iOS) with secret token
- ✅ Add `MAPBOX_DOWNLOADS_TOKEN` to `android/gradle.properties` (Android)
- ✅ Verify secret token (sk.*) is correct
- ✅ Check token has download permissions

### Issue: Map not showing

**Solutions:**
- ✅ Check access token is valid (regenerate if needed)
- ✅ Verify token restrictions aren't blocking usage
- ✅ Check console for error messages
- ✅ Verify Mapbox component is inside MapView

### Issue: Build errors

**iOS:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Android:**
```bash
cd android
./gradlew clean
cd ..
```

---

## Best Practices

### 1. Token Security ✅
- ✅ Use environment variables (`.env` file)
- ✅ Never commit tokens to git
- ✅ Use `.gitignore` for `.env`
- ✅ Different tokens for dev/prod

### 2. Performance ✅
- ✅ Your conditional loading pattern is correct
- ✅ Use `useMemo` for GeoJSON data
- ✅ Debounce map events
- ✅ Lazy load map components

### 3. Error Handling ✅
Your current pattern is good:
```typescript
try {
  if (Platform.OS !== 'web') {
    Mapbox = require('@rnmapbox/maps');
  }
} catch (error) {
  console.error('Failed to load Mapbox:', error);
  Mapbox = null;
}

// Then check before using:
{Mapbox && <Mapbox.MapView>...</Mapbox.MapView>}
```

### 4. Map Styles ✅
- ✅ Use `outdoors-v12` for fishing (shows water bodies)
- ✅ Consider custom styles for better visibility
- ✅ Test different styles for your use case

---

## Official Documentation Links

- **@rnmapbox/maps GitHub:** https://github.com/rnmapbox/maps
- **Installation Guide:** https://rnmapbox.github.io/docs/install
- **API Reference:** https://rnmapbox.github.io/docs/api
- **Examples:** https://github.com/rnmapbox/maps/tree/main/example
- **Mapbox Account:** https://account.mapbox.com/

---

## Quick Checklist

- [ ] Add `@rnmapbox/maps` plugin to `app.json`
- [ ] Get secret token from Mapbox account
- [ ] Create `.env` file with public token
- [ ] Run `npx expo prebuild`
- [ ] Configure `.netrc` (iOS) or `gradle.properties` (Android)
- [ ] Run `pod install` (iOS) or `./gradlew clean` (Android)
- [ ] Test on device

---

## Next Steps

1. **Update app.json** - Add Mapbox plugin configuration
2. **Get tokens** - Get both public and secret tokens from Mapbox
3. **Run prebuild** - Generate native directories
4. **Configure platforms** - Set up iOS/Android as shown above
5. **Test** - Build and run on devices

Your implementation is already solid! Just need to complete the native configuration.
