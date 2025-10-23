/**
 * Reservoir-Based River Paths - Accurate coordinates starting from reservoir exits/entries
 * These paths follow actual river courses from major Utah reservoirs
 */

export interface ReservoirRiverPath {
  id: string;
  name: string;
  riverSystem: string;
  segmentType: 'tailwater' | 'freestone' | 'headwaters';
  reservoirEntry?: [number, number]; // [longitude, latitude] - where river enters reservoir
  reservoirExit?: [number, number];  // [longitude, latitude] - where river exits reservoir
  coordinates: [number, number][]; // River path coordinates
  properties: {
    difficulty: string;
    access: string;
    fishSpecies: string[];
    popular?: boolean;
    featured?: boolean;
    reservoir?: string;
  };
}

// Provo River paths based on actual reservoir locations
export const RESERVOIR_BASED_RIVER_PATHS: ReservoirRiverPath[] = [
  {
    id: 'provo-jordanelle-exit',
    name: 'Provo River - Jordanelle Tailwater',
    riverSystem: 'Provo River',
    segmentType: 'tailwater',
    reservoirExit: [-111.4639, 40.6161], // Jordanelle Reservoir exit
    coordinates: [
      [-111.4639, 40.6161], // Jordanelle Reservoir exit
      [-111.4650, 40.6145], // Follows Provo River downstream
      [-111.4665, 40.6128], // River curves through valley
      [-111.4680, 40.6110], // Continues south
      [-111.4695, 40.6092], // Approaching Deer Creek
      [-111.4710, 40.6075], // Near Deer Creek Reservoir
      [-111.4725, 40.6058], // Deer Creek Reservoir entry
    ],
    properties: {
      difficulty: 'easy',
      access: 'easy',
      fishSpecies: ['Brown Trout', 'Rainbow Trout', 'Cutthroat Trout'],
      popular: true,
      featured: true,
      reservoir: 'Jordanelle'
    }
  },
  {
    id: 'provo-deer-creek-exit',
    name: 'Provo River - Deer Creek Tailwater',
    riverSystem: 'Provo River',
    segmentType: 'tailwater',
    reservoirExit: [-111.5000, 40.4167], // Deer Creek Reservoir exit
    coordinates: [
      [-111.5000, 40.4167], // Deer Creek Reservoir exit
      [-111.5015, 40.4145], // Flows through Provo Canyon
      [-111.5030, 40.4122], // Canyon section
      [-111.5045, 40.4100], // Continues through canyon
      [-111.5060, 40.4078], // Approaching Utah Lake
      [-111.5075, 40.4055], // Near Utah Lake entry
      [-111.5090, 40.4032], // Utah Lake entry point
    ],
    properties: {
      difficulty: 'moderate',
      access: 'moderate',
      fishSpecies: ['Brown Trout', 'Rainbow Trout'],
      popular: true,
      reservoir: 'Deer Creek'
    }
  },
  {
    id: 'green-flaming-gorge-exit',
    name: 'Green River - Flaming Gorge Tailwater',
    riverSystem: 'Green River',
    segmentType: 'tailwater',
    reservoirExit: [-109.8000, 40.9167], // Flaming Gorge Dam exit
    coordinates: [
      [-109.8000, 40.9167], // Flaming Gorge Dam exit
      [-109.8020, 40.9145], // Flows through canyon
      [-109.8040, 40.9122], // Canyon section
      [-109.8060, 40.9100], // Continues downstream
      [-109.8080, 40.9078], // Flows south
      [-109.8100, 40.9055], // Approaching confluence
      [-109.8120, 40.9032], // Near Colorado River confluence
    ],
    properties: {
      difficulty: 'easy',
      access: 'easy',
      fishSpecies: ['Rainbow Trout', 'Brown Trout', 'Cutthroat Trout'],
      popular: true,
      featured: true,
      reservoir: 'Flaming Gorge'
    }
  },
  {
    id: 'weber-echo-exit',
    name: 'Weber River - Echo Reservoir Tailwater',
    riverSystem: 'Weber River',
    segmentType: 'tailwater',
    reservoirExit: [-111.4000, 40.9833], // Echo Reservoir exit
    coordinates: [
      [-111.4000, 40.9833], // Echo Reservoir exit
      [-111.4015, 40.9815], // Flows through valley
      [-111.4030, 40.9797], // River curves
      [-111.4045, 40.9778], // Continues west
      [-111.4060, 40.9760], // Flows toward Great Salt Lake
      [-111.4075, 40.9742], // Approaching Great Salt Lake
      [-111.4090, 40.9724], // Great Salt Lake entry
    ],
    properties: {
      difficulty: 'easy',
      access: 'easy',
      fishSpecies: ['Brown Trout', 'Rainbow Trout'],
      popular: true,
      reservoir: 'Echo'
    }
  }
];

// Utility functions
export function getReservoirPathById(id: string): ReservoirRiverPath | undefined {
  return RESERVOIR_BASED_RIVER_PATHS.find(path => path.id === id);
}

export function getReservoirPathsBySystem(riverSystem: string): ReservoirRiverPath[] {
  return RESERVOIR_BASED_RIVER_PATHS.filter(path => path.riverSystem === riverSystem);
}

export function reservoirPathsToGeoJSON(): any {
  return {
    type: 'FeatureCollection',
    features: RESERVOIR_BASED_RIVER_PATHS.map(path => ({
      type: 'Feature',
      properties: {
        id: path.id,
        name: path.name,
        riverSystem: path.riverSystem,
        segmentType: path.segmentType,
        difficulty: path.properties.difficulty,
        access: path.properties.access,
        fishSpecies: path.properties.fishSpecies,
        popular: path.properties.popular,
        featured: path.properties.featured,
        reservoir: path.properties.reservoir
      },
      geometry: {
        type: 'LineString',
        coordinates: path.coordinates
      }
    }))
  };
}
