import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../lib/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  console.log('Index component - user:', user?.id, 'loading:', loading);
  console.log('Index component - user object:', user);

  if (loading) {
    console.log('Index: Still loading...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd33d" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Always redirect to tabs - let the tab layout handle guest vs authenticated users
  console.log('Index: Redirecting to main app');
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
