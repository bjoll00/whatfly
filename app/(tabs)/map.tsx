import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    View,
} from 'react-native';
import FishingMap from '../../components/FishingMap';
import { Coordinates, RiverLocation } from '../../lib/locationService';

export default function MapScreen() {
  const [, setSelectedLocation] = useState<RiverLocation | null>(null);
  const [, setRecommendedFlies] = useState<any[]>([]);

  const handleLocationSelect = (coordinates: Coordinates, location: RiverLocation | null) => {
    console.log('Location selected:', coordinates, location);
    setSelectedLocation(location);
  };

  const handleFliesRecommended = (flies: any[]) => {
    console.log('Flies recommended:', flies);
    setRecommendedFlies(flies);
    
    if (flies.length > 0) {
      Alert.alert(
        'Flies Recommended!',
        `Found ${flies.length} recommended flies for this location. Check the details modal for more information.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <FishingMap
        onLocationSelect={handleLocationSelect}
        onFliesRecommended={handleFliesRecommended}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
});
