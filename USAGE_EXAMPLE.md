# fetchFishingData Usage Example

## Quick Integration

### Option 1: Use in Your Existing FishingMap Component

```typescript
import { fetchFishingData } from '../lib/fetchFishingData';

// In your component:
const [weatherMarker, setWeatherMarker] = useState(null);

const handleMapPress = async (event: any) => {
  const [longitude, latitude] = event.geometry.coordinates;
  
  // Fetch fishing data
  const data = await fetchFishingData(latitude, longitude);
  
  if (data) {
    setWeatherMarker(data);
  }
};
```

### Option 2: Use with Backend API (Recommended)

The function automatically uses your backend API if `OWM_API_KEY` is not provided:

```typescript
// No API key needed - uses your backend
const data = await fetchFishingData(latitude, longitude);
```

### Option 3: Direct API Calls

```typescript
const OWM_API_KEY = 'your_key_here';
const data = await fetchFishingData(latitude, longitude, OWM_API_KEY);
```

## Return Data Structure

```typescript
{
  coordinate: [longitude, latitude],
  airTemperature: number,        // °C
  weatherDescription: string,
  weatherIcon: string,
  streamFlow: number | null,     // cfs
  waterTemperature: number | null, // °C
  usgsStationId: string | null,
  timestamp: string
}
```

## Full Example Component

See `components/FishingDataExample.tsx` for a complete working example.

