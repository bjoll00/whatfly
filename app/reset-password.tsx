import { Redirect, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/AuthContext';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const { user } = useAuth();
  const { access_token, refresh_token } = useLocalSearchParams();

  // Debug logging
  console.log('ResetPasswordScreen: URL params:', { access_token, refresh_token });
  console.log('ResetPasswordScreen: User state:', user);

  // If user is already authenticated but no tokens in URL, show reset form
  // This handles the case where Supabase automatically signs the user in
  if (user && (!access_token || !refresh_token)) {
    console.log('ResetPasswordScreen: User is authenticated via automatic reset, showing reset form');
    // Don't redirect - show the reset form
  } else if (user && access_token && refresh_token) {
    // User is authenticated and has tokens - redirect to home
    console.log('ResetPasswordScreen: User is authenticated with tokens, redirecting to home');
    return <Redirect href="/" />;
  } else if (!access_token || !refresh_token) {
    console.log('ResetPasswordScreen: No tokens provided, redirecting to auth');
    console.log('ResetPasswordScreen: Available params:', Object.keys(useLocalSearchParams()));
    return <Redirect href="/auth" />;
  }

  const handleResetPassword = async () => {
    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter a new password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords Don\'t Match', 'Please make sure both passwords are the same');
      return;
    }

    setLoading(true);
    setStatus('Updating password...');
    
    try {
      // Import supabase directly to handle password update
      const { supabase } = await import('../lib/supabase');
      
      // Check if we have tokens in the URL
      if (access_token && refresh_token) {
        console.log('Setting session with URL tokens');
        // Set the session with the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: access_token as string,
          refresh_token: refresh_token as string,
        });

        if (error) {
          console.error('Session error:', error);
          Alert.alert('Session Error', 'Invalid or expired reset link. Please request a new password reset.');
          return;
        }
      } else {
        console.log('No tokens in URL, checking current session');
        // Check if user is already authenticated (automatic reset mode)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          Alert.alert('No Session', 'No valid session found. Please request a new password reset.');
          return;
        }
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        Alert.alert('Update Failed', `Failed to update password: ${updateError.message}`);
        setStatus('Failed to update password');
      } else {
        setStatus('Password updated successfully!');
        Alert.alert(
          'Success!',
          'Your password has been updated successfully. You can now sign in with your new password.',
          [
            {
              text: 'Sign Out & Sign In',
              onPress: async () => {
                // Sign out and redirect to auth screen
                await supabase.auth.signOut();
                window.location.href = '/auth';
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setStatus('An unexpected error occurred');
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>🔐 Reset Password</Text>
              <Text style={styles.subtitle}>
                {user ? 'You were automatically signed in. Enter your new password below.' : 'Enter your new password below'}
              </Text>
            </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#8E8E93"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor="#8E8E93"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>

          {status ? (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              window.location.href = '/auth';
            }}
          >
            <Text style={styles.linkText}>← Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1a1d21',
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4ade80',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#1a1d21',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  linkButton: {
    padding: 10,
  },
  linkText: {
    color: '#ffd33d',
    fontSize: 16,
    textAlign: 'center',
  },
});
