# Fly Database Structure & Data Analysis

## 📊 Database Overview

**Database**: Supabase  
**Table**: `flies`  
**Connection**: Configured and working

---

## 🗂️ Fly Data Structure

Based on the TypeScript interface (`lib/types.ts`) and population scripts, each fly in the database contains:

### **Core Fields** (Required)
```typescript
{
  id: string                    // UUID
  name: string                  // e.g., "Adams", "Elk Hair Caddis"
  type: string                  // 'dry' | 'wet' | 'nymph' | 'streamer' | 'terrestrial' | 'emerger' | 'attractor' | 'imitation'
  pattern_name?: string         // Alternative name, e.g., "EHC" for Elk Hair Caddis
  sizes_available: string[]     // Array: ['12', '14', '16', '18', '20']
  primary_size: string          // Most common size: '16'
  color: string                 // Primary color: 'Gray', 'Brown', 'Olive'
  secondary_colors?: string[]    // Additional colors: ['Tan', 'Olive']
  description?: string           // Fly description text
  image?: string                // Path to fly image
  link?: string                 // URL to learn more
}
```

### **Best Conditions** (Critical for Suggestions)
```typescript
best_conditions: {
  weather: string[]                    // ['sunny', 'cloudy', 'overcast', 'rainy']
  water_clarity: string[]              // ['clear', 'slightly_murky', 'murky', 'very_murky']
  water_level: string[]                // ['low', 'normal', 'high', 'flooding']
  water_flow: string[]                 // ['still', 'slow', 'moderate', 'fast', 'raging']
  time_of_day: string[]               // ['dawn', 'morning', 'midday', 'afternoon', 'dusk', 'night']
  time_of_year: string[]               // ['spring', 'summer', 'fall', 'winter']
  water_temperature_range?: {         // Optional temperature range
    min: number                        // e.g., 45
    max: number                        // e.g., 70
  }
  air_temperature_range?: {            // Optional air temp range
    min: number
    max: number
  }
  wind_conditions?: string[]           // ['calm', 'light', 'moderate', 'strong']
  light_conditions?: string[]          // ['bright', 'overcast', 'low_light', 'dark']
}
```

### **Regional Effectiveness**
```typescript
regional_effectiveness: {
  regions: string[]                    // ['western', 'midwest', 'eastern', 'southern', 'mountain', 'coastal']
  primary_regions: string[]            // Most effective regions
  seasonal_patterns?: {                // Region-specific seasons
    [region: string]: string[]         // e.g., { western: ['spring', 'summer'] }
  }
}
```

### **Target Species**
```typescript
target_species: {
  primary: string[]                    // ['trout', 'bass', 'panfish']
  secondary?: string[]                  // Additional species
  size_preference?: string              // 'small' | 'medium' | 'large'
}
```

### **Hatch Matching** (For Matching Insect Hatches)
```typescript
hatch_matching?: {
  insects: string[]                    // ['mayfly', 'caddis', 'stonefly', 'midge']
  stages: string[]                     // ['nymph', 'emerger', 'dun', 'spinner']
  sizes: string[]                      // Matching insect sizes
}
```

### **Fly Characteristics**
```typescript
characteristics: {
  floatability?: 'high' | 'medium' | 'low'      // For dry flies
  sink_rate?: 'fast' | 'medium' | 'slow'       // For subsurface flies
  visibility?: 'high' | 'medium' | 'low'
  durability?: 'high' | 'medium' | 'low'
  versatility?: 'high' | 'medium' | 'low'      // Works in many conditions
}
```

### **Performance Metrics** (Updated by Usage)
```typescript
{
  success_rate: number                  // 0.0 to 1.0 (calculated from uses)
  total_uses: number                    // Total times fly was used
  successful_uses: number               // Times fly was successful
  confidence_score?: number             // Algorithm-calculated confidence
}
```

### **Metadata**
```typescript
{
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
  tying_difficulty?: 'easy' | 'medium' | 'hard'
  created_at: string                   // ISO timestamp
  updated_at: string                    // ISO timestamp
}
```

---

## 📋 Example Fly Data

Based on `scripts/populateDatabase.js`, here's what a complete fly record looks like:

```json
{
  "name": "Adams",
  "type": "dry",
  "pattern_name": "Adams Dry Fly",
  "sizes_available": ["12", "14", "16", "18", "20", "22"],
  "primary_size": "16",
  "color": "Gray",
  "secondary_colors": ["Gray-Brown", "Dark Gray"],
  "description": "Classic dry fly pattern, excellent for mayfly hatches. Versatile and effective in most conditions.",
  "best_conditions": {
    "weather": ["sunny", "cloudy", "overcast"],
    "water_clarity": ["clear", "slightly_murky"],
    "water_level": ["normal", "low"],
    "water_flow": ["slow", "moderate"],
    "time_of_day": ["morning", "afternoon", "dusk"],
    "time_of_year": ["spring", "summer", "fall"],
    "water_temperature_range": { "min": 45, "max": 70 },
    "air_temperature_range": { "min": 50, "max": 80 },
    "wind_conditions": ["calm", "light"],
    "light_conditions": ["bright", "overcast"]
  },
  "regional_effectiveness": {
    "regions": ["western", "midwest", "eastern", "mountain"],
    "primary_regions": ["western", "mountain"],
    "seasonal_patterns": {
      "western": ["spring", "summer", "fall"],
      "mountain": ["summer", "fall"]
    }
  },
  "target_species": {
    "primary": ["trout"],
    "secondary": ["grayling"],
    "size_preference": "medium"
  },
  "hatch_matching": {
    "insects": ["mayfly"],
    "stages": ["dun", "spinner"],
    "sizes": ["16", "18", "20"]
  },
  "characteristics": {
    "floatability": "high",
    "visibility": "high",
    "durability": "medium",
    "versatility": "high"
  },
  "success_rate": 0.0,
  "total_uses": 0,
  "successful_uses": 0,
  "difficulty_level": "beginner",
  "tying_difficulty": "medium"
}
```

---

## 🔍 How to Check Your Database

### Option 1: Run the Check Script
```bash
node scripts/checkCurrentDatabase.js
```

This will show:
- Total number of flies
- Flies grouped by type
- Duplicate detection
- Missing patterns

### Option 2: Query via Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select your project
3. Go to **Table Editor** → `flies`
4. View all records

### Option 3: Query via Code
```typescript
import { fliesService } from './lib/supabase';

const flies = await fliesService.getFlies();
console.log(`Total flies: ${flies.length}`);
console.log('Sample fly:', flies[0]);
```

---

## ✅ What the Fly Suggestion Algorithm Uses

The suggestion algorithms (`FlySuggestionService`, `EnhancedFlySuggestionService`, `HierarchicalFlySuggestionService`) use:

### **Primary Matching Criteria:**
1. ✅ **`best_conditions.weather`** - Matches current weather
2. ✅ **`best_conditions.water_clarity`** - Matches water clarity
3. ✅ **`best_conditions.water_level`** - Matches water level
4. ✅ **`best_conditions.time_of_day`** - Matches time of day
5. ✅ **`best_conditions.time_of_year`** - Matches season
6. ✅ **`best_conditions.water_temperature_range`** - Checks if water temp is in range
7. ✅ **`best_conditions.air_temperature_range`** - Checks if air temp is in range
8. ✅ **`best_conditions.wind_conditions`** - Matches wind conditions
9. ✅ **`best_conditions.light_conditions`** - Matches light conditions

### **Scoring Factors:**
- ✅ **`success_rate`** - Higher success rate = higher score
- ✅ **`total_uses`** - More uses = more proven
- ✅ **`characteristics.versatility`** - Versatile flies get bonuses
- ✅ **`characteristics.visibility`** - High visibility gets bonuses in certain conditions

### **Diversity Algorithm:**
- Ensures variety in suggestions (not all same type/color)
- Balances dry flies, nymphs, streamers
- Includes different sizes and colors

---

## 🎯 Key Points for Fly Suggestions

1. **`best_conditions` is CRITICAL** - This is what the algorithm matches against
2. **Temperature ranges** - Must be set for accurate suggestions
3. **Success rate** - Starts at 0, increases as users mark flies successful
4. **Multiple conditions** - Flies can match multiple weather/water conditions
5. **Regional data** - Can be used for location-specific suggestions

---

## 📊 Expected Fly Count

Based on `scripts/populateDatabase.js`, the database should contain:
- **100+ flies** across all types
- **Dry flies**: ~25 patterns
- **Nymphs**: ~30 patterns
- **Streamers**: ~20 patterns
- **Wet flies**: ~15 patterns
- **Terrestrials**: ~10 patterns

---

## ⚠️ Common Issues

1. **Empty Database**
   - Run: `node scripts/populateDatabase.js`
   - Or: `node scripts/rebuildFliesForMap.js`

2. **Missing `best_conditions`**
   - Flies without `best_conditions` won't be suggested
   - Check that all flies have this field populated

3. **Zero Success Rates**
   - Normal for new flies
   - Will improve as users mark flies successful/unsuccessful

4. **Temperature Ranges Not Set**
   - Suggestions will be less accurate
   - Should include `water_temperature_range` and `air_temperature_range`

---

## 🔧 Verification Commands

```bash
# Check database status
node scripts/checkCurrentDatabase.js

# Count flies
node scripts/countFlies.js

# Check schema
node scripts/checkSchema.js

# Rebuild flies (if needed)
node scripts/rebuildFliesForMap.js
```

---

**Last Updated**: Based on codebase analysis  
**Database**: Supabase (configured)  
**Status**: Structure defined, need to verify data exists

