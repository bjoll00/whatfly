/**
 * Fishing Locations Data for Map Display
 * All 56 Utah fishing locations with coordinates and metadata
 */

export interface FishingLocation {
  id: string;
  name: string;
  type: 'river' | 'lake' | 'reservoir' | 'stream';
  coordinates: {
    longitude: number;
    latitude: number;
  };
  description: string;
  region: string;
  difficulty?: 'easy' | 'moderate' | 'difficult';
  access?: 'public' | 'walk-in' | 'boat';
  fishSpecies?: string[];
  popular?: boolean; // Mark premier/popular fishing destinations
}

export const UTAH_FISHING_LOCATIONS: FishingLocation[] = [
  // Provo River System
  {
    id: 'provo-river-upper',
    name: 'Provo River - Above Jordanelle',
    type: 'river',
    coordinates: { longitude: -111.1896, latitude: 40.6447 },
    description: 'Upper Provo River above Jordanelle Reservoir',
    region: 'Wasatch Front',
    difficulty: 'moderate',
    access: 'walk-in',
    fishSpecies: ['Brown Trout', 'Rainbow Trout']
  },
  {
    id: 'provo-river-middle',
    name: 'Provo River - Middle Provo',
    type: 'river',
    coordinates: { longitude: -111.3672, latitude: 40.5378 },
    description: 'Middle section of the Provo River',
    region: 'Wasatch Front',
    difficulty: 'easy',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout', 'Cutthroat Trout'],
    popular: true
  },
  {
    id: 'provo-river-lower',
    name: 'Provo River - Lower Provo',
    type: 'river',
    coordinates: { longitude: -111.6733, latitude: 40.2889 },
    description: 'Lower section of the Provo River',
    region: 'Wasatch Front',
    difficulty: 'easy',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout'],
    popular: true
  },
  {
    id: 'provo-river-heber',
    name: 'Provo River - Heber Valley',
    type: 'river',
    coordinates: { longitude: -111.4125, latitude: 40.5156 },
    description: 'Provo River through Heber Valley',
    region: 'Wasatch Front',
    difficulty: 'easy',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout']
  },
  
  // Weber River System
  {
    id: 'weber-river-oakley',
    name: 'Weber River - Oakley',
    type: 'river',
    coordinates: { longitude: -111.3003, latitude: 40.7136 },
    description: 'Weber River near Oakley',
    region: 'Wasatch Front',
    difficulty: 'moderate',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout']
  },
  {
    id: 'weber-river-echo',
    name: 'Weber River - Echo Canyon',
    type: 'river',
    coordinates: { longitude: -111.4267, latitude: 40.9697 },
    description: 'Weber River through Echo Canyon',
    region: 'Northern Utah',
    difficulty: 'moderate',
    access: 'walk-in',
    fishSpecies: ['Brown Trout', 'Rainbow Trout']
  },
  {
    id: 'weber-river-morgan',
    name: 'Weber River - Morgan',
    type: 'river',
    coordinates: { longitude: -111.6764, latitude: 41.0361 },
    description: 'Weber River near Morgan',
    region: 'Northern Utah',
    difficulty: 'easy',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout']
  },
  {
    id: 'weber-river-plain',
    name: 'Weber River - Plain City',
    type: 'river',
    coordinates: { longitude: -112.0861, latitude: 41.2983 },
    description: 'Lower Weber River near Plain City',
    region: 'Northern Utah',
    difficulty: 'easy',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout', 'Catfish']
  },
  
  // Green River System
  {
    id: 'green-river-dam',
    name: 'Green River - Flaming Gorge Dam',
    type: 'river',
    coordinates: { longitude: -109.4247, latitude: 40.9173 },
    description: 'World-class tailwater fishery below Flaming Gorge Dam',
    region: 'Green River Area',
    difficulty: 'moderate',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout', 'Kokanee Salmon'],
    popular: true
  },
  {
    id: 'green-river-little-hole',
    name: 'Green River - Little Hole',
    type: 'river',
    coordinates: { longitude: -109.4919, latitude: 40.8839 },
    description: 'Popular section of Green River',
    region: 'Green River Area',
    difficulty: 'moderate',
    access: 'walk-in',
    fishSpecies: ['Brown Trout', 'Rainbow Trout'],
    popular: true
  },
  {
    id: 'green-river-browns-park',
    name: 'Green River - Browns Park',
    type: 'river',
    coordinates: { longitude: -109.5708, latitude: 40.7536 },
    description: 'Remote wilderness fishing',
    region: 'Green River Area',
    difficulty: 'difficult',
    access: 'walk-in',
    fishSpecies: ['Brown Trout', 'Rainbow Trout']
  },
  {
    id: 'green-river-jensen',
    name: 'Green River - Jensen',
    type: 'river',
    coordinates: { longitude: -109.3478, latitude: 40.3658 },
    description: 'Green River near Jensen',
    region: 'Green River Area',
    difficulty: 'moderate',
    access: 'public',
    fishSpecies: ['Catfish', 'Bass', 'Rainbow Trout']
  },
  
  // Logan River System
  {
    id: 'logan-river-upper',
    name: 'Logan River - Upper Logan',
    type: 'river',
    coordinates: { longitude: -111.5344, latitude: 41.8803 },
    description: 'Upper Logan River',
    region: 'Northern Utah',
    difficulty: 'moderate',
    access: 'walk-in',
    fishSpecies: ['Cutthroat Trout', 'Brook Trout']
  },
  {
    id: 'logan-river-canyon',
    name: 'Logan River - Logan Canyon',
    type: 'river',
    coordinates: { longitude: -111.6808, latitude: 41.7739 },
    description: 'Scenic Logan Canyon section',
    region: 'Northern Utah',
    difficulty: 'easy',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout', 'Cutthroat Trout'],
    popular: true
  },
  {
    id: 'logan-river-lower',
    name: 'Logan River - Lower Logan',
    type: 'river',
    coordinates: { longitude: -111.8347, latitude: 41.7358 },
    description: 'Lower Logan River',
    region: 'Northern Utah',
    difficulty: 'easy',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout']
  },
  
  // Bear River System
  {
    id: 'bear-river-evanston',
    name: 'Bear River - Evanston Area',
    type: 'river',
    coordinates: { longitude: -110.9633, latitude: 41.2644 },
    description: 'Bear River near Evanston',
    region: 'Northern Utah',
    difficulty: 'moderate',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout', 'Cutthroat Trout']
  },
  {
    id: 'bear-river-woodruff',
    name: 'Bear River - Woodruff',
    type: 'river',
    coordinates: { longitude: -111.2142, latitude: 41.5194 },
    description: 'Bear River near Woodruff',
    region: 'Northern Utah',
    difficulty: 'moderate',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout']
  },
  {
    id: 'cutler-reservoir',
    name: 'Cutler Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -112.0217, latitude: 41.8206 },
    description: 'Large reservoir on Bear River',
    region: 'Northern Utah',
    difficulty: 'easy',
    access: 'boat',
    fishSpecies: ['Catfish', 'Bass', 'Walleye']
  },
  
  // Reservoirs - Northern Utah
  {
    id: 'deer-creek',
    name: 'Deer Creek Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -111.5358, latitude: 40.4258 },
    description: 'Popular reservoir with excellent fishing',
    region: 'Wasatch Front',
    difficulty: 'easy',
    access: 'boat',
    fishSpecies: ['Rainbow Trout', 'Perch', 'Walleye'],
    popular: true
  },
  {
    id: 'jordanelle',
    name: 'Jordanelle Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -111.4103, latitude: 40.6269 },
    description: 'Large reservoir with diverse fishing',
    region: 'Wasatch Front',
    difficulty: 'easy',
    access: 'boat',
    fishSpecies: ['Rainbow Trout', 'Perch', 'Smallmouth Bass'],
    popular: true
  },
  {
    id: 'rockport',
    name: 'Rockport Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -111.3586, latitude: 40.7075 },
    description: 'Family-friendly reservoir',
    region: 'Wasatch Front',
    difficulty: 'easy',
    access: 'boat',
    fishSpecies: ['Rainbow Trout', 'Brown Trout', 'Perch']
  },
  {
    id: 'echo',
    name: 'Echo Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -111.4181, latitude: 40.9514 },
    description: 'Scenic mountain reservoir',
    region: 'Northern Utah',
    difficulty: 'easy',
    access: 'boat',
    fishSpecies: ['Rainbow Trout', 'Brown Trout']
  },
  {
    id: 'pineview',
    name: 'Pineview Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -111.8186, latitude: 41.2522 },
    description: 'Popular Ogden area reservoir',
    region: 'Northern Utah',
    difficulty: 'easy',
    access: 'boat',
    fishSpecies: ['Rainbow Trout', 'Tiger Muskie', 'Crappie'],
    popular: true
  },
  {
    id: 'causey',
    name: 'Causey Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -111.5856, latitude: 41.2928 },
    description: 'Mountain reservoir',
    region: 'Northern Utah',
    difficulty: 'moderate',
    access: 'boat',
    fishSpecies: ['Rainbow Trout', 'Brook Trout']
  },
  {
    id: 'hyrum',
    name: 'Hyrum Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -111.8508, latitude: 41.6339 },
    description: 'State park reservoir',
    region: 'Northern Utah',
    difficulty: 'easy',
    access: 'boat',
    fishSpecies: ['Rainbow Trout', 'Largemouth Bass', 'Bluegill']
  },
  
  // Reservoirs - Central Utah
  {
    id: 'strawberry',
    name: 'Strawberry Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -111.1658, latitude: 40.1786 },
    description: 'Premier trophy trout fishing',
    region: 'Central Utah',
    difficulty: 'moderate',
    access: 'boat',
    fishSpecies: ['Cutthroat Trout', 'Rainbow Trout', 'Kokanee Salmon'],
    popular: true
  },
  {
    id: 'currant-creek',
    name: 'Currant Creek Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -111.0403, latitude: 40.2553 },
    description: 'High mountain reservoir',
    region: 'Central Utah',
    difficulty: 'moderate',
    access: 'public',
    fishSpecies: ['Cutthroat Trout', 'Rainbow Trout']
  },
  {
    id: 'scofield',
    name: 'Scofield Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -111.1578, latitude: 39.7781 },
    description: 'State park reservoir',
    region: 'Central Utah',
    difficulty: 'easy',
    access: 'boat',
    fishSpecies: ['Rainbow Trout', 'Cutthroat Trout', 'Tiger Trout'],
    popular: true
  },
  {
    id: 'huntington',
    name: 'Huntington Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -110.9642, latitude: 39.3942 },
    description: 'Mountain reservoir',
    region: 'Central Utah',
    difficulty: 'moderate',
    access: 'boat',
    fishSpecies: ['Rainbow Trout', 'Cutthroat Trout']
  },
  {
    id: 'electric-lake',
    name: 'Electric Lake',
    type: 'lake',
    coordinates: { longitude: -111.2364, latitude: 39.4928 },
    description: 'High elevation fishing',
    region: 'Central Utah',
    difficulty: 'difficult',
    access: 'walk-in',
    fishSpecies: ['Rainbow Trout', 'Cutthroat Trout']
  },
  {
    id: 'flaming-gorge',
    name: 'Flaming Gorge Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -109.4736, latitude: 40.9239 },
    description: 'Massive reservoir with trophy fish',
    region: 'Green River Area',
    difficulty: 'moderate',
    access: 'boat',
    fishSpecies: ['Lake Trout', 'Rainbow Trout', 'Kokanee Salmon', 'Smallmouth Bass'],
    popular: true
  },
  
  // Duchesne River System
  {
    id: 'duchesne-upper',
    name: 'Duchesne River - Upper',
    type: 'river',
    coordinates: { longitude: -110.5933, latitude: 40.5042 },
    description: 'Upper Duchesne River',
    region: 'Uinta Basin',
    difficulty: 'moderate',
    access: 'walk-in',
    fishSpecies: ['Brown Trout', 'Rainbow Trout']
  },
  {
    id: 'duchesne-hanna',
    name: 'Duchesne River - Hanna',
    type: 'river',
    coordinates: { longitude: -110.8178, latitude: 40.4281 },
    description: 'Duchesne River near Hanna',
    region: 'Uinta Basin',
    difficulty: 'moderate',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout']
  },
  {
    id: 'duchesne-lower',
    name: 'Duchesne River - Lower',
    type: 'river',
    coordinates: { longitude: -110.3869, latitude: 40.1619 },
    description: 'Lower Duchesne River',
    region: 'Uinta Basin',
    difficulty: 'easy',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout', 'Catfish']
  },
  
  // Southern Utah
  {
    id: 'beaver-river',
    name: 'Beaver River',
    type: 'river',
    coordinates: { longitude: -112.6411, latitude: 38.2775 },
    description: 'Southern Utah river',
    region: 'Southern Utah',
    difficulty: 'moderate',
    access: 'public',
    fishSpecies: ['Rainbow Trout', 'Brown Trout']
  },
  {
    id: 'minersville',
    name: 'Minersville Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -112.9139, latitude: 38.2192 },
    description: 'Desert reservoir',
    region: 'Southern Utah',
    difficulty: 'easy',
    access: 'boat',
    fishSpecies: ['Rainbow Trout', 'Largemouth Bass']
  },
  {
    id: 'piute',
    name: 'Piute Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -112.1194, latitude: 38.3322 },
    description: 'Mountain reservoir',
    region: 'Southern Utah',
    difficulty: 'easy',
    access: 'boat',
    fishSpecies: ['Rainbow Trout', 'Splake']
  },
  {
    id: 'otter-creek',
    name: 'Otter Creek Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -111.9861, latitude: 38.1861 },
    description: 'State park reservoir',
    region: 'Southern Utah',
    difficulty: 'easy',
    access: 'boat',
    fishSpecies: ['Rainbow Trout', 'Splake'],
    popular: true
  },
  {
    id: 'sevier-upper',
    name: 'Sevier River - Upper',
    type: 'river',
    coordinates: { longitude: -112.1772, latitude: 38.6528 },
    description: 'Upper Sevier River',
    region: 'Southern Utah',
    difficulty: 'moderate',
    access: 'public',
    fishSpecies: ['Rainbow Trout', 'Brown Trout']
  },
  {
    id: 'fish-lake',
    name: 'Fish Lake',
    type: 'lake',
    coordinates: { longitude: -111.7294, latitude: 38.5372 },
    description: 'Natural high mountain lake, famous for splake',
    region: 'Southern Utah',
    difficulty: 'easy',
    access: 'boat',
    fishSpecies: ['Splake', 'Lake Trout', 'Rainbow Trout', 'Perch'],
    popular: true
  },
  {
    id: 'johnson-valley',
    name: 'Johnson Valley Reservoir',
    type: 'reservoir',
    coordinates: { longitude: -111.7894, latitude: 38.4906 },
    description: 'Mountain reservoir',
    region: 'Southern Utah',
    difficulty: 'moderate',
    access: 'boat',
    fishSpecies: ['Rainbow Trout', 'Splake']
  },
  
  // Other Rivers
  {
    id: 'price-river',
    name: 'Price River',
    type: 'river',
    coordinates: { longitude: -110.8108, latitude: 39.5728 },
    description: 'Central Utah river',
    region: 'Central Utah',
    difficulty: 'moderate',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout']
  },
  {
    id: 'boulder-mountain',
    name: 'Boulder Mountain - Thousands Lake',
    type: 'lake',
    coordinates: { longitude: -111.4861, latitude: 38.1442 },
    description: 'High mountain lake',
    region: 'Southern Utah',
    difficulty: 'difficult',
    access: 'walk-in',
    fishSpecies: ['Brook Trout', 'Rainbow Trout']
  },
  {
    id: 'ogden-upper',
    name: 'Ogden River - Upper',
    type: 'river',
    coordinates: { longitude: -111.6631, latitude: 41.2639 },
    description: 'Upper Ogden River',
    region: 'Northern Utah',
    difficulty: 'moderate',
    access: 'walk-in',
    fishSpecies: ['Brown Trout', 'Rainbow Trout']
  },
  {
    id: 'ogden-lower',
    name: 'Ogden River - Lower',
    type: 'river',
    coordinates: { longitude: -111.9736, latitude: 41.2231 },
    description: 'Lower Ogden River',
    region: 'Northern Utah',
    difficulty: 'easy',
    access: 'public',
    fishSpecies: ['Brown Trout', 'Rainbow Trout']
  },
];

/**
 * Convert fishing locations to GeoJSON format for Mapbox
 */
export function toGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: UTAH_FISHING_LOCATIONS.map(location => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [location.coordinates.longitude, location.coordinates.latitude]
      },
      properties: {
        id: location.id,
        name: location.name,
        type: location.type,
        description: location.description,
        region: location.region,
        difficulty: location.difficulty,
        access: location.access,
        fishSpecies: location.fishSpecies?.join(', ') || '',
      }
    }))
  };
}

/**
 * Get fishing location by ID
 */
export function getFishingLocationById(id: string): FishingLocation | undefined {
  return UTAH_FISHING_LOCATIONS.find(loc => loc.id === id);
}

/**
 * Get fishing locations by type
 */
export function getFishingLocationsByType(type: 'river' | 'lake' | 'reservoir' | 'stream'): FishingLocation[] {
  return UTAH_FISHING_LOCATIONS.filter(loc => loc.type === type);
}

/**
 * Get fishing locations by region
 */
export function getFishingLocationsByRegion(region: string): FishingLocation[] {
  return UTAH_FISHING_LOCATIONS.filter(loc => loc.region === region);
}

/**
 * Get only popular/premier fishing locations (reduces map clutter)
 */
export function getPopularFishingLocations(): FishingLocation[] {
  return UTAH_FISHING_LOCATIONS.filter(loc => loc.popular === true);
}

/**
 * Get count of popular locations
 */
export function getPopularLocationCount(): number {
  return UTAH_FISHING_LOCATIONS.filter(loc => loc.popular === true).length;
}

/**
 * Get marker color based on water body type
 */
export function getMarkerColor(type: 'river' | 'lake' | 'reservoir' | 'stream'): string {
  const colors = {
    river: '#2E7BC4',
    lake: '#4CAF50',
    reservoir: '#8BC34A',
    stream: '#3B7FB8',
  };
  return colors[type] || '#2E7BC4';
}

