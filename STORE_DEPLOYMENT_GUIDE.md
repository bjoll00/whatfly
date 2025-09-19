# WhatFly App Store Deployment Guide

This guide will help you deploy your WhatFly fishing app to both the Apple App Store and Google Play Store.

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at [developer.apple.com](https://developer.apple.com)
   - Complete the enrollment process

2. **Google Play Console Account** ($25 one-time fee)
   - Sign up at [play.google.com/console](https://play.google.com/console)
   - Complete the developer registration

3. **EAS CLI** (if not already installed)
   ```bash
   npm install -g @expo/eas-cli
   ```

4. **Login to EAS**
   ```bash
   eas login
   ```

## Pre-Deployment Checklist

### 1. App Assets
- ✅ App icon (1024x1024 for iOS)
- ✅ Adaptive icon for Android
- ✅ Splash screen image
- ⚠️ **TODO**: Create app screenshots for store listings
- ⚠️ **TODO**: Create app preview videos (optional but recommended)

### 2. App Configuration
- ✅ Bundle identifiers set
- ✅ Version numbers configured
- ✅ Store metadata added
- ✅ Permissions configured

### 3. Required Store Assets (Create these)

#### App Screenshots Needed:
- **iPhone**: 6.7", 6.5", 5.5" display sizes
- **iPad**: 12.9" and 11" display sizes
- **Android**: Phone and tablet screenshots

#### App Store Listing Content:
- **App Name**: WhatFly
- **Subtitle**: AI-Powered Fly Fishing Companion
- **Description**: [See app.json for current description]
- **Keywords**: fishing, fly fishing, AI, outdoor, sports, nature, trout, catch log, fishing guide
- **Category**: Sports
- **Age Rating**: 4+ (suitable for all ages)

## Deployment Steps

### Step 1: Build Production Apps

#### For iOS (App Store):
```bash
eas build --platform ios --profile production
```

#### For Android (Google Play):
```bash
eas build --platform android --profile production
```

#### For Both Platforms:
```bash
eas build --platform all --profile production
```

### Step 2: Submit to App Stores

#### iOS App Store:
1. Download the `.ipa` file from EAS build
2. Open Xcode and go to Window > Organizer
3. Drag the `.ipa` file to the Organizer
4. Click "Distribute App" and follow the prompts
5. Upload to App Store Connect
6. Complete the app listing in App Store Connect
7. Submit for review

#### Google Play Store:
1. Download the `.aab` file from EAS build
2. Go to Google Play Console
3. Create a new app or select existing
4. Upload the `.aab` file to the "Production" track
5. Complete the store listing
6. Submit for review

### Step 3: Store Listings

#### App Store Connect (iOS):
1. **App Information**:
   - Name: WhatFly
   - Subtitle: AI-Powered Fly Fishing Companion
   - Category: Sports
   - Content Rights: No

2. **Pricing and Availability**:
   - Price: Free
   - Availability: All countries/regions

3. **App Store**:
   - Description: [Use description from app.json]
   - Keywords: fishing, fly fishing, AI, outdoor, sports, nature, trout, catch log, fishing guide
   - Support URL: [Your support website]
   - Marketing URL: [Your marketing website]

#### Google Play Console (Android):
1. **Main Store Listing**:
   - App name: WhatFly
   - Short description: AI-powered fly fishing companion app
   - Full description: [Use description from app.json]
   - Category: Sports
   - Content rating: Everyone

2. **Store Settings**:
   - App availability: All countries
   - Pricing: Free

## Post-Deployment

### Monitoring
- Monitor app performance in both stores
- Respond to user reviews
- Track download statistics
- Monitor crash reports

### Updates
- Use `eas build` for new versions
- Update version numbers in app.json
- Submit updates through respective store consoles

## Troubleshooting

### Common Issues:
1. **Build failures**: Check EAS build logs
2. **Store rejection**: Address feedback from store review teams
3. **Icon issues**: Ensure icons meet store requirements
4. **Permission issues**: Update permission descriptions

### Support Resources:
- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)

## Next Steps

1. Create app screenshots for store listings
2. Set up app store developer accounts
3. Run production builds
4. Complete store listings
5. Submit for review

Good luck with your app launch! 🎣
