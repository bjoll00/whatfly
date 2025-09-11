import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const { user, signIn, signUp, refreshAuth } = useAuth();

  // If user is already authenticated, redirect to home
  if (user) {
    console.log('AuthScreen: User is authenticated, redirecting to home');
    return <Redirect href="/(tabs)" />;
  }

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setStatus('Processing...');
    try {
      if (isSignUp) {
        setStatus('Creating account...');
        const { data, error } = await signUp(email, password);
        if (error) {
          console.error('Sign up error:', error);
          setStatus('Sign up failed');
          Alert.alert('Error', error.message);
        } else {
          console.log('Sign up success:', data);
          setStatus('Account created!');
          Alert.alert(
            'Account Created!', 
            'Please check your email and click the verification link before you can sign in.',
            [
              { 
                text: 'OK', 
                onPress: () => {
                  setIsSignUp(false);
                  setEmail('');
                  setPassword('');
                  setStatus('');
                }
              }
            ]
          );
        }
      } else {
        setStatus('Signing in...');
        console.log('Attempting sign in with:', email);
        const { data, error } = await signIn(email, password);
        if (error) {
          console.error('Sign in error:', error);
          setStatus('Sign in failed');
          Alert.alert('Error', error.message);
        } else {
          console.log('Sign in successful:', data);
          setStatus('Sign in successful! Redirecting...');
          // The redirect will happen automatically via the user state check above
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setStatus('Unexpected error');
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>WhatFly</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create your account' : 'Welcome back!'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#666"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.authButton, loading && styles.authButtonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.authButtonText}>
              {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchButtonText}>
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </Text>
          </TouchableOpacity>

          {status ? (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          ) : null}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  scrollContainer: {
    flexGrow: 1,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  authButton: {
    backgroundColor: '#ffd33d',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  authButtonDisabled: {
    backgroundColor: '#666',
  },
  authButtonText: {
    color: '#25292e',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  switchButton: {
    padding: 10,
  },
  switchButtonText: {
    color: '#ffd33d',
    fontSize: 16,
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
  },
  statusText: {
    color: '#ffd33d',
    fontSize: 14,
    textAlign: 'center',
  },
});
