# Map Feature Implementation

This document describes the location-based map service implementation for the WhatFly fishing app.

## Overview

The map feature allows users to:
- View an interactive map centered on the Provo River
- Tap on locations to select fishing spots
- Automatically fetch weather and water conditions
- Get fly recommendations based on location data
- View detailed information in a modal

## Files Created/Modified

### New Files
- `components/FishingMap.tsx` - Main map component
- `lib/locationService.ts` - Location services and API placeholders
- `lib/mapIntegration.ts` - Integration with existing fly suggestion service
- `lib/mapboxConfig.ts` - Mapbox configuration
- `app/(tabs)/map.tsx` - Map tab screen
- `MAPBOX_SETUP_GUIDE.md` - Setup instructions
- `MAP_FEATURE_README.md` - This documentation

### Modified Files
- `package.json` - Added @rnmapbox/maps dependency
- `app.json` - Added Mapbox plugin configuration
- `app/(tabs)/_layout.tsx` - Added map tab to navigation

## Architecture

### Component Structure
```
FishingMap
├── Mapbox.MapView
│   ├── Mapbox.Camera (default position: Provo River)
│   ├── Mapbox.ShapeSource (handles map taps)
│   └── Mapbox.PointAnnotation (selected location marker)
├── Loading Overlay (during API calls)
├── Instructions Panel
└── Results Modal (location details & fly recommendations)
```

### Data Flow
1. User taps on map
2. `handleMapPress` extracts coordinates
3. Parallel API calls:
   - `findNearestRiver()` - Find closest fishing location
   - `fetchWeather()` - Get weather data
   - `fetchUSGS()` - Get water conditions
4. `getRecommendedFlies()` - Get fly suggestions
5. Display results in modal

### Integration with Existing Services
The map feature integrates with the existing fly suggestion service through:
- `MapIntegrationService` - Converts map data to `FishingConditions`
- `flySuggestionService` - Uses existing recommendation engine
- Fallback to mock data if integration fails

## Key Features

### 1. Interactive Map
- **Library**: `@rnmapbox/maps`
- **Default Center**: Provo River (40.3°N, 111.6°W)
- **Style**: Street map
- **Zoom Level**: 12 (good for regional view)

### 2. Location Selection
- Tap anywhere on map to select location
- Automatic marker placement
- Coordinate display in results

### 3. Automatic Data Fetching
- **Weather**: OpenWeather API integration (placeholder)
- **Water Conditions**: USGS API integration (placeholder)
- **Fishing Locations**: Database query (placeholder)

### 4. Fly Recommendations
- Integrates with existing `flySuggestionService`
- Converts map data to `FishingConditions` format
- Displays recommendations with confidence scores

### 5. Results Modal
- Location details
- Weather information
- Water conditions
- Recommended flies with reasoning

## Configuration

### Mapbox Setup
1. Get access token from [Mapbox](https://account.mapbox.com/)
2. Add to environment variables or config file
3. Update `app.json` with download token

### Environment Variables
```bash
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
EXPO_PUBLIC_MAPBOX_DOWNLOAD_TOKEN=your_token_here
```

## API Integration Points

### Current Placeholders
All location services currently return mock data:

```typescript
// Mock fishing locations near Provo River
const mockLocations: RiverLocation[] = [
  {
    id: 'provo-river-main',
    name: 'Provo River - Main Stem',
    coordinates: { latitude: 40.3, longitude: -111.6 },
    type: 'river',
    description: 'Popular trout fishing destination in Utah'
  },
  // ... more locations
];
```

### Production Integration
Replace placeholder functions with real API calls:

1. **Weather API** (OpenWeatherMap)
   ```typescript
   async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
     const response = await fetch(
       `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
     );
     return response.json();
   }
   ```

2. **USGS Water Data**
   ```typescript
   async function fetchUSGS(riverId: string): Promise<USGSWaterData | null> {
     const response = await fetch(
       `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${stationId}&parameterCd=00060,00010`
     );
     return response.json();
   }
   ```

3. **Fishing Locations Database**
   ```typescript
   async function findNearestRiver(lat: number, lon: number): Promise<RiverLocation | null> {
     // Query Supabase/PostgreSQL with PostGIS for spatial queries
     const { data } = await supabase
       .from('fishing_locations')
       .select('*')
       .rpc('find_nearest_location', { lat, lon, radius: 50000 });
     return data?.[0] || null;
   }
   ```

## Testing

### Manual Testing
1. Start the app: `npm start`
2. Navigate to "Map" tab
3. Verify map loads and centers on Provo River
4. Tap on map to test location selection
5. Check that modal opens with mock data
6. Verify fly recommendations appear

### Test Cases
- [ ] Map loads without errors
- [ ] Default camera position is correct
- [ ] Tap interaction works
- [ ] Marker appears on tap
- [ ] Modal opens with data
- [ ] Fly recommendations display
- [ ] Error handling works (network issues)
- [ ] Clear selection resets state

## Performance Considerations

### Optimization Strategies
1. **Debounced API calls** - Prevent rapid successive requests
2. **Caching** - Store recent API responses
3. **Offline support** - Use Mapbox offline maps
4. **Lazy loading** - Load map components on demand

### Memory Management
- Clean up map references on unmount
- Limit marker history
- Optimize image loading for fly recommendations

## Security

### Token Management
- Store Mapbox tokens in environment variables
- Use token scoping for production
- Monitor API usage and costs

### Data Privacy
- User location data is not stored
- API calls are made client-side
- Consider GDPR compliance for EU users

## Future Enhancements

### Phase 2 Features
1. **Offline Maps** - Download map tiles for offline use
2. **Custom Markers** - Different icons for different location types
3. **Route Planning** - Navigation to fishing spots
4. **Favorites** - Save favorite fishing locations
5. **Photo Integration** - Attach photos to locations

### Advanced Features
1. **Heat Maps** - Show fishing success rates by location
2. **Weather Layers** - Overlay weather radar on map
3. **Water Level Visualization** - Show water conditions visually
4. **Community Features** - Share locations with other users

## Troubleshooting

### Common Issues
1. **Map not loading**: Check Mapbox token configuration
2. **No location data**: Verify API placeholders are working
3. **Performance issues**: Check for memory leaks in map component
4. **Build errors**: Ensure Mapbox plugin is properly configured

### Debug Tools
- Console logging in all service functions
- React Native debugger for component state
- Mapbox debug mode for map issues
- Network tab for API call debugging

## Dependencies

### Required Packages
- `@rnmapbox/maps` - Mapbox integration
- `react-native` - Core React Native
- `expo` - Expo framework

### Optional Packages (for production)
- `@react-native-async-storage/async-storage` - Local caching
- `react-native-geolocation-service` - Enhanced location services
- `react-native-permissions` - Location permissions

## Conclusion

The map feature provides a solid foundation for location-based fishing recommendations. The modular architecture allows for easy integration with real APIs and future enhancements. The integration with the existing fly suggestion service ensures consistency with the app's core functionality.

For production deployment, replace the placeholder functions with real API implementations and add proper error handling, caching, and offline support.
