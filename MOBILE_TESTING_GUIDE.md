# Mobile Testing Guide for WhatFly App

## Testing the Map Feature on Mobile Devices

### Current Situation
The map feature uses native modules (`@rnmapbox/maps`) that require a development build. Expo Go cannot run native modules, so you'll see a placeholder with demo location buttons instead of the interactive map.

### Option 1: Test Demo Locations in Expo Go (Recommended for Quick Testing)

1. **Install Expo Go** on your mobile device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start your development server:**
   ```bash
   npm start
   ```

3. **Scan the QR code** with:
   - **iOS**: Camera app or Expo Go app
   - **Android**: Expo Go app

4. **Test the map feature:**
   - Navigate to the "Map" tab
   - You'll see demo location buttons instead of an interactive map
   - Tap any location button to test the fly recommendation flow
   - This shows you how the app logic works with real weather/water data

### Option 2: Build Development Version (Full Interactive Map)

To see the actual interactive Mapbox map, you need to build a development version:

#### Prerequisites
1. **Install EAS CLI:**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

#### Build for iOS (Requires Apple Developer Account)
```bash
eas build --platform ios --profile development
```

#### Build for Android (Free)
```bash
eas build --platform android --profile development
```

#### Install on Device
1. After build completes, you'll get a download link
2. **iOS**: Install via TestFlight or direct download
3. **Android**: Download and install the APK directly

### Option 3: Test on Physical Device with USB (Advanced)

If you have Android Studio/Xcode set up:

1. **Enable Developer Options** on your Android device
2. **Connect via USB** and enable USB debugging
3. **Run directly:**
   ```bash
   npx expo run:android
   # or
   npx expo run:ios
   ```

### What You'll See

#### In Expo Go (Current):
- ✅ Demo location buttons
- ✅ Working fly recommendation logic
- ✅ Real weather/water data integration
- ❌ Interactive map (shows placeholder)

#### In Development Build:
- ✅ Full interactive Mapbox map
- ✅ Tap to select locations
- ✅ Real-time marker placement
- ✅ All demo features plus full map functionality

### Testing Checklist

#### Map Functionality:
- [ ] Map loads and displays correctly
- [ ] Default camera centers on Provo River (40.3°N, 111.6°W)
- [ ] Tap locations place markers
- [ ] Fly recommendations appear after tapping
- [ ] Results modal shows recommended flies

#### App Navigation:
- [ ] All tabs work correctly
- [ ] Sign in/out functionality
- [ ] WhatFly recommendations work
- [ ] Catch log functionality
- [ ] Feedback form works

### Troubleshooting

#### Map Not Loading:
1. Check console logs for Mapbox errors
2. Verify Mapbox token is valid
3. Ensure internet connection
4. Try refreshing the app

#### Build Issues:
1. Check EAS CLI is updated: `eas update`
2. Verify Expo account has build credits
3. Check build logs for specific errors

#### Performance Issues:
1. Close other apps on device
2. Ensure good internet connection
3. Try restarting the development server

### Next Steps

1. **Quick Test**: Use Expo Go with demo buttons
2. **Full Experience**: Build development version with EAS
3. **Production**: Build release version when ready

### Cost Considerations

- **Expo Go**: Free
- **Development Builds**: Free (with Expo account)
- **Release Builds**: May require paid plan for frequent builds

The demo buttons in Expo Go will give you a good sense of how the app works, while the development build will show you the full interactive map experience.
