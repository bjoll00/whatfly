# Imitated Insect Data Normalization

## 🎯 Problem

The `imitated_insect` JSONB column in the Supabase `flies` table contained a lot of data that should be in separate columns for better data structure, querying, and maintainability.

## ✅ Solution

We've normalized the `imitated_insect` JSONB data into separate columns and existing structured fields.

## 📊 Data Mapping

### Extracted to Existing Columns (via `normalizeImitatedInsectData.js`)

| imitated_insect Field | → | Database Column | Status |
|----------------------|---|-----------------|--------|
| `sizes` | → | `sizes_available` | ✅ Complete |
| `primarySize` | → | `primary_size` | ✅ Complete |
| `summary` | → | `description` | ✅ Complete |
| `patternName` | → | `pattern_name` | ✅ Complete |
| `colorPalette` | → | `secondary_colors` | ✅ Complete |
| `imitates` | → | `hatch_matching.insects` | ✅ Complete |
| `lifeStages` | → | `hatch_matching.stages` | ✅ Complete |
| `hatchSeasons` | → | `best_conditions.time_of_year` | ✅ Complete |
| `hatchTimes` | → | `best_conditions.time_of_day` | ✅ Complete |
| `waterPreferences` | → | `best_conditions.water_flow` | ✅ Complete |
| `weatherPreferences` | → | `best_conditions.weather` | ✅ Complete |

### Extracted to New Columns (via SQL migration)

| imitated_insect Field | → | New Database Column | Status |
|----------------------|---|---------------------|--------|
| `insectOrder` | → | `insect_order` | ⏳ Run migration |
| `category` | → | `insect_category` | ⏳ Run migration |
| `behavior` | → | `insect_behavior` | ⏳ Run migration |
| `sizeRange.min` | → | `insect_size_min` | ⏳ Run migration |
| `sizeRange.max` | → | `insect_size_max` | ⏳ Run migration |

## 🚀 Implementation Steps

### Step 1: ✅ Extract Data to Existing Columns (COMPLETE)

The script `scripts/normalizeImitatedInsectData.js` has been run and successfully extracted data from `imitated_insect` to existing columns for all 94 flies.

**Result**: All flies now have:
- `sizes_available` populated from `imitated_insect.sizes`
- `primary_size` populated from `imitated_insect.primarySize`
- `description` populated from `imitated_insect.summary`
- `pattern_name` populated from `imitated_insect.patternName`
- `secondary_colors` populated from `imitated_insect.colorPalette`
- `hatch_matching` populated with `insects`, `stages`, and `sizes`
- `best_conditions` populated with `time_of_year`, `time_of_day`, `water_flow`, and `weather`

### Step 2: ⏳ Run SQL Migration (PENDING)

Run the SQL migration in Supabase SQL editor:

```sql
-- File: scripts/migration_normalize_imitated_insect.sql
```

This will:
1. Add 5 new columns: `insect_order`, `insect_category`, `insect_behavior`, `insect_size_min`, `insect_size_max`
2. Extract data from `imitated_insect` JSONB to these new columns

### Step 3: ✅ Update TypeScript Types (COMPLETE)

The `Fly` interface in `lib/types.ts` has been updated to include the new columns:

```typescript
// Insect-specific data (extracted from imitated_insect JSONB)
insect_order?: string;
insect_category?: string;
insect_behavior?: string;
insect_size_min?: number;
insect_size_max?: number;
```

### Step 4: 🔄 Update Code to Use New Columns (RECOMMENDED)

The fly suggestion algorithms should be updated to use the new separate columns instead of accessing `imitated_insect` JSONB. However, the code will continue to work with the JSONB for backward compatibility.

**Current Status**: 
- `lib/newFlySuggestionService.ts` still uses `imitated_insect` JSONB
- This works but should be updated to use the normalized columns for better performance

## 📋 Files Created/Modified

### Created
- `scripts/normalizeImitatedInsectData.js` - Extracts data to existing columns
- `scripts/migration_normalize_imitated_insect.sql` - SQL migration for new columns
- `IMITATED_INSECT_NORMALIZATION.md` - This documentation

### Modified
- `lib/types.ts` - Added new columns to `Fly` interface

## 🎯 Benefits

1. **Better Querying**: Can now query by `insect_order`, `insect_category`, etc. directly
2. **Better Performance**: No need to parse JSONB for common queries
3. **Data Integrity**: Type-safe columns instead of flexible JSONB
4. **Easier Maintenance**: Clear structure instead of nested JSONB
5. **Backward Compatible**: `imitated_insect` JSONB still exists for reference

## ⚠️ Important Notes

1. **The `imitated_insect` JSONB column is NOT removed** - It's kept for reference and backward compatibility
2. **Data is duplicated** - The same data exists in both JSONB and separate columns
3. **Future updates** - When updating fly data, update both the JSONB and the separate columns, or create a trigger to sync them

## 🔄 Next Steps

1. ✅ Run `normalizeImitatedInsectData.js` - **COMPLETE**
2. ⏳ Run SQL migration in Supabase - **PENDING**
3. ✅ Update TypeScript types - **COMPLETE**
4. 🔄 Update suggestion algorithms to use new columns (optional, for performance)
5. 🔄 Consider removing `imitated_insect` JSONB in the future (after verifying all code uses new columns)

