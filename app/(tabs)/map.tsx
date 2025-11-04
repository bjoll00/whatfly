import React from 'react';
import { StyleSheet, View } from 'react-native';
import FishingMap from '../../components/FishingMap';

export default function MapScreen() {
  const handleLocationSelect = (coordinates: { latitude: number; longitude: number }) => {
    console.log('Location selected:', coordinates);
  };

  return (
    <View style={styles.container}>
      <FishingMap onLocationSelect={handleLocationSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
});
