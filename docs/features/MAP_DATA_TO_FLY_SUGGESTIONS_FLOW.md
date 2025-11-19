# Map Data to Fly Suggestions - Complete Data Flow

## ✅ **IMPLEMENTATION COMPLETE**

All map data is now automatically converted and made available for fly suggestion algorithms.

---

## 📊 **Data Flow Overview**

```
User clicks map location
    ↓
FishingMap.handleMapPress()
    ↓
fetchFishingData(lat, lng)
    ↓
Returns WeatherMarker data (raw API format)
    ↓
convertMapDataToFishingConditions()
    ↓
Converts to FishingConditions format
    ↓
Stored in FishingContext
    ↓
Available to Fly Suggestion Services
```

---

## 🔄 **What Gets Converted**

### **Input: WeatherMarker** (from `fetchFishingData`)
```typescript
{
  airTemp: number,              // °C
  windSpeedMph: number | null,
  windDirectionDeg: number | null,
  barometricPressureHpa: number | null,
  cloudCoverPercent: number | null,
  weatherDescription: string,
  streamFlow: number | null,    // cfs
  waterTemperature: number | null, // °C
  moonPhase: string | null,
  major1, major2, minor1, minor2: string | null,
  sunrise, sunset: number | null,
  // ... more fields
}
```

### **Output: FishingConditions** (for fly suggestions)
```typescript
{
  location: string,
  latitude: number,
  longitude: number,
  weather_conditions: 'sunny' | 'cloudy' | 'overcast' | 'rainy' | 'stormy' | 'foggy',
  water_conditions: 'calm' | 'rippled' | 'choppy' | 'fast_moving' | 'turbulent',
  water_temperature_range: 'very_cold' | 'cold' | 'cool' | 'moderate' | 'warm' | 'hot',
  water_temperature: number,    // °F
  air_temperature_range: 'very_cold' | 'cold' | 'cool' | 'moderate' | 'warm' | 'hot',
  wind_speed: 'none' | 'light' | 'moderate' | 'strong' | 'very_strong',
  wind_direction: 'north' | 'northeast' | 'east' | ...,
  water_clarity: 'clear' | 'slightly_murky' | 'murky' | 'very_murky',
  water_level: 'low' | 'normal' | 'high' | 'flooding',
  water_flow: 'still' | 'slow' | 'moderate' | 'fast' | 'rapid',
  time_of_day: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'night',
  time_of_year: 'winter' | 'spring' | 'summer' | 'fall',
  moon_phase: 'new' | 'waxing_crescent' | 'full' | ...,
  solunar_periods: { major_periods, minor_periods, sunrise, sunset },
  weather_data: { temperature, pressure, wind_speed, cloud_cover, ... },
  water_data: { flow_rate, water_temperature, station_id, ... }
}
```

---

## 🎯 **Conversion Functions**

### **1. Weather Data Conversions**

| Raw Data | Converted To | Algorithm Used |
|----------|-------------|----------------|
| `weatherDescription` string | `weather_conditions` enum | Text matching (sunny, cloudy, rainy, etc.) |
| `airTemp` (°C) | `air_temperature_range` enum | Temperature ranges: <32°F=very_cold, 32-45°F=cold, etc. |
| `windSpeedMph` (mph) | `wind_speed` enum | Speed ranges: <5mph=none, 5-15mph=light, etc. |
| `windDirectionDeg` (0-360°) | `wind_direction` enum | Degree to cardinal direction conversion |
| `barometricPressureHpa` | `weather_data.pressure` | Direct pass-through |
| `cloudCoverPercent` | `weather_data.cloud_cover` | Direct pass-through |

### **2. Water Data Conversions**

| Raw Data | Converted To | Algorithm Used |
|----------|-------------|----------------|
| `streamFlow` (cfs) | `water_conditions` enum | Flow ranges: <50cfs=calm, 50-100cfs=rippled, etc. |
| `streamFlow` (cfs) | `water_clarity` enum | Flow-based clarity: <50cfs=clear, 50-100cfs=slightly_murky, etc. |
| `streamFlow` (cfs) | `water_level` enum | Flow-based level: <50cfs=low, 50-150cfs=normal, etc. |
| `streamFlow` (cfs) | `water_flow` enum | Flow speed: <60cfs=still, 60-180cfs=slow, etc. |
| `waterTemperature` (°C) | `water_temperature_range` enum | Convert to °F, then range classification |
| `waterTemperature` (°C) | `water_temperature` (°F) | °C to °F conversion |

### **3. Time & Season Conversions**

| Raw Data | Converted To | Algorithm Used |
|----------|-------------|----------------|
| Current hour | `time_of_day` enum | Hour-based: 5-8am=dawn, 8am-12pm=morning, etc. |
| Current month | `time_of_year` enum | Month-based: Mar-May=spring, Jun-Aug=summer, etc. |

### **4. Celestial Data Conversions**

| Raw Data | Converted To | Algorithm Used |
|----------|-------------|----------------|
| `moonPhase` string | `moon_phase` enum | Text matching (new, full, waxing_crescent, etc.) |
| `major1`, `major2` | `solunar_periods.major_periods` | Array of period objects |
| `minor1`, `minor2` | `solunar_periods.minor_periods` | Array of period objects |
| `sunrise`, `sunset` | `solunar_periods.sunrise/sunset` | Unix timestamp to ISO string |

---

## 📝 **Files Created/Modified**

### **New File: `lib/mapDataConverter.ts`**
- Contains `convertMapDataToFishingConditions()` function
- All conversion logic for weather, water, time, and celestial data
- Handles temperature conversions (°C to °F)
- Handles flow-based water condition calculations
- Builds complete `FishingConditions` object

### **Modified: `components/FishingMap.tsx`**
- Added import for `useFishing` hook
- Added import for `convertMapDataToFishingConditions`
- Converts map data when location is selected
- Stores converted data in `FishingContext`
- Clears context when selection is cleared

---

## ✅ **What This Enables**

### **1. Automatic Data Availability**
- When user selects location on map, all data is automatically:
  - Fetched from APIs (weather, water, celestial)
  - Converted to correct format
  - Stored in FishingContext
  - Available to fly suggestion services

### **2. Complete Data Set**
All these fields are now available for fly suggestions:
- ✅ Location (lat/lng)
- ✅ Weather conditions (sunny, cloudy, etc.)
- ✅ Air temperature (range + specific)
- ✅ Wind speed & direction
- ✅ Water conditions (calm, choppy, etc.)
- ✅ Water temperature (range + specific)
- ✅ Water clarity (clear, murky, etc.)
- ✅ Water level (low, normal, high)
- ✅ Water flow (still, slow, fast)
- ✅ Stream flow (cfs)
- ✅ Time of day
- ✅ Season
- ✅ Moon phase
- ✅ Solunar periods (major/minor feeding times)
- ✅ Sunrise/sunset times
- ✅ All raw weather data (pressure, cloud cover, etc.)
- ✅ All raw water data (flow rate, station ID, etc.)

### **3. Algorithm Compatibility**
The converted data matches exactly what the fly suggestion algorithms expect:
- `FlySuggestionService.getSuggestions()`
- `EnhancedFlySuggestionService.getSuggestions()`
- `HierarchicalFlySuggestionService.getSuggestions()`

All three services can now use the map data directly!

---

## 🧪 **Testing**

To verify the conversion is working:

1. **Select a location on the map**
2. **Check console logs** - should see:
   ```
   ✅ Map data converted and stored in FishingContext for fly suggestions
   🔄 Converted map data to FishingConditions: { ... }
   ```

3. **Check FishingContext** - can access via:
   ```typescript
   const { fishingConditions } = useFishing();
   console.log('Fishing Conditions:', fishingConditions);
   ```

4. **Use in fly suggestions** - the conditions are automatically available:
   ```typescript
   const { fishingConditions } = useFishing();
   const result = await flySuggestionService.getSuggestions(fishingConditions);
   ```

---

## 📊 **Data Mapping Examples**

### Example 1: Sunny Day, Low Flow
```
Input:
  weatherDescription: "clear sky"
  airTemp: 25°C (77°F)
  windSpeedMph: 8 mph
  streamFlow: 45 cfs
  waterTemperature: 15°C (59°F)

Output:
  weather_conditions: "sunny"
  air_temperature_range: "warm"
  wind_speed: "light"
  water_conditions: "calm"
  water_clarity: "clear"
  water_level: "low"
  water_flow: "still"
  water_temperature_range: "cool"
```

### Example 2: Rainy Day, High Flow
```
Input:
  weatherDescription: "moderate rain"
  airTemp: 10°C (50°F)
  windSpeedMph: 22 mph
  streamFlow: 350 cfs
  waterTemperature: 8°C (46°F)

Output:
  weather_conditions: "rainy"
  air_temperature_range: "cool"
  wind_speed: "moderate"
  water_conditions: "fast_moving"
  water_clarity: "very_murky"
  water_level: "high"
  water_flow: "fast"
  water_temperature_range: "cold"
```

---

## 🎯 **Next Steps**

Now that data conversion is complete, the remaining work is:

1. ✅ **Data conversion** - DONE
2. ⏳ **Fly suggestions UI** - Create component to display suggestions
3. ⏳ **Wire up button** - Connect "Get Fly Suggestions" button to service
4. ⏳ **Test end-to-end** - Verify suggestions appear correctly

---

## 📝 **Notes**

- All temperature conversions handle °C to °F properly
- Flow-based calculations use standard fly fishing flow ranges
- Time of day and season are calculated from current date/time
- Moon phase conversion handles various text formats
- Solunar periods are structured for algorithm use
- All data is stored in FishingContext for global access
- Data is cleared when user clears map selection

---

**Status**: ✅ **COMPLETE** - All map data is now converted and available for fly suggestions!

