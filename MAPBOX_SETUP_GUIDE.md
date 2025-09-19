# Mapbox Setup Guide for WhatFly App

This guide will help you set up Mapbox integration for the location-based fishing map feature.

## Prerequisites

1. A Mapbox account (free tier available)
2. Expo development environment set up

## Step 1: Create Mapbox Account

1. Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your Access Token

1. Once logged in, go to your [account page](https://account.mapbox.com/account/)
2. Scroll down to "Access tokens" section
3. Copy your **Default public token** (starts with `pk.`)

## Step 3: Configure Your App

### Option A: Using Environment Variables (Recommended)

1. Create a `.env` file in your project root:
```bash
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_access_token_here
EXPO_PUBLIC_MAPBOX_DOWNLOAD_TOKEN=your_access_token_here
```

2. Make sure `.env` is in your `.gitignore` file to keep your token secure.

### Option B: Direct Configuration (For Testing Only)

1. Open `lib/mapboxConfig.ts`
2. Replace `YOUR_MAPBOX_ACCESS_TOKEN` with your actual token:
```typescript
ACCESS_TOKEN: 'pk.your_actual_token_here',
```

## Step 4: Update App Configuration

1. Open `app.json`
2. Replace `YOUR_MAPBOX_DOWNLOAD_TOKEN` with your access token:
```json
"RNMapboxMapsDownloadToken": "pk.your_actual_token_here"
```

## Step 5: Install Dependencies

The required dependencies should already be installed, but if not:

```bash
npm install @rnmapbox/maps
```

## Step 6: Test the Implementation

1. Start your Expo development server:
```bash
npm start
```

2. Navigate to the "Map" tab in your app
3. You should see a map centered on the Provo River
4. Tap anywhere on the map to test the location selection feature

## Features Included

### FishingMap Component
- Interactive map centered on Provo River (40.3°N, 111.6°W)
- Tap to select locations
- Automatic marker placement
- Integration with location services

### Location Services
- `findNearestRiver()` - Finds closest fishing location
- `fetchWeather()` - Gets weather data (placeholder for OpenWeather API)
- `fetchUSGS()` - Gets water conditions (placeholder for USGS API)
- `getRecommendedFlies()` - Returns fly recommendations

### Mock Data
The implementation includes mock data for testing:
- Sample fishing locations near Provo River
- Mock weather data
- Mock water conditions
- Sample fly recommendations

## Production Setup

For production deployment, you'll need to:

1. **Replace placeholder functions** with real API calls:
   - OpenWeather API for weather data
   - USGS Water Services API for water conditions
   - Your Supabase database for fishing locations

2. **Add error handling** for network requests

3. **Implement caching** for API responses

4. **Add offline support** using Mapbox offline maps

## Troubleshooting

### Map Not Loading
- Check that your access token is correct
- Verify the token has the right permissions
- Check the console for error messages

### Build Errors
- Make sure you've added the Mapbox plugin to `app.json`
- Run `npx expo install --fix` to ensure compatibility

### Location Services Not Working
- Check that location permissions are granted
- Verify the placeholder functions are returning data
- Check the console logs for debugging information

## Security Notes

- Never commit your access tokens to version control
- Use environment variables for production
- Consider using token scoping for additional security
- Monitor your token usage in the Mapbox dashboard

## Next Steps

1. Set up your Mapbox account and get your tokens
2. Test the map functionality
3. Replace placeholder functions with real API integrations
4. Customize the map styling and features as needed

For more information, visit the [Mapbox documentation](https://docs.mapbox.com/).
