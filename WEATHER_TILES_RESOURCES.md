# Weather Tiles & Weather Data - Quick Reference Sources

## 📚 Official Documentation & Examples

### Mapbox Official Resources

1. **Mapbox Tiling Service (MTS)**
   - **URL:** https://docs.mapbox.com/mapbox-tiling-service/guides/
   - **What it is:** Service to create custom tilesets from your weather data
   - **Use case:** Converting OpenWeatherMap data into map layers
   - **API Docs:** https://docs.mapbox.com/api/maps/mapbox-tiling-service/

2. **Mapbox Japan Weather Layers (Reference Implementation)**
   - **URL:** https://docs.mapbox.com/data/tilesets/reference/mapbox-japan-weather-layers/
   - **What it is:** Pre-processed weather tilesets (precipitation, temperature, wind)
   - **Example code:** Shows how to add raster weather layers
   - **Note:** Region-specific, but good reference for implementation pattern

3. **Mapbox Rain and Snow Playground**
   - **URL:** https://docs.mapbox.com/playground/rain-and-snow/
   - **What it is:** Interactive tool to create animated weather effects
   - **Use case:** Adding particle effects (rain, snow) to your map
   - **Output:** Generates code snippets for integration

4. **Mapbox iOS Weather Example (SwiftUI)**
   - **URL:** https://docs.mapbox.com/ios/maps/examples/swiftui-view-weather/
   - **What it is:** Example showing weather annotations on maps
   - **Use case:** Reference for implementing weather markers in React Native
   - **Adapt for:** React Native using `@rnmapbox/maps`

### React Native Mapbox Resources

5. **@rnmapbox/maps Documentation**
   - **GitHub:** https://github.com/rnmapbox/maps
   - **What it is:** React Native wrapper for Mapbox
   - **Key sections:**
     - Layers: https://github.com/rnmapbox/maps#layers
     - Sources: https://github.com/rnmapbox/maps#sources
     - Examples: https://github.com/rnmapbox/maps/tree/main/example

6. **React Native Mapbox Examples**
   - **GitHub Examples:** https://github.com/rnmapbox/maps/tree/main/example/src/examples
   - **What it is:** Code examples for common Mapbox features
   - **Look for:** Layer examples, raster source examples

---

## 🌐 Weather API Resources

### Your Current Setup

7. **Your Backend Weather API**
   - **Endpoint:** `http://localhost:3001/api/weather/current?lat={lat}&lon={lon}`
   - **Returns:** Temperature, condition, wind, humidity, etc.
   - **Source:** OpenWeatherMap (via your backend)

### External Weather APIs

8. **OpenWeatherMap API**
   - **URL:** https://openweathermap.org/api
   - **Docs:** https://openweathermap.org/api
   - **Features:**
     - Current weather
     - Forecast (5-day, 16-day)
     - Weather maps (tiles) - **KEY FOR WEATHER TILES!**
   - **Weather Maps API:** https://openweathermap.org/api/weathermaps

9. **OpenWeatherMap Weather Maps (Tiles)**
   - **URL:** https://openweathermap.org/api/weathermaps
   - **What it is:** Pre-made weather tile URLs you can use directly
   - **Example tile URL format:**
     ```
     https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={API_KEY}
     ```
   - **Layers:** clouds, precipitation, pressure, temperature, wind
   - **Use case:** Direct integration without MTS

---

## 🛠️ Third-Party Solutions

10. **MapTiler Weather SDK**
    - **URL:** https://www.maptiler.com/weather/
    - **What it is:** Commercial weather SDK with animated forecast layers
    - **Features:** Weather icons, 5-day forecasts, animations
    - **Compatibility:** Works with Mapbox GL JS
    - **Cost:** Commercial license required

11. **Pipedream Mapbox + OpenWeather Integration**
    - **URL:** https://pipedream.com/apps/mapbox/integrations/openweather-api
    - **What it is:** Workflow automation between Mapbox and OpenWeather
    - **Use case:** Automating weather data updates

---

## 📖 Implementation Approaches

### Approach 1: Direct Weather Tile URLs (Easiest)

**Source:** OpenWeatherMap Weather Maps API

**How:**
```typescript
// Add OpenWeatherMap tiles directly
mapRef.current.addSource('weather-temp', {
  type: 'raster',
  tiles: [
    `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`
  ],
  tileSize: 256
});

mapRef.current.addLayer({
  id: 'temperature-layer',
  type: 'raster',
  source: 'weather-temp',
  paint: {
    'raster-opacity': 0.6
  }
});
```

**Available layers:**
- `temp_new` - Temperature
- `clouds_new` - Cloud coverage
- `precipitation_new` - Precipitation
- `pressure_new` - Atmospheric pressure
- `wind_new` - Wind speed and direction

**Pros:**
- ✅ No data processing needed
- ✅ Easy to implement
- ✅ Real-time updates

**Cons:**
- ❌ Requires OpenWeatherMap subscription for weather maps
- ❌ Less customization than custom tilesets

---

### Approach 2: Custom Tilesets via MTS (Advanced)

**Source:** Mapbox Tiling Service

**Steps:**
1. Collect weather data from your backend
2. Format as GeoJSON or GeoTIFF
3. Upload to Mapbox Tiling Service
4. Add as source/layer in map

**Pros:**
- ✅ Full control over data
- ✅ Custom styling
- ✅ Can combine multiple data sources

**Cons:**
- ❌ More complex setup
- ❌ Requires data processing pipeline
- ❌ Tileset generation takes time

---

### Approach 3: Weather Markers (Current Enhancement)

**Source:** Your existing weather service + Mapbox PointAnnotation

**How:**
- Fetch weather for multiple locations
- Display as interactive markers
- Show weather icons + temperature

**Pros:**
- ✅ Already have the data
- ✅ Simple to implement
- ✅ Interactive (tap for details)

**Cons:**
- ❌ Only shows specific points, not regional coverage
- ❌ Limited to locations you query

---

## 🔍 Code Examples to Reference

### React Native Mapbox Layer Example

```typescript
// From @rnmapbox/maps examples
import Mapbox from '@rnmapbox/maps';

<Mapbox.MapView>
  <Mapbox.RasterSource
    id="weather-source"
    url="https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=YOUR_KEY"
    tileSize={256}
  >
    <Mapbox.RasterLayer
      id="weather-layer"
      sourceID="weather-source"
      style={{ rasterOpacity: 0.6 }}
    />
  </Mapbox.RasterSource>
</Mapbox.MapView>
```

### Web Mapbox GL JS Example (Reference)

```javascript
// From Mapbox GL JS docs - adapt for React Native
map.addSource('weather', {
  type: 'raster',
  tiles: [
    'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=YOUR_KEY'
  ],
  tileSize: 256
});

map.addLayer({
  id: 'weather-layer',
  type: 'raster',
  source: 'weather',
  paint: {
    'raster-opacity': 0.6
  }
});
```

---

## 🎯 Recommended Next Steps

1. **Start with OpenWeatherMap Tiles** (if you have subscription)
   - Easiest implementation
   - Direct tile URLs
   - Multiple weather layers available

2. **Add Weather Markers** (using your existing API)
   - Quick win
   - Shows weather at fishing locations
   - Interactive and user-friendly

3. **Consider Custom Tilesets** (for advanced features)
   - If you need custom data visualization
   - For combining multiple weather sources
   - For offline weather maps

---

## 📝 Key Files in Your Project

- **Map Component:** `components/FishingMap.tsx`
- **Weather Service:** `lib/weatherService.ts`
- **Mapbox Config:** `lib/mapboxConfig.ts`
- **Backend API:** `backend/routes/weather.js`
- **Implementation Guide:** `WEATHER_TILES_IMPLEMENTATION.md`

---

## 🔗 Quick Links

- [Mapbox Tiling Service Docs](https://docs.mapbox.com/mapbox-tiling-service/guides/)
- [OpenWeatherMap Weather Maps](https://openweathermap.org/api/weathermaps)
- [Mapbox Rain/Snow Playground](https://docs.mapbox.com/playground/rain-and-snow/)
- [React Native Mapbox GitHub](https://github.com/rnmapbox/maps)
- [Mapbox Raster Sources](https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/#raster)

---

**Last Updated:** Based on current Mapbox and OpenWeatherMap documentation as of 2024

