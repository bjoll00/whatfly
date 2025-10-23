# WhatFly App - Comprehensive Documentation

## Overview
WhatFly is a React Native fishing app that provides personalized fly fishing recommendations based on real-time environmental conditions, location data, and an extensive database of fly patterns. The app uses advanced algorithms to suggest the best flies for specific fishing conditions.

## Architecture

### Tech Stack
- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL database)
- **Maps**: Mapbox integration
- **Navigation**: Expo Router with tab-based navigation
- **State Management**: React Context + Local State
- **Data Sources**: Weather APIs, USGS water data, lunar/solunar calculations

### Project Structure
```
WhatFly/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── map.tsx        # Interactive fishing map
│   │   ├── whatfly/       # Fly recommendation tab
│   │   ├── catchlog/      # Catch logging
│   │   ├── feedback/      # User feedback
│   │   └── settings.tsx   # App settings
│   ├── auth.tsx           # Authentication
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── lib/                   # Core services and utilities
├── assets/               # Images, fonts, etc.
└── scripts/              # Database management scripts
```

## Core Features

### 1. Interactive Fishing Map (`app/(tabs)/map.tsx`)
**Purpose**: Allows users to select fishing locations and get location-specific fly recommendations.

**Key Components**:
- `FishingMap.tsx`: Main map component with Mapbox integration
- `RiverDisplay.tsx`: Shows detailed river information
- `RiverList.tsx`: Searchable list of river segments

**Data Sources**:
- Utah fishing locations (`lib/fishingLocationsData.ts`)
- River systems data (`lib/riverData.ts`)
- River path coordinates (`lib/riverPaths.ts`)

**Functionality**:
- Interactive map with fishing locations
- River path visualization (blue lines following natural river curves)
- Location selection with real-time condition gathering
- Weather and water condition integration
- Lunar/solunar period calculations

### 2. Fly Recommendation System (`app/(tabs)/whatfly/index.tsx`)
**Purpose**: Provides personalized fly suggestions based on current fishing conditions.

**Algorithm Types**:
1. **Enhanced Algorithm** (`lib/enhancedFlySuggestionService.ts`): Advanced scoring with diversity weighting
2. **Standard Algorithm** (`lib/flySuggestionService.ts`): Traditional condition-based scoring

**Scoring Factors**:
- Weather conditions (sunny, cloudy, overcast, rainy)
- Water conditions (clarity, level, flow, temperature)
- Time factors (time of day, season)
- Real-time data (USGS flow rates, temperatures)
- Lunar phases and solunar periods
- Regional effectiveness

### 3. Database Schema (`lib/types.ts`)

**Fly Interface**:
```typescript
interface Fly {
  id: string;
  name: string;
  type: 'dry' | 'nymph' | 'streamer' | 'terrestrial' | 'wet' | 'emerger';
  size: string;
  color: string;
  sizes_available?: string[];      // Multiple size options
  colors_available?: string[];     // Multiple color options
  description?: string;
  best_conditions: {
    weather: string[];
    time_of_day: string[];
    time_of_year: string[];
    water_clarity: string[];
    water_level: string[];
    water_flow: string[];
    water_temperature_range?: { min: number; max: number };
    air_temperature_range?: { min: number; max: number };
  };
  regional_effectiveness: {
    regions: string[];
    primary_regions: string[];
  };
  target_species: {
    primary: string[];
    secondary?: string[];
  };
  success_rate: number;
  total_uses: number;
  successful_uses: number;
}
```

**Fishing Conditions Interface**:
```typescript
interface FishingConditions {
  location?: string;
  latitude?: number;
  longitude?: number;
  weather_conditions: string;
  water_clarity: string;
  water_level: string;
  water_flow?: string;
  time_of_day: string;
  time_of_year?: string;
  water_temperature?: number;
  wind_speed?: string;
  wind_direction?: string;
  air_temperature_range?: string;
  
  // Lunar data
  moon_phase?: string;
  moon_illumination?: number;
  lunar_feeding_activity?: string;
  solunar_periods?: any;
  
  // Real-time water data
  water_data?: {
    flowRate: number;
    waterTemperature: number;
    gaugeHeight: number;
    dataQuality: string;
    stationName: string;
  };
}
```

## Data Flow

### 1. Location Selection Flow
```
User selects location on map
    ↓
FishingMap.tsx handles selection
    ↓
Gathers real-time conditions:
  - Weather data (WeatherService)
  - Water conditions (WaterConditionsService)
  - Lunar data (LunarService)
  - Location coordinates
    ↓
Passes comprehensive data to WhatFly tab
    ↓
WhatFly tab processes conditions
    ↓
Fly suggestion algorithm scores flies
    ↓
Returns ranked recommendations
```

### 2. Fly Suggestion Algorithm Flow
```
Input: FishingConditions object
    ↓
Fetch official flies from Supabase
    ↓
Filter to ensure only official flies (no user input)
    ↓
Score each fly based on conditions:
  - Weather match (high priority)
  - Time of day match (high priority)
  - Season match (high priority)
  - Water conditions (medium priority)
  - Real-time data (high priority)
  - Lunar/solunar factors
  - Regional effectiveness
    ↓
Apply diversity algorithm to ensure variety
    ↓
Rank and return top 5-8 suggestions
```

### 3. Data Sources Integration

**Weather Data** (`lib/weatherService.ts`):
- Fetches current weather conditions
- Converts to fishing-relevant format
- Includes temperature, humidity, wind, cloudiness

**Water Conditions** (`lib/waterConditionsService.ts`):
- Real-time USGS stream data
- Flow rates, water temperature, gauge height
- Data quality assessment

**Lunar Service** (`lib/lunarService.ts`):
- Moon phase calculations
- Solunar period determination
- Feeding activity predictions

**Location Services** (`lib/locationService.ts`):
- GPS location detection
- Reverse geocoding
- Regional determination

## Key Services

### 1. Enhanced Fly Suggestion Service
**File**: `lib/enhancedFlySuggestionService.ts`

**Features**:
- Reduced penalties for condition mismatches
- Bonus points for versatile flies
- Diversity weighting to ensure variety
- Regional effectiveness scoring
- Lunar/solunar integration

**Scoring Logic**:
```typescript
// Weather conditions - High priority but flexible
if (weatherConditions.includes(weather)) {
  score += 60; // High score for exact match
} else if (similarWeather.some(w => weatherConditions.includes(w))) {
  score += 30; // Moderate score for similar conditions
} else {
  score -= 15; // Reduced penalty
}
```

### 2. Auto-Detection Service
**File**: `lib/autoDetectionService.ts`

**Purpose**: Automatically detects fishing conditions based on location and time.

**Features**:
- Weather condition detection
- Seasonal pattern recognition
- Time-based recommendations
- Lunar data integration

### 3. Supabase Integration
**File**: `lib/supabase.ts`

**Database Tables**:
- `flies`: Fly patterns with condition data
- `users`: User accounts and preferences
- `usage_tracking`: API usage monitoring
- `feedback`: User feedback and suggestions

## User Interface Components

### 1. Map Components
- **FishingMap**: Main interactive map with location selection
- **RiverDisplay**: Detailed river information modal
- **RiverList**: Searchable river segments list

### 2. Fly Recommendation Components
- **FlySuggestionCard**: Individual fly recommendation display
- **FlyDetailModal**: Detailed fly information
- **PopularFliesSection**: Trending and popular flies

### 3. Form Components
- **WaterConditionsInput**: Water condition selection
- **LocationPicker**: Location selection interface

## Database Management

### Fly Database
**Location**: Supabase `flies` table

**Content**:
- 60+ official fly patterns
- Multiple fly types (dry, nymph, streamer, terrestrial, wet)
- Comprehensive condition data for each fly
- Success rates and usage statistics
- Regional effectiveness data

**Management Scripts**:
- `scripts/flyDatabaseMigration.sql`: Complete database update script
- `scripts/checkCurrentDatabase.js`: Database state verification
- `scripts/manualDatabaseCleanup.js`: Manual cleanup guide

### Data Integrity
- **Official Flies Only**: User input and custom flies are filtered out
- **Condition-Based Scoring**: All recommendations based on fishing conditions
- **No User Influence**: Algorithm completely isolated from user preferences

## Authentication & User Management

### Auth Context (`lib/AuthContext.tsx`)
- Supabase authentication integration
- User session management
- Protected route handling

### Usage Tracking
- API call monitoring
- Usage limit enforcement
- Premium feature gating

## Configuration

### App Configuration (`lib/appConfig.ts`)
```typescript
export const APP_CONFIG = {
  SUPABASE_URL: 'https://aflfbalfpjhznkbwatqf.supabase.co',
  SUPABASE_ANON_KEY: '...',
  MAPBOX_ACCESS_TOKEN: '...',
  ENABLE_USAGE_LIMITS: true,
  MAX_FREE_SUGGESTIONS: 3,
  MAX_PREMIUM_SUGGESTIONS: 8
};
```

### Environment Setup
- Supabase project configuration
- Mapbox API integration
- Weather API credentials
- USGS water data access

## Development Workflow

### 1. Local Development
```bash
npm install
npm run start
```

### 2. Database Updates
```bash
# Run migration script in Supabase SQL Editor
node scripts/flyDatabaseMigration.sql

# Verify database state
node scripts/checkCurrentDatabase.js
```

### 3. Testing
- Location selection testing
- Fly suggestion algorithm validation
- Real-time data integration testing
- Cross-platform compatibility (iOS/Android)

## Key Algorithms

### 1. Fly Scoring Algorithm
**Input**: Fly object + FishingConditions
**Output**: Scored fly suggestion

**Scoring Factors**:
1. Weather match (60 points max)
2. Time of day match (50 points max)
3. Season match (45 points max)
4. Water conditions (20 points max each)
5. Real-time data bonus (70 points max)
6. Lunar/solunar bonus (12 points max)
7. Versatility bonus (25 points max)

### 2. Diversity Algorithm
**Purpose**: Ensures variety in recommendations

**Process**:
1. Group flies by type
2. Select best fly from each type
3. Apply diversity scoring for remaining selections
4. Ensure mix of sizes and colors

### 3. Regional Effectiveness
**Purpose**: Adjusts recommendations based on geographic location

**Regions**:
- Western (latitude > 40, longitude < -100)
- Eastern (latitude > 40, longitude > -100)
- Southern (latitude < 40)
- Mountain (default)

## Data Sources & APIs

### 1. Weather Data
- OpenWeatherMap API
- Current conditions and forecasts
- Temperature, humidity, wind, precipitation

### 2. Water Conditions
- USGS Water Services API
- Real-time stream data
- Flow rates, temperatures, gauge heights

### 3. Geographic Data
- Mapbox Geocoding API
- Location services
- Reverse geocoding

### 4. Lunar Data
- Custom lunar calculation service
- Moon phase determination
- Solunar period calculation

## Performance Optimizations

### 1. Data Caching
- Fly database caching
- Weather data caching
- Location data persistence

### 2. Algorithm Efficiency
- Efficient fly scoring
- Optimized database queries
- Minimal API calls

### 3. UI Optimizations
- Lazy loading of components
- Efficient list rendering
- Optimized map rendering

## Security & Privacy

### 1. Data Protection
- Supabase Row Level Security (RLS)
- User data isolation
- Secure API key management

### 2. Input Validation
- Fly data validation
- Condition data sanitization
- SQL injection prevention

### 3. User Privacy
- Minimal data collection
- Location data handling
- Usage tracking transparency

## Deployment

### 1. Expo Build
```bash
# Development build
npm run build:dev

# Production build
npm run build:prod
```

### 2. App Store Deployment
- iOS App Store via Expo Application Services (EAS)
- Google Play Store via EAS
- Over-the-air updates for non-native changes

## Monitoring & Analytics

### 1. Error Tracking
- Console logging for debugging
- Error boundary implementation
- Performance monitoring

### 2. Usage Analytics
- Feature usage tracking
- User engagement metrics
- Performance metrics

## Future Enhancements

### 1. Planned Features
- Social features (sharing catches)
- Advanced weather forecasting
- Machine learning improvements
- Offline mode support

### 2. Algorithm Improvements
- Enhanced regional data
- More sophisticated condition matching
- User feedback integration
- Seasonal pattern learning

## Troubleshooting

### Common Issues
1. **Map not loading**: Check Mapbox API key
2. **No fly suggestions**: Verify Supabase connection
3. **Weather data missing**: Check API credentials
4. **Location not updating**: Verify GPS permissions

### Debug Tools
- Console logging throughout the app
- Database state verification scripts
- API response monitoring
- Performance profiling

## Conclusion

WhatFly is a sophisticated fishing app that combines real-time environmental data, advanced algorithms, and an extensive fly database to provide personalized fishing recommendations. The system is designed to be data-driven, user-friendly, and completely isolated from user input to ensure consistent, professional recommendations based purely on fishing conditions.

The architecture supports scalability, maintainability, and future enhancements while providing a robust foundation for fly fishing enthusiasts to make informed decisions about their fly selection.
