import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/AuthContext';

export default function DebugScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      console.log('Debug: Starting sign out...');
      await signOut();
      console.log('Debug: Sign out completed');
    } catch (error) {
      console.error('Debug: Sign out error:', error);
      Alert.alert('Error', 'Sign out failed');
    }
  };

  const checkSession = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const { SUPABASE_CONFIG } = await import('../lib/config');
      
      const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('Debug: Session check:', { session: session?.user?.id, error });
      Alert.alert('Session Check', `User: ${session?.user?.id || 'None'}\nError: ${error?.message || 'None'}`);
    } catch (error) {
      console.error('Debug: Session check error:', error);
      Alert.alert('Error', 'Session check failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Screen</Text>
      <Text style={styles.text}>User ID: {user?.id || 'Not logged in'}</Text>
      <Text style={styles.text}>Email: {user?.email || 'Not logged in'}</Text>
      
      <TouchableOpacity style={styles.button} onPress={checkSession}>
        <Text style={styles.buttonText}>Check Session</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out (Debug)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ffd33d',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
