/**
 * Rebuild fly records so they align with the WeatherMarker payload and describe
 * the insect the pattern imitates.
 *
 * For each fly we derive:
 * - `ideal_conditions`: ranges and categorical matches based on existing best_conditions
 * - `imitated_insect`: entomology details (insect family, life stages, sizes, colours, hatch timing)
 * - `suggestion_profile`: default weights/requirements for the upcoming suggestion engine
 *
 * Run with: `node scripts/rebuildFliesForMap.js`
 */

try {
  require('dotenv').config();
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.warn('dotenv not installed; skipping automatic .env loading. Environment variables must be set manually.');
  } else {
    console.warn('Failed to load dotenv configuration:', error.message);
  }
}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing Supabase credentials. Please set SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in your environment.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const STREAM_FLOW_MAP = {
  still: [0, 60],
  slow: [60, 180],
  moderate: [180, 400],
  fast: [400, 800],
  raging: [800, 1600],
};

const WIND_SPEED_MAP = {
  calm: [0, 3],
  light: [3, 8],
  'light breeze': [3, 8],
  breezy: [8, 15],
  moderate: [8, 18],
  windy: [18, 25],
  strong: [18, 30],
  gusty: [20, 32],
};

const WEATHER_LABEL_MAP = {
  sunny: 'Sunny',
  clear: 'Clear',
  'partly_cloudy': 'Partly Cloudy',
  'partly cloudy': 'Partly Cloudy',
  cloudy: 'Cloudy',
  overcast: 'Overcast',
  rainy: 'Rainy',
  rain: 'Rain',
  stormy: 'Stormy',
  storm: 'Storm',
  snowy: 'Snowy',
  snow: 'Snow',
  windy: 'Windy',
  foggy: 'Foggy',
  fog: 'Fog',
  drizzle: 'Drizzle',
};

const INSECT_ORDER_MAP = {
  mayfly: 'Ephemeroptera',
  caddis: 'Trichoptera',
  stonefly: 'Plecoptera',
  midge: 'Diptera',
  terrestrial: 'Various Terrestrial Insects',
  ant: 'Formicidae',
  beetle: 'Coleoptera',
  grasshopper: 'Orthoptera',
  hopper: 'Orthoptera',
  cricket: 'Orthoptera',
  dragonfly: 'Odonata',
  damselfly: 'Odonata',
};

function titleCase(value) {
  if (!value || typeof value !== 'string') return value || '';
  return value
    .replace(/[_-]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function ensureArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') {
    // Convert plain object map into array of values
    return Object.values(value);
  }
  return [value];
}

function uniqueStrings(values, transform = (v) => v) {
  return Array.from(
    new Set(
      ensureArray(values)
        .map((item) => {
          if (!item) return null;
          return transform(String(item).trim());
        })
        .filter(Boolean),
    ),
  );
}

function toCelsius(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return parseFloat((((value - 32) * 5) / 9).toFixed(1));
}

function normalizeRange(range) {
  if (!range || typeof range.min === 'undefined' || typeof range.max === 'undefined') {
    return null;
  }
  const min = toCelsius(range.min);
  const max = toCelsius(range.max);
  if (min === null || max === null) return null;
  return { min, max };
}

function mergeCategoryRanges(values, lookup) {
  const list = uniqueStrings(values, (v) => v.toLowerCase());
  if (list.length === 0) return null;
  return list.reduce(
    (acc, key) => {
      const range = lookup[key];
      if (!range) return acc;
      const [min, max] = range;
      return {
        min: acc.min === null ? min : Math.min(acc.min, min),
        max: acc.max === null ? max : Math.max(acc.max, max),
      };
    },
    { min: null, max: null },
  );
}

function formatWeatherDescriptions(values) {
  return uniqueStrings(values, (value) => {
    const key = value.toLowerCase();
    if (WEATHER_LABEL_MAP[key]) return WEATHER_LABEL_MAP[key];
    return titleCase(key);
  });
}

function parseSizeRange(sizes, primarySize) {
  const numericSizes = uniqueStrings(sizes.concat(primarySize || []), (value) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }).filter((value) => typeof value === 'number');

  if (numericSizes.length === 0) return null;

  return {
    min: Math.min(...numericSizes),
    max: Math.max(...numericSizes),
  };
}

function deriveBehavior(type) {
  const key = String(type || '').toLowerCase();
  if (!key) return null;
  switch (key) {
    case 'dry':
      return 'Surface presentation; imitates adult insects riding the film.';
    case 'terrestrial':
      return 'Surface or just below film; imitates land-based insects that fall into the water.';
    case 'nymph':
      return 'Sub-surface drift; imitates immature aquatic insects.';
    case 'emergers':
    case 'emerger':
      return 'Film-riding emergers transitioning from nymph to adult.';
    case 'streamer':
      return 'Active retrieve; imitates baitfish or large swimming prey.';
    case 'wet':
      return 'Sub-surface swing; imitates drowned adults or emergers.';
    default:
      return null;
  }
}

function buildIdealConditions(fly) {
  const best = fly.best_conditions || {};
  const airTemp = normalizeRange(best.air_temperature_range);
  const waterTemp = normalizeRange(best.water_temperature_range);

  const streamFlowRange = mergeCategoryRanges(best.water_flow, STREAM_FLOW_MAP);
  const windSpeedRange = mergeCategoryRanges(best.wind_conditions, WIND_SPEED_MAP);

  const weatherDescription = formatWeatherDescriptions(best.weather);

  const ideal = {};
  if (airTemp) ideal.airTemp = airTemp;
  if (waterTemp) ideal.waterTemperature = waterTemp;
  if (streamFlowRange && streamFlowRange.min !== null) ideal.streamFlow = streamFlowRange;
  if (windSpeedRange && windSpeedRange.min !== null) ideal.windSpeedMph = windSpeedRange;
  if (weatherDescription.length > 0) ideal.weatherDescription = weatherDescription;

  return ideal;
}

function deriveInsectOrder(imitates) {
  if (!imitates || imitates.length === 0) return null;
  const primary = imitates[0].toLowerCase();
  return INSECT_ORDER_MAP[primary] || null;
}

function buildInsectProfile(fly) {
  const hatch = fly.hatch_matching || {};
  const imitates = uniqueStrings(hatch.insects, titleCase);
  const lifeStages = uniqueStrings(hatch.stages, titleCase);
  const suppliedSizes = uniqueStrings(hatch.sizes, String);
  const availableSizes = uniqueStrings(fly.sizes_available, String);
  const sizes = suppliedSizes.length > 0 ? suppliedSizes : availableSizes;

  const colorPalette = uniqueStrings(
    [fly.color, ...ensureArray(fly.secondary_colors)],
    titleCase,
  );

  const hatchSeasons = uniqueStrings(fly.best_conditions?.time_of_year, titleCase);
  const hatchTimes = uniqueStrings(fly.best_conditions?.time_of_day, titleCase);
  const waterPreferences = uniqueStrings(fly.best_conditions?.water_flow, titleCase);
  const weatherPreferences = uniqueStrings(fly.best_conditions?.weather, titleCase);

  const profile = {
    patternName: fly.pattern_name || fly.name,
    imitates,
    insectOrder: deriveInsectOrder(imitates),
    category: titleCase(fly.type),
    lifeStages,
    primaryStage: lifeStages[0] || null,
    sizes,
    primarySize: fly.primary_size || sizes[0] || null,
    sizeRange: parseSizeRange(sizes, fly.primary_size),
    colorPalette,
    hatchSeasons,
    hatchTimes,
    waterPreferences,
    weatherPreferences,
    behavior: deriveBehavior(fly.type),
    summary: fly.description,
  };

  return cleanObject(profile);
}

function buildSuggestionProfile(idealConditions, fly, insectProfile) {
  const type = String(fly.type || '').toLowerCase();
  const weights = {};

  if (idealConditions.airTemp) weights.airTemp = type === 'dry' || type === 'terrestrial' ? 1.1 : 0.8;
  if (idealConditions.waterTemperature)
    weights.waterTemperature = type === 'nymph' || type === 'streamer' ? 1.3 : 1.0;
  if (idealConditions.streamFlow) weights.streamFlow = type === 'streamer' ? 1.4 : 1.0;
  if (idealConditions.windSpeedMph) weights.windSpeedMph = 0.4;
  if (idealConditions.weatherDescription) weights.weatherDescription = 0.7;

  const requiredFields = [];
  if (type === 'dry' || type === 'terrestrial') requiredFields.push('airTemp');
  if (type === 'nymph' || type === 'streamer' || type === 'wet') requiredFields.push('waterTemperature');
  if (idealConditions.streamFlow) requiredFields.push('streamFlow');

  const profile = {
    matchStrategy: 'weighted',
    environmentWeights: cleanObject(weights),
    requiredFields: Array.from(new Set(requiredFields)),
    boosts: [],
    notes: insectProfile?.behavior
      ? `Autogenerated profile emphasising ${insectProfile.behavior.toLowerCase()}.`
      : 'Autogenerated profile derived from historical conditions.',
  };

  return cleanObject(profile);
}

function cleanObject(input) {
  if (Array.isArray(input)) {
    const cleanedArray = input
      .map((item) => cleanObject(item))
      .filter((item) => {
        if (item === null || item === undefined) return false;
        if (Array.isArray(item)) return item.length > 0;
        if (typeof item === 'object') return Object.keys(item).length > 0;
        return true;
      });
    return cleanedArray;
  }

  if (input && typeof input === 'object') {
    return Object.entries(input).reduce((acc, [key, value]) => {
      const cleanedValue = cleanObject(value);
      if (
        cleanedValue === null ||
        cleanedValue === undefined ||
        (Array.isArray(cleanedValue) && cleanedValue.length === 0) ||
        (typeof cleanedValue === 'object' && Object.keys(cleanedValue).length === 0)
      ) {
        return acc;
      }
      acc[key] = cleanedValue;
      return acc;
    }, {});
  }

  return input;
}

async function rebuild() {
  console.log('🎯 Rebuilding fly attributes for map and insect context...');

  const { data: flies, error } = await supabase
    .from('flies')
    .select(
      [
        'id',
        'name',
        'type',
        'pattern_name',
        'sizes_available',
        'primary_size',
        'color',
        'secondary_colors',
        'description',
        'best_conditions',
        'hatch_matching',
      ].join(','),
    );

  if (error) {
    console.error('❌ Failed to load flies:', error);
    process.exit(1);
  }

  if (!flies || flies.length === 0) {
    console.log('ℹ️ No flies found to rebuild.');
    return;
  }

  const timestamp = new Date().toISOString();

  const updates = flies.map((fly) => {
    const idealConditions = cleanObject(buildIdealConditions(fly));
    const insectProfile = buildInsectProfile(fly);
    const suggestionProfile = buildSuggestionProfile(idealConditions, fly, insectProfile);

    return cleanObject({
      id: fly.id,
      ideal_conditions: idealConditions,
      imitated_insect: insectProfile,
      suggestion_profile: suggestionProfile,
      updated_at: timestamp,
    });
  });

  const batchSize = 50;
  for (let i = 0; i < updates.length; i += batchSize) {
    const chunk = updates.slice(i, i + batchSize);
    const { error: updateError } = await supabase
      .from('flies')
      .upsert(chunk, { onConflict: 'id' });
    if (updateError) {
      console.error('❌ Failed to update fly batch:', updateError);
      process.exit(1);
    }
    console.log(`✅ Updated ${Math.min(i + batchSize, updates.length)} of ${updates.length} flies`);
  }

  console.log('🎣 Fly records refreshed with environmental and entomology profiles.');
}

rebuild().catch((err) => {
  console.error('❌ Unexpected error rebuilding fly data:', err);
  process.exit(1);
});
