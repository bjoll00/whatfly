import React, { createContext, ReactNode, useContext, useState } from 'react';
import { FishingConditions } from './types';

interface FishingContextType {
  fishingConditions: Partial<FishingConditions> | null;
  setFishingConditions: (conditions: Partial<FishingConditions> | null) => void;
  clearFishingConditions: () => void;
  hasLocationData: boolean;
}

const FishingContext = createContext<FishingContextType | undefined>(undefined);

interface FishingProviderProps {
  children: ReactNode;
}

export const FishingProvider: React.FC<FishingProviderProps> = ({ children }) => {
  const [fishingConditions, setFishingConditionsState] = useState<Partial<FishingConditions> | null>(null);

  const setFishingConditions = (conditions: Partial<FishingConditions> | null) => {
    console.log('🎣 Fishing Context: Setting fishing conditions', {
      hasConditions: !!conditions,
      location: conditions?.location,
      latitude: conditions?.latitude,
      longitude: conditions?.longitude,
      hasWeatherData: !!conditions?.weather_data,
      hasWaterData: !!conditions?.water_data,
      hasHatchData: !!conditions?.hatch_data,
      hasSolunarData: !!conditions?.solunar_periods,
      timestamp: new Date().toISOString(),
      dataSources: {
        weather: conditions?.weather_data ? 'API' : 'none',
        water: conditions?.water_data ? 'USGS' : 'none',
        hatch: conditions?.hatch_data ? 'Calendar' : 'none',
        lunar: conditions?.solunar_periods ? 'LunarService' : 'none',
        location: conditions?.location ? 'MapSelection' : 'none'
      }
    });
    setFishingConditionsState(conditions);
  };

  const clearFishingConditions = () => {
    console.log('🎣 Fishing Context: Clearing fishing conditions');
    setFishingConditionsState(null);
  };

  const hasLocationData = !!(fishingConditions?.location && fishingConditions?.latitude && fishingConditions?.longitude);

  const value: FishingContextType = {
    fishingConditions,
    setFishingConditions,
    clearFishingConditions,
    hasLocationData
  };

  return (
    <FishingContext.Provider value={value}>
      {children}
    </FishingContext.Provider>
  );
};

export const useFishing = (): FishingContextType => {
  const context = useContext(FishingContext);
  if (context === undefined) {
    throw new Error('useFishing must be used within a FishingProvider');
  }
  return context;
};

// Helper hook for accessing fishing conditions with defaults
export const useFishingConditions = (): Partial<FishingConditions> => {
  const { fishingConditions } = useFishing();
  return fishingConditions || {};
};

// Helper hook for checking if we have complete location data
export const useLocationData = (): {
  hasLocation: boolean;
  hasCoordinates: boolean;
  hasCompleteData: boolean;
} => {
  const { fishingConditions } = useFishing();
  
  const hasLocation = !!(fishingConditions?.location);
  const hasCoordinates = !!(fishingConditions?.latitude && fishingConditions?.longitude);
  const hasCompleteData = hasLocation && hasCoordinates && 
    !!(fishingConditions?.weather_data || fishingConditions?.weather_conditions);

  return {
    hasLocation,
    hasCoordinates,
    hasCompleteData
  };
};
