import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/AuthContext';

export default function TestResetScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword, signOut } = useAuth();
  const router = useRouter();

  const handleTestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      console.log('TestReset: Requesting password reset for:', email);
      const { error } = await resetPassword(email);
      
      if (error) {
        console.error('TestReset: Password reset error:', error);
        Alert.alert('Reset Failed', `Failed to send reset email: ${error.message}`);
      } else {
        console.log('TestReset: Password reset email sent successfully');
        Alert.alert(
          'Reset Email Sent!',
          `Password reset email sent to ${email}. Check your email and click the link.`,
          [
            {
              text: 'Open Reset Page',
              onPress: () => {
                // Navigate to reset password page
                router.push('/reset-password');
              }
            },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      console.error('TestReset: Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('TestReset: Starting sign out...');
      await signOut();
      console.log('TestReset: Sign out completed');
      router.push('/auth');
    } catch (error) {
      console.error('TestReset: Sign out error:', error);
      Alert.alert('Error', 'Sign out failed');
    }
  };

  const handleForceSignOut = () => {
    Alert.alert(
      'Force Sign Out',
      'This will clear your session locally and redirect to auth page.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Force Sign Out',
          style: 'destructive',
          onPress: () => {
            console.log('TestReset: Force sign out - clearing session');
            // Clear any stored session data
            if (typeof window !== 'undefined') {
              localStorage.removeItem('supabase.auth.token');
              sessionStorage.clear();
            }
            router.push('/auth');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Password Reset Test</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Email Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#8E8E93"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleTestReset}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending...' : 'Send Reset Email'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forceSignOutButton} onPress={handleForceSignOut}>
          <Text style={styles.forceSignOutText}>Force Sign Out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/reset-password')}
        >
          <Text style={styles.linkText}>Go to Reset Password Page</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.debugButton}
          onPress={() => router.push('/email-debug')}
        >
          <Text style={styles.debugButtonText}>🔧 Email Debug Tool</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Instructions:</Text>
        <Text style={styles.infoText}>1. Enter your email address</Text>
        <Text style={styles.infoText}>2. Click "Send Reset Email"</Text>
        <Text style={styles.infoText}>3. Check your email and click the reset link</Text>
        <Text style={styles.infoText}>4. You should see the password reset form</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd33d',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    marginBottom: 30,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1d21',
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4ade80',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#1a1d21',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actions: {
    marginBottom: 30,
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forceSignOutButton: {
    backgroundColor: '#ff8800',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  forceSignOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#ff8800',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: '#1a1d21',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  infoTitle: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 5,
  },
});
