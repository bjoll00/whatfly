# Weather Data and Weather Tiles Implementation Guide for Mapbox

## Overview

This guide covers multiple approaches to integrate weather data and weather tiles into your Mapbox map in React Native/Expo using `@rnmapbox/maps`.

---

## Approach 1: Weather Annotations (Current Implementation) ✅

**What you're already doing:**
- Fetch weather data from OpenWeatherMap via your backend API
- Display weather information in cards/modals when locations are selected
- Show weather icons and detailed metrics

**Pros:**
- ✅ Simple to implement
- ✅ Works with your existing backend
- ✅ No additional costs

**Cons:**
- ❌ Not visually integrated into the map itself
- ❌ Requires user interaction to see weather

---

## Approach 2: Weather Tiles/Raster Layers

### 2a. Using Pre-Processed Weather Tilesets (Mapbox)

**Source:** [Mapbox Japan Weather Layers](https://docs.mapbox.com/data/tilesets/reference/mapbox-japan-weather-layers/)

**How it works:**
Mapbox provides pre-processed weather tilesets that can be added as raster layers. These include:
- Precipitation (Nowcast)
- Temperature
- Wind
- Forecast data

**Implementation (Example for Web Mapbox GL JS - adapt for React Native):**
```javascript
// Add wind layer example
map.addSource('winds', {
  type: 'raster-array',
  url: 'mapbox://mapbox.weather-jp-wind-0-39',
  tileSize: 512
});

map.addLayer({
  id: 'wind-layer',
  type: 'raster',
  source: 'winds',
  paint: {
    'raster-opacity': 0.6
  }
});
```

**Note:** Japan Weather Layers are region-specific. For other regions, you'd need custom tilesets.

### 2b. Using Mapbox Tiling Service (MTS) for Custom Weather Data

**Source:** [Mapbox Tiling Service Guides](https://docs.mapbox.com/mapbox-tiling-service/guides/)

**How it works:**
1. Process your weather data (from OpenWeatherMap or other sources)
2. Use Mapbox Tiling Service to create custom tilesets
3. Add tilesets as raster layers to your map

**Steps:**
1. **Prepare your weather data** in a format MTS can process (GeoJSON, GeoTIFF, etc.)
2. **Upload to Mapbox Tiling Service** using the API or Studio
3. **Add as a source in your map:**
   ```javascript
   map.addSource('weather-tiles', {
     type: 'raster',
     url: 'mapbox://your-username.your-tileset-id',
     tileSize: 256
   });
   ```
4. **Add a layer:**
   ```javascript
   map.addLayer({
     id: 'weather-overlay',
     type: 'raster',
     source: 'weather-tiles',
     paint: {
       'raster-opacity': 0.7
     }
   });
   ```

**React Native Implementation:**
```typescript
// In FishingMap.tsx
useEffect(() => {
  if (mapRef.current && showWeatherLayer) {
    // Add weather tile source
    mapRef.current.addSource('weather-tiles', {
      type: 'raster',
      url: 'mapbox://your-username.your-tileset-id',
      tileSize: 256
    });

    // Add weather layer
    mapRef.current.addLayer({
      id: 'weather-layer',
      type: 'raster',
      source: 'weather-tiles',
      paint: {
        'raster-opacity': 0.6
      }
    });
  }

  return () => {
    if (mapRef.current?.getLayer('weather-layer')) {
      mapRef.current.removeLayer('weather-layer');
    }
    if (mapRef.current?.getSource('weather-tiles')) {
      mapRef.current.removeSource('weather-tiles');
    }
  };
}, [showWeatherLayer]);
```

---

## Approach 3: Dynamic Weather Markers/Annotations

**What it does:**
Display weather icons as interactive markers at specific locations on the map.

**Source:** [Mapbox iOS Weather Example](https://docs.mapbox.com/ios/maps/examples/swiftui-view-weather/)

**React Native Implementation:**
```typescript
// Add weather markers for multiple locations
const [weatherMarkers, setWeatherMarkers] = useState<any[]>([]);

useEffect(() => {
  // Fetch weather for multiple locations
  const fetchWeatherMarkers = async () => {
    const locations = [
      { id: '1', coords: [latitude1, longitude1] },
      { id: '2', coords: [latitude2, longitude2] },
    ];

    const markers = await Promise.all(
      locations.map(async (loc) => {
        const weather = await weatherService.getWeatherForLocation(
          loc.coords[0],
          loc.coords[1]
        );
        return {
          id: loc.id,
          coordinates: loc.coords,
          weather: weather
        };
      })
    );

    setWeatherMarkers(markers);
  };

  fetchWeatherMarkers();
}, []);

// Render markers
{weatherMarkers.map((marker) => (
  <Mapbox.PointAnnotation
    key={marker.id}
    id={marker.id}
    coordinate={marker.coordinates}
  >
    <View style={styles.weatherMarker}>
      <Text>{getWeatherIcon(marker.weather.weather_condition)}</Text>
      <Text style={styles.tempText}>
        {Math.round(marker.weather.temperature)}°F
      </Text>
    </View>
  </Mapbox.PointAnnotation>
))}
```

---

## Approach 4: Weather Effects (Rain/Snow Particles)

**Source:** [Mapbox Rain and Snow Playground](https://docs.mapbox.com/playground/rain-and-snow/)

**What it does:**
Adds animated rain and snow particle effects based on weather conditions.

**How it works:**
- Highly customizable particle animations
- Can be driven by weather data
- Creates realistic weather effects on the map

**Implementation:**
1. Visit the [Rain and Snow Playground](https://docs.mapbox.com/playground/rain-and-snow/)
2. Configure parameters (intensity, speed, etc.)
3. Generate code snippet
4. Integrate into your React Native app

**Note:** This may require custom rendering or WebGL layers, which might be more complex in React Native.

---

## Approach 5: Third-Party Weather SDKs

### MapTiler Weather SDK

**Source:** [MapTiler Weather SDK](https://www.maptiler.com/weather/)

**Features:**
- Animated forecast layers
- High-quality weather icons
- Compatible with major mapping libraries
- 5-day forecast support

**Integration:**
- Works with Mapbox GL JS
- May require adapter for React Native
- Commercial license required

---

## Recommended Implementation Strategy

### Phase 1: Enhance Current Annotations (Easiest) ✅
**Already done!** Continue improving the weather display in cards/modals.

### Phase 2: Add Weather Markers (Moderate)
**Best for:**
- Showing weather at multiple fishing locations
- Quick weather overview across the map
- Interactive weather points

**Implementation:**
```typescript
// Add toggle for weather markers
const [showWeatherMarkers, setShowWeatherMarkers] = useState(false);

// Fetch weather for popular fishing locations
useEffect(() => {
  if (showWeatherMarkers) {
    // Fetch weather for each location
    // Display as markers with icons
  }
}, [showWeatherMarkers]);
```

### Phase 3: Weather Tiles (Advanced)
**Best for:**
- Regional weather visualization
- Temperature/precipitation overlays
- Professional weather mapping

**Requirements:**
- Custom tileset generation (Mapbox Tiling Service)
- Regular data updates
- Additional API costs potentially

---

## Implementation Checklist

### For Weather Markers:
- [ ] Create weather marker component with icons
- [ ] Fetch weather for multiple locations
- [ ] Add markers to map using `PointAnnotation`
- [ ] Add toggle button to show/hide markers
- [ ] Handle marker press for detailed view

### For Weather Tiles:
- [ ] Set up data pipeline to collect weather data
- [ ] Process data into tileset format
- [ ] Upload to Mapbox Tiling Service
- [ ] Add source and layer to map
- [ ] Style the weather layer
- [ ] Add opacity/visibility controls

### For Weather Effects:
- [ ] Determine if particle effects are needed
- [ ] Research WebGL/particle rendering in React Native
- [ ] Integrate Mapbox Rain/Snow Playground code
- [ ] Connect to weather data for dynamic effects

---

## Key Resources

1. **Mapbox Tiling Service:**
   - Docs: https://docs.mapbox.com/mapbox-tiling-service/guides/
   - API: https://docs.mapbox.com/api/maps/mapbox-tiling-service/

2. **Weather Layers:**
   - Japan Weather Layers: https://docs.mapbox.com/data/tilesets/reference/mapbox-japan-weather-layers/
   - Raster Sources: https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/#raster

3. **React Native Mapbox:**
   - `@rnmapbox/maps` Docs: https://github.com/rnmapbox/maps
   - Layers: https://github.com/rnmapbox/maps#layers

4. **Weather Effects:**
   - Rain and Snow Playground: https://docs.mapbox.com/playground/rain-and-snow/

5. **Weather APIs:**
   - Your Backend API: `http://localhost:3001/api/weather/current`
   - OpenWeatherMap: https://openweathermap.org/api

---

## Example: Adding Weather Markers

```typescript
// In FishingMap.tsx

const [showWeatherMarkers, setShowWeatherMarkers] = useState(false);
const [weatherLocations, setWeatherLocations] = useState<any[]>([]);

// Fetch weather for popular fishing spots
const fetchWeatherForLocations = useCallback(async () => {
  const locations = [
    // Add your fishing locations here
    { id: 'provo-river', name: 'Provo River', lat: 40.2889, lon: -111.6733 },
    // ... more locations
  ];

  const weatherData = await Promise.all(
    locations.map(async (loc) => {
      const weather = await weatherService.getWeatherForLocation(loc.lat, loc.lon);
      return {
        ...loc,
        weather: weather,
        coordinates: [loc.lon, loc.lat]
      };
    })
  );

  setWeatherLocations(weatherData.filter(w => w.weather !== null));
}, []);

useEffect(() => {
  if (showWeatherMarkers) {
    fetchWeatherForLocations();
  }
}, [showWeatherMarkers, fetchWeatherForLocations]);

// Add toggle button in UI
<TouchableOpacity
  style={styles.weatherToggleButton}
  onPress={() => setShowWeatherMarkers(!showWeatherMarkers)}
>
  <Text>{showWeatherMarkers ? '🌤️ Hide Weather' : '☁️ Show Weather'}</Text>
</TouchableOpacity>

// Render markers in MapView
{showWeatherMarkers && weatherLocations.map((location) => (
  <Mapbox.PointAnnotation
    key={location.id}
    id={`weather-${location.id}`}
    coordinate={location.coordinates}
    onSelected={() => {
      // Show weather details
      Alert.alert(
        location.name,
        `${getWeatherIcon(location.weather.weather_condition)} ${Math.round(location.weather.temperature)}°F - ${location.weather.weather_description}`
      );
    }}
  >
    <View style={styles.weatherMarker}>
      <Text style={styles.weatherIcon}>
        {getWeatherIcon(location.weather.weather_condition)}
      </Text>
      <Text style={styles.weatherTemp}>
        {Math.round(location.weather.temperature)}°
      </Text>
    </View>
  </Mapbox.PointAnnotation>
))}
```

---

## Next Steps

1. **Start with Weather Markers** - Easiest to implement and provides immediate value
2. **Consider Weather Tiles** - If you need regional weather visualization
3. **Add Weather Effects** - For enhanced visual appeal (more complex)

Would you like me to implement weather markers first, or help set up weather tiles?

