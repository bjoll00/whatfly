/**
 * Enhanced River Data Structure for TroutRoutes-style Display
 * Comprehensive river information with segments, access points, and amenities
 */

export interface RiverSegment {
  id: string;
  name: string;
  description: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  riverSystem: string;
  segmentType: 'headwaters' | 'upper' | 'middle' | 'lower' | 'tailwater' | 'confluence';
  difficulty: 'easy' | 'moderate' | 'difficult' | 'expert';
  access: 'public' | 'walk-in' | 'boat' | 'private' | 'permit-required';
  fishSpecies: string[];
  bestSeasons: string[];
  waterType: 'freestone' | 'spring-fed' | 'tailwater' | 'reservoir-fed';
  averageFlow?: number; // cfs
  elevation?: number; // feet
  length?: number; // miles
  gradient?: number; // feet per mile
  width?: number; // average width in feet
  depth?: {
    min: number;
    max: number;
    average: number;
  };
  bottomComposition: 'rocky' | 'gravel' | 'sandy' | 'muddy' | 'mixed';
  vegetation: 'heavy' | 'moderate' | 'light' | 'none';
  hatches: string[];
  popular?: boolean;
  featured?: boolean;
  regulations?: {
    catchAndRelease?: boolean;
    artificialOnly?: boolean;
    specialRestrictions?: string[];
    seasonalClosures?: string[];
  };
  amenities?: {
    parking: boolean;
    restrooms: boolean;
    picnicTables: boolean;
    camping: boolean;
    boatRamp: boolean;
    wadingAccess: boolean;
    wheelchairAccessible: boolean;
  };
  nearbyServices?: {
    flyShops?: string[];
    restaurants?: string[];
    lodging?: string[];
    gasStations?: string[];
  };
  photos?: string[];
  videos?: string[];
  reviews?: {
    rating: number;
    count: number;
  };
  lastUpdated: string;
}

export interface RiverSystem {
  id: string;
  name: string;
  description: string;
  totalLength: number; // miles
  watershed: string;
  majorTributaries: string[];
  dams?: string[];
  reservoirs?: string[];
  headwaters: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  mouth: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  segments: RiverSegment[];
  region: string;
  state: string;
  popular?: boolean;
  featured?: boolean;
}

export interface AccessPoint {
  id: string;
  name: string;
  type: 'parking' | 'boat-ramp' | 'trailhead' | 'bridge' | 'campground';
  coordinates: {
    longitude: number;
    latitude: number;
  };
  riverSegmentId: string;
  description: string;
  parkingCapacity?: number;
  fees?: {
    required: boolean;
    amount?: number;
    description?: string;
  };
  restrictions?: string[];
  amenities: {
    restrooms: boolean;
    picnicTables: boolean;
    trashReceptacles: boolean;
    informationKiosk: boolean;
    wheelchairAccessible: boolean;
  };
  accessConditions: {
    roadCondition: 'paved' | 'gravel' | 'dirt' | '4wd-required';
    walkDistance?: number; // yards to river
    seasonalAccess?: boolean;
    winterAccess?: boolean;
  };
}

export interface RiverCondition {
  riverSegmentId: string;
  date: string;
  flowRate?: number; // cfs
  waterTemperature?: number; // Fahrenheit
  waterLevel?: 'low' | 'normal' | 'high' | 'flooding';
  waterClarity?: 'clear' | 'slightly_murky' | 'murky' | 'very_murky';
  weatherConditions?: string;
  recentHatches?: string[];
  fishingRating?: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
  dataSource: 'USGS' | 'NOAA' | 'UTAH_DWR' | 'USER_REPORT';
  lastUpdated: string;
}

// Major Utah River Systems with Enhanced Data
export const UTAH_RIVER_SYSTEMS: RiverSystem[] = [
  {
    id: 'provo-river-system',
    name: 'Provo River',
    description: 'One of Utah\'s most famous trout rivers, flowing from the Uinta Mountains through Heber Valley to Utah Lake.',
    totalLength: 71,
    watershed: 'Utah Lake Watershed',
    majorTributaries: ['South Fork Provo River', 'North Fork Provo River', 'Middle Fork Provo River'],
    dams: ['Jordanelle Dam', 'Deer Creek Dam'],
    reservoirs: ['Jordanelle Reservoir', 'Deer Creek Reservoir'],
    headwaters: {
      latitude: 40.6447,
      longitude: -111.1896,
      elevation: 9200
    },
    mouth: {
      latitude: 40.2889,
      longitude: -111.6733,
      elevation: 4500
    },
    region: 'Wasatch Front',
    state: 'Utah',
    popular: true,
    featured: true,
    segments: [
      {
        id: 'provo-headwaters',
        name: 'Provo River - Headwaters',
        description: 'High mountain freestone section above Jordanelle Reservoir',
        coordinates: { longitude: -111.1896, latitude: 40.6447 },
        riverSystem: 'Provo River',
        segmentType: 'headwaters',
        difficulty: 'moderate',
        access: 'walk-in',
        fishSpecies: ['Cutthroat Trout', 'Brook Trout', 'Brown Trout'],
        bestSeasons: ['summer', 'early_fall'],
        waterType: 'freestone',
        averageFlow: 45,
        elevation: 9200,
        length: 8,
        gradient: 125,
        width: 15,
        depth: { min: 1, max: 4, average: 2.5 },
        bottomComposition: 'rocky',
        vegetation: 'light',
        hatches: ['Blue Winged Olive', 'Pale Morning Dun', 'Caddis'],
        regulations: {
          catchAndRelease: false,
          artificialOnly: false,
          specialRestrictions: ['Check current regulations'],
        },
        amenities: {
          parking: true,
          restrooms: false,
          picnicTables: false,
          camping: true,
          boatRamp: false,
          wadingAccess: true,
          wheelchairAccessible: false,
        },
        lastUpdated: '2024-01-15',
      },
      {
        id: 'provo-upper-jordanelle',
        name: 'Provo River - Above Jordanelle',
        description: 'Scenic section through mountain meadows',
        coordinates: { longitude: -111.3125, latitude: 40.5894 },
        riverSystem: 'Provo River',
        segmentType: 'upper',
        difficulty: 'easy',
        access: 'public',
        fishSpecies: ['Brown Trout', 'Rainbow Trout', 'Cutthroat Trout'],
        bestSeasons: ['spring', 'summer', 'early_fall'],
        waterType: 'freestone',
        averageFlow: 65,
        elevation: 7500,
        length: 12,
        gradient: 85,
        width: 25,
        depth: { min: 2, max: 6, average: 3.5 },
        bottomComposition: 'gravel',
        vegetation: 'moderate',
        hatches: ['Blue Winged Olive', 'Pale Morning Dun', 'Caddis', 'Stoneflies'],
        popular: true,
        regulations: {
          catchAndRelease: false,
          artificialOnly: false,
        },
        amenities: {
          parking: true,
          restrooms: true,
          picnicTables: true,
          camping: false,
          boatRamp: false,
          wadingAccess: true,
          wheelchairAccessible: true,
        },
        lastUpdated: '2024-01-15',
      },
      {
        id: 'provo-middle',
        name: 'Provo River - Middle Provo',
        description: 'Popular section through Heber Valley with excellent access',
        coordinates: { longitude: -111.3672, latitude: 40.5378 },
        riverSystem: 'Provo River',
        segmentType: 'middle',
        difficulty: 'easy',
        access: 'public',
        fishSpecies: ['Brown Trout', 'Rainbow Trout', 'Cutthroat Trout'],
        bestSeasons: ['spring', 'summer', 'fall'],
        waterType: 'freestone',
        averageFlow: 85,
        elevation: 5500,
        length: 15,
        gradient: 45,
        width: 35,
        depth: { min: 3, max: 8, average: 5 },
        bottomComposition: 'mixed',
        vegetation: 'moderate',
        hatches: ['Blue Winged Olive', 'Pale Morning Dun', 'Caddis', 'Stoneflies', 'Mayflies'],
        popular: true,
        featured: true,
        regulations: {
          catchAndRelease: false,
          artificialOnly: false,
        },
        amenities: {
          parking: true,
          restrooms: true,
          picnicTables: true,
          camping: false,
          boatRamp: false,
          wadingAccess: true,
          wheelchairAccessible: true,
        },
        nearbyServices: {
          flyShops: ['Fish Tech Outfitters', 'Western Rivers Flyfisher'],
          restaurants: ['Back 40 Ranch House', 'Spin Cafe'],
          lodging: ['Zermatt Resort', 'Homestead Resort'],
        },
        lastUpdated: '2024-01-15',
      },
      {
        id: 'provo-lower',
        name: 'Provo River - Lower Provo',
        description: 'Tailwater section below Deer Creek Dam',
        coordinates: { longitude: -111.6733, latitude: 40.2889 },
        riverSystem: 'Provo River',
        segmentType: 'tailwater',
        difficulty: 'moderate',
        access: 'public',
        fishSpecies: ['Brown Trout', 'Rainbow Trout'],
        bestSeasons: ['spring', 'summer', 'fall', 'winter'],
        waterType: 'tailwater',
        averageFlow: 120,
        elevation: 4500,
        length: 18,
        gradient: 25,
        width: 40,
        depth: { min: 4, max: 12, average: 7 },
        bottomComposition: 'gravel',
        vegetation: 'light',
        hatches: ['Blue Winged Olive', 'Pale Morning Dun', 'Caddis', 'Midges'],
        popular: true,
        featured: true,
        regulations: {
          catchAndRelease: false,
          artificialOnly: false,
        },
        amenities: {
          parking: true,
          restrooms: true,
          picnicTables: true,
          camping: false,
          boatRamp: true,
          wadingAccess: true,
          wheelchairAccessible: true,
        },
        nearbyServices: {
          flyShops: ['Fish Tech Outfitters'],
          restaurants: ['Chick-fil-A', 'Subway'],
        },
        lastUpdated: '2024-01-15',
      }
    ]
  },
  {
    id: 'green-river-system',
    name: 'Green River',
    description: 'World-class tailwater fishery below Flaming Gorge Dam, famous for large trout and consistent fishing.',
    totalLength: 730,
    watershed: 'Colorado River Basin',
    majorTributaries: ['Yampa River', 'White River', 'Duchesne River'],
    dams: ['Flaming Gorge Dam'],
    reservoirs: ['Flaming Gorge Reservoir'],
    headwaters: {
      latitude: 43.0186,
      longitude: -109.4364,
      elevation: 12800
    },
    mouth: {
      latitude: 38.1858,
      longitude: -109.3464,
      elevation: 4100
    },
    region: 'Green River Area',
    state: 'Utah',
    popular: true,
    featured: true,
    segments: [
      {
        id: 'green-flaming-gorge',
        name: 'Green River - Flaming Gorge Dam',
        description: 'World-class tailwater fishery below Flaming Gorge Dam',
        coordinates: { longitude: -109.4247, latitude: 40.9173 },
        riverSystem: 'Green River',
        segmentType: 'tailwater',
        difficulty: 'moderate',
        access: 'public',
        fishSpecies: ['Brown Trout', 'Rainbow Trout', 'Kokanee Salmon'],
        bestSeasons: ['spring', 'summer', 'fall', 'winter'],
        waterType: 'tailwater',
        averageFlow: 800,
        elevation: 6100,
        length: 25,
        gradient: 8,
        width: 80,
        depth: { min: 6, max: 20, average: 12 },
        bottomComposition: 'rocky',
        vegetation: 'light',
        hatches: ['Blue Winged Olive', 'Pale Morning Dun', 'Caddis', 'Midges', 'Stoneflies'],
        popular: true,
        featured: true,
        regulations: {
          catchAndRelease: false,
          artificialOnly: false,
        },
        amenities: {
          parking: true,
          restrooms: true,
          picnicTables: true,
          camping: true,
          boatRamp: true,
          wadingAccess: true,
          wheelchairAccessible: true,
        },
        nearbyServices: {
          flyShops: ['Trout Creek Flies', 'Green River Outfitters'],
          restaurants: ['Buckboard Marina Restaurant'],
          lodging: ['Flaming Gorge Lodge', 'Buckboard Marina'],
        },
        lastUpdated: '2024-01-15',
      },
      {
        id: 'green-little-hole',
        name: 'Green River - Little Hole',
        description: 'Popular section with excellent wade fishing',
        coordinates: { longitude: -109.4919, latitude: 40.8839 },
        riverSystem: 'Green River',
        segmentType: 'tailwater',
        difficulty: 'moderate',
        access: 'walk-in',
        fishSpecies: ['Brown Trout', 'Rainbow Trout'],
        bestSeasons: ['spring', 'summer', 'fall', 'winter'],
        waterType: 'tailwater',
        averageFlow: 850,
        elevation: 6000,
        length: 8,
        gradient: 12,
        width: 75,
        depth: { min: 4, max: 15, average: 9 },
        bottomComposition: 'rocky',
        vegetation: 'light',
        hatches: ['Blue Winged Olive', 'Pale Morning Dun', 'Caddis', 'Midges'],
        popular: true,
        regulations: {
          catchAndRelease: false,
          artificialOnly: false,
        },
        amenities: {
          parking: true,
          restrooms: true,
          picnicTables: true,
          camping: false,
          boatRamp: false,
          wadingAccess: true,
          wheelchairAccessible: true,
        },
        lastUpdated: '2024-01-15',
      }
    ]
  },
  {
    id: 'weber-river-system',
    name: 'Weber River',
    description: 'Diverse river system flowing from the Uinta Mountains through Ogden Valley to the Great Salt Lake.',
    totalLength: 125,
    watershed: 'Great Salt Lake Basin',
    majorTributaries: ['East Fork Weber River', 'South Fork Weber River'],
    dams: ['Echo Dam', 'Lost Creek Dam'],
    reservoirs: ['Echo Reservoir', 'Lost Creek Reservoir'],
    headwaters: {
      latitude: 40.7136,
      longitude: -111.3003,
      elevation: 9500
    },
    mouth: {
      latitude: 41.2983,
      longitude: -112.0861,
      elevation: 4200
    },
    region: 'Northern Utah',
    state: 'Utah',
    popular: true,
    segments: [
      {
        id: 'weber-oakley',
        name: 'Weber River - Oakley',
        description: 'High mountain section with native trout',
        coordinates: { longitude: -111.3003, latitude: 40.7136 },
        riverSystem: 'Weber River',
        segmentType: 'upper',
        difficulty: 'moderate',
        access: 'public',
        fishSpecies: ['Brown Trout', 'Rainbow Trout', 'Cutthroat Trout'],
        bestSeasons: ['summer', 'early_fall'],
        waterType: 'freestone',
        averageFlow: 55,
        elevation: 6500,
        length: 12,
        gradient: 95,
        width: 20,
        depth: { min: 2, max: 5, average: 3 },
        bottomComposition: 'rocky',
        vegetation: 'moderate',
        hatches: ['Blue Winged Olive', 'Caddis', 'Stoneflies'],
        regulations: {
          catchAndRelease: false,
          artificialOnly: false,
        },
        amenities: {
          parking: true,
          restrooms: false,
          picnicTables: false,
          camping: true,
          boatRamp: false,
          wadingAccess: true,
          wheelchairAccessible: false,
        },
        lastUpdated: '2024-01-15',
      },
      {
        id: 'weber-morgan',
        name: 'Weber River - Morgan',
        description: 'Accessible section through agricultural valley',
        coordinates: { longitude: -111.6764, latitude: 41.0361 },
        riverSystem: 'Weber River',
        segmentType: 'middle',
        difficulty: 'easy',
        access: 'public',
        fishSpecies: ['Brown Trout', 'Rainbow Trout'],
        bestSeasons: ['spring', 'summer', 'fall'],
        waterType: 'freestone',
        averageFlow: 75,
        elevation: 5000,
        length: 15,
        gradient: 35,
        width: 30,
        depth: { min: 3, max: 7, average: 4.5 },
        bottomComposition: 'mixed',
        vegetation: 'moderate',
        hatches: ['Blue Winged Olive', 'Pale Morning Dun', 'Caddis'],
        regulations: {
          catchAndRelease: false,
          artificialOnly: false,
        },
        amenities: {
          parking: true,
          restrooms: false,
          picnicTables: false,
          camping: false,
          boatRamp: false,
          wadingAccess: true,
          wheelchairAccessible: true,
        },
        lastUpdated: '2024-01-15',
      }
    ]
  }
];

// Access Points for Major River Segments
export const RIVER_ACCESS_POINTS: AccessPoint[] = [
  // Provo River Access Points
  {
    id: 'provo-headwaters-parking',
    name: 'Soapstone Basin Trailhead',
    type: 'trailhead',
    coordinates: { longitude: -111.1896, latitude: 40.6447 },
    riverSegmentId: 'provo-headwaters',
    description: 'Primary access to Provo River headwaters',
    parkingCapacity: 20,
    fees: { required: false },
    amenities: {
      restrooms: false,
      picnicTables: false,
      trashReceptacles: true,
      informationKiosk: true,
      wheelchairAccessible: false,
    },
    accessConditions: {
      roadCondition: 'gravel',
      walkDistance: 200,
      seasonalAccess: true,
      winterAccess: false,
    },
  },
  {
    id: 'provo-middle-parking',
    name: 'River Road Access',
    type: 'parking',
    coordinates: { longitude: -111.3672, latitude: 40.5378 },
    riverSegmentId: 'provo-middle',
    description: 'Main access point for middle Provo River',
    parkingCapacity: 50,
    fees: { required: false },
    amenities: {
      restrooms: true,
      picnicTables: true,
      trashReceptacles: true,
      informationKiosk: true,
      wheelchairAccessible: true,
    },
    accessConditions: {
      roadCondition: 'paved',
      walkDistance: 50,
      seasonalAccess: false,
      winterAccess: true,
    },
  },
  // Green River Access Points
  {
    id: 'green-dam-boat-ramp',
    name: 'Flaming Gorge Dam Boat Ramp',
    type: 'boat-ramp',
    coordinates: { longitude: -109.4247, latitude: 40.9173 },
    riverSegmentId: 'green-flaming-gorge',
    description: 'Primary boat launch below Flaming Gorge Dam',
    parkingCapacity: 100,
    fees: { required: true, amount: 15, description: 'Day use fee' },
    amenities: {
      restrooms: true,
      picnicTables: true,
      trashReceptacles: true,
      informationKiosk: true,
      wheelchairAccessible: true,
    },
    accessConditions: {
      roadCondition: 'paved',
      walkDistance: 10,
      seasonalAccess: false,
      winterAccess: true,
    },
  },
  {
    id: 'green-little-hole-parking',
    name: 'Little Hole Trailhead',
    type: 'trailhead',
    coordinates: { longitude: -109.4919, latitude: 40.8839 },
    riverSegmentId: 'green-little-hole',
    description: 'Access to Little Hole section of Green River',
    parkingCapacity: 75,
    fees: { required: true, amount: 15, description: 'Day use fee' },
    amenities: {
      restrooms: true,
      picnicTables: true,
      trashReceptacles: true,
      informationKiosk: true,
      wheelchairAccessible: true,
    },
    accessConditions: {
      roadCondition: 'paved',
      walkDistance: 25,
      seasonalAccess: false,
      winterAccess: true,
    },
  }
];

// Current River Conditions (would be updated regularly)
export const CURRENT_RIVER_CONDITIONS: RiverCondition[] = [
  {
    riverSegmentId: 'provo-middle',
    date: '2024-01-15',
    flowRate: 85,
    waterTemperature: 42,
    waterLevel: 'normal',
    waterClarity: 'clear',
    weatherConditions: 'partly cloudy',
    recentHatches: ['Blue Winged Olive', 'Midges'],
    fishingRating: 'good',
    notes: 'Good winter fishing with midges and BWO patterns',
    dataSource: 'USGS',
    lastUpdated: '2024-01-15T10:00:00Z',
  },
  {
    riverSegmentId: 'green-flaming-gorge',
    date: '2024-01-15',
    flowRate: 800,
    waterTemperature: 45,
    waterLevel: 'normal',
    waterClarity: 'clear',
    weatherConditions: 'sunny',
    recentHatches: ['Midges', 'Blue Winged Olive'],
    fishingRating: 'excellent',
    notes: 'Excellent winter fishing, large fish active',
    dataSource: 'USGS',
    lastUpdated: '2024-01-15T10:00:00Z',
  }
];

// Utility Functions
export function getRiverSystemById(id: string): RiverSystem | undefined {
  return UTAH_RIVER_SYSTEMS.find(system => system.id === id);
}

export function getRiverSegmentById(id: string): RiverSegment | undefined {
  for (const system of UTAH_RIVER_SYSTEMS) {
    const segment = system.segments.find(seg => seg.id === id);
    if (segment) return segment;
  }
  return undefined;
}

export function getRiverSegmentsBySystem(systemId: string): RiverSegment[] {
  const system = getRiverSystemById(systemId);
  return system?.segments || [];
}

export function getAccessPointsBySegment(segmentId: string): AccessPoint[] {
  return RIVER_ACCESS_POINTS.filter(point => point.riverSegmentId === segmentId);
}

export function getCurrentConditions(segmentId: string): RiverCondition | undefined {
  return CURRENT_RIVER_CONDITIONS.find(condition => condition.riverSegmentId === segmentId);
}

export function getFeaturedRiverSystems(): RiverSystem[] {
  return UTAH_RIVER_SYSTEMS.filter(system => system.featured);
}

export function getPopularRiverSegments(): RiverSegment[] {
  const segments: RiverSegment[] = [];
  for (const system of UTAH_RIVER_SYSTEMS) {
    segments.push(...system.segments.filter(segment => segment.popular));
  }
  return segments;
}

export function searchRiverSegments(query: string): RiverSegment[] {
  const results: RiverSegment[] = [];
  const searchTerm = query.toLowerCase();
  
  for (const system of UTAH_RIVER_SYSTEMS) {
    for (const segment of system.segments) {
      if (
        segment.name.toLowerCase().includes(searchTerm) ||
        segment.description.toLowerCase().includes(searchTerm) ||
        segment.riverSystem.toLowerCase().includes(searchTerm) ||
        segment.fishSpecies.some(species => species.toLowerCase().includes(searchTerm))
      ) {
        results.push(segment);
      }
    }
  }
  
  return results;
}

export function getRiverSegmentsByDifficulty(difficulty: 'easy' | 'moderate' | 'difficult' | 'expert'): RiverSegment[] {
  const segments: RiverSegment[] = [];
  for (const system of UTAH_RIVER_SYSTEMS) {
    segments.push(...system.segments.filter(segment => segment.difficulty === difficulty));
  }
  return segments;
}

export function getRiverSegmentsByFishSpecies(species: string): RiverSegment[] {
  const segments: RiverSegment[] = [];
  for (const system of UTAH_RIVER_SYSTEMS) {
    segments.push(...system.segments.filter(segment => 
      segment.fishSpecies.some(fish => fish.toLowerCase().includes(species.toLowerCase()))
    ));
  }
  return segments;
}

// Convert to GeoJSON for map display
export function riverSegmentsToGeoJSON() {
  const features: any[] = [];
  
  for (const system of UTAH_RIVER_SYSTEMS) {
    for (const segment of system.segments) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [segment.coordinates.longitude, segment.coordinates.latitude]
        },
        properties: {
          id: segment.id,
          name: segment.name,
          riverSystem: segment.riverSystem,
          segmentType: segment.segmentType,
          difficulty: segment.difficulty,
          access: segment.access,
          fishSpecies: segment.fishSpecies.join(', '),
          waterType: segment.waterType,
          popular: segment.popular,
          featured: segment.featured,
          description: segment.description,
          bestSeasons: segment.bestSeasons.join(', '),
          averageFlow: segment.averageFlow,
          elevation: segment.elevation,
          length: segment.length,
          gradient: segment.gradient,
          width: segment.width,
          depth: segment.depth ? `${segment.depth.min}-${segment.depth.max} ft` : undefined,
          bottomComposition: segment.bottomComposition,
          vegetation: segment.vegetation,
          hatches: segment.hatches.join(', '),
          regulations: segment.regulations,
          amenities: segment.amenities,
          nearbyServices: segment.nearbyServices,
          reviews: segment.reviews,
          lastUpdated: segment.lastUpdated
        }
      });
    }
  }
  
  return {
    type: 'FeatureCollection',
    features
  };
}
