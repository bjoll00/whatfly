import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../lib/AuthContext';

export default function Index() {
  const { loading } = useAuth();

  // Show loading while auth initializes
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd33d" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Always go to map - auth is only required for specific features
  return <Redirect href="/(tabs)/map" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});
