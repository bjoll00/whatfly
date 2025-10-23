/**
 * Dam Locations - Single data points near major Utah dams for fly fishing
 * These points represent the best fishing locations near reservoir exits
 */

export interface DamLocation {
  id: string;
  name: string;
  riverSystem: string;
  reservoir: string;
  damType: 'tailwater' | 'freestone' | 'headwaters';
  coordinates: {
    longitude: number;
    latitude: number;
  };
  // USGS station information for accurate water data
  usgsStation?: {
    siteCode: string;
    stationName: string;
    distance: number; // miles from dam
  };
  properties: {
    difficulty: 'easy' | 'moderate' | 'hard';
    access: 'easy' | 'moderate' | 'difficult';
    fishSpecies: string[];
    popular?: boolean;
    featured?: boolean;
    bestSeasons: string[];
    typicalHatches: string[];
    waterType: 'tailwater' | 'freestone';
    description: string;
  };
}

// Major Utah dam fishing locations
export const DAM_LOCATIONS: DamLocation[] = [
  {
    id: 'jordanelle-dam',
    name: 'Jordanelle Dam - Provo River Tailwater',
    riverSystem: 'Provo River',
    reservoir: 'Jordanelle',
    damType: 'tailwater',
    coordinates: {
      longitude: -111.4639,
      latitude: 40.6161
    },
    usgsStation: {
      siteCode: '10171000', // Provo River near Charleston, UT
      stationName: 'Provo River near Charleston',
      distance: 2.5
    },
    properties: {
      difficulty: 'easy',
      access: 'easy',
      fishSpecies: ['Brown Trout', 'Rainbow Trout', 'Cutthroat Trout'],
      popular: true,
      featured: true,
      bestSeasons: ['spring', 'summer', 'fall', 'winter'],
      typicalHatches: ['Blue Winged Olive', 'Pale Morning Dun', 'Caddis', 'Midges'],
      waterType: 'tailwater',
      description: 'Excellent tailwater fishing below Jordanelle Dam with consistent flows and cold water year-round.'
    }
  },
  {
    id: 'deer-creek-dam',
    name: 'Deer Creek Dam - Provo River Tailwater',
    riverSystem: 'Provo River',
    reservoir: 'Deer Creek',
    damType: 'tailwater',
    coordinates: {
      longitude: -111.5000,
      latitude: 40.4167
    },
    usgsStation: {
      siteCode: '10171000', // Provo River near Charleston, UT (same station for both Provo sections)
      stationName: 'Provo River near Charleston',
      distance: 8.2
    },
    properties: {
      difficulty: 'moderate',
      access: 'moderate',
      fishSpecies: ['Brown Trout', 'Rainbow Trout'],
      popular: true,
      featured: false,
      bestSeasons: ['spring', 'summer', 'fall'],
      typicalHatches: ['Blue Winged Olive', 'Pale Morning Dun', 'Caddis', 'Stoneflies'],
      waterType: 'tailwater',
      description: 'Productive tailwater with good access and consistent fishing opportunities.'
    }
  },
  {
    id: 'flaming-gorge-dam',
    name: 'Flaming Gorge Dam - Green River Tailwater',
    riverSystem: 'Green River',
    reservoir: 'Flaming Gorge',
    damType: 'tailwater',
    coordinates: {
      longitude: -109.8000,
      latitude: 40.9167
    },
    usgsStation: {
      siteCode: '09261000', // Green River near Jensen, UT
      stationName: 'Green River near Jensen',
      distance: 15.8
    },
    properties: {
      difficulty: 'easy',
      access: 'easy',
      fishSpecies: ['Rainbow Trout', 'Brown Trout', 'Cutthroat Trout'],
      popular: true,
      featured: true,
      bestSeasons: ['spring', 'summer', 'fall', 'winter'],
      typicalHatches: ['Blue Winged Olive', 'Pale Morning Dun', 'Caddis', 'Midges', 'Stoneflies'],
      waterType: 'tailwater',
      description: 'World-class tailwater fishing with trophy trout and excellent access.'
    }
  },
  {
    id: 'echo-dam',
    name: 'Echo Dam - Weber River Tailwater',
    riverSystem: 'Weber River',
    reservoir: 'Echo',
    damType: 'tailwater',
    coordinates: {
      longitude: -111.4000,
      latitude: 40.9833
    },
    usgsStation: {
      siteCode: '10126000', // Weber River near Oakley, UT
      stationName: 'Weber River near Oakley',
      distance: 12.3
    },
    properties: {
      difficulty: 'easy',
      access: 'easy',
      fishSpecies: ['Brown Trout', 'Rainbow Trout'],
      popular: true,
      featured: false,
      bestSeasons: ['spring', 'summer', 'fall'],
      typicalHatches: ['Blue Winged Olive', 'Caddis', 'Midges'],
      waterType: 'tailwater',
      description: 'Consistent tailwater fishing with easy access and good trout populations.'
    }
  },
  {
    id: 'strawberry-dam',
    name: 'Strawberry Dam - Strawberry River Tailwater',
    riverSystem: 'Strawberry River',
    reservoir: 'Strawberry',
    damType: 'tailwater',
    coordinates: {
      longitude: -111.2000,
      latitude: 40.1833
    },
    properties: {
      difficulty: 'moderate',
      access: 'moderate',
      fishSpecies: ['Cutthroat Trout', 'Rainbow Trout', 'Brown Trout'],
      popular: true,
      featured: true,
      bestSeasons: ['spring', 'summer', 'fall'],
      typicalHatches: ['Blue Winged Olive', 'Pale Morning Dun', 'Caddis', 'Stoneflies'],
      waterType: 'tailwater',
      description: 'High-quality tailwater fishing with native cutthroat trout and excellent scenery.'
    }
  },
  {
    id: 'bear-lake-dam',
    name: 'Bear Lake Dam - Bear River Tailwater',
    riverSystem: 'Bear River',
    reservoir: 'Bear Lake',
    damType: 'tailwater',
    coordinates: {
      longitude: -111.3167,
      latitude: 41.9500
    },
    properties: {
      difficulty: 'moderate',
      access: 'moderate',
      fishSpecies: ['Cutthroat Trout', 'Rainbow Trout'],
      popular: false,
      featured: false,
      bestSeasons: ['spring', 'summer', 'fall'],
      typicalHatches: ['Blue Winged Olive', 'Caddis', 'Midges'],
      waterType: 'tailwater',
      description: 'Remote tailwater fishing with native cutthroat trout in a beautiful setting.'
    }
  }
];

// Utility functions
export function getDamLocationById(id: string): DamLocation | undefined {
  return DAM_LOCATIONS.find(dam => dam.id === id);
}

export function getDamLocationsBySystem(riverSystem: string): DamLocation[] {
  return DAM_LOCATIONS.filter(dam => dam.riverSystem === riverSystem);
}

export function getFeaturedDamLocations(): DamLocation[] {
  return DAM_LOCATIONS.filter(dam => dam.properties.featured);
}

export function getPopularDamLocations(): DamLocation[] {
  return DAM_LOCATIONS.filter(dam => dam.properties.popular);
}

// Convert to GeoJSON for map rendering
export function damLocationsToGeoJSON(): any {
  return {
    type: 'FeatureCollection',
    features: DAM_LOCATIONS.map(dam => ({
      type: 'Feature',
      properties: {
        id: dam.id,
        name: dam.name,
        riverSystem: dam.riverSystem,
        reservoir: dam.reservoir,
        damType: dam.damType,
        difficulty: dam.properties.difficulty,
        access: dam.properties.access,
        fishSpecies: dam.properties.fishSpecies,
        popular: dam.properties.popular,
        featured: dam.properties.featured,
        bestSeasons: dam.properties.bestSeasons,
        typicalHatches: dam.properties.typicalHatches,
        waterType: dam.properties.waterType,
        description: dam.properties.description
      },
      geometry: {
        type: 'Point',
        coordinates: [dam.coordinates.longitude, dam.coordinates.latitude]
      }
    }))
  };
}
