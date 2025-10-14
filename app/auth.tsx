import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';

const WhatFlyLogo = require('@/assets/images/WhatFlyFishingLogo.png');

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const { user, signIn, signUp, resetPassword, refreshAuth } = useAuth();
  const searchParams = useLocalSearchParams();

  // Handle email verification success
  useEffect(() => {
    if (searchParams.verified === 'true') {
      console.log('AuthScreen: Email verification detected');
      setEmailVerified(true);
      setStatus('Email verified successfully! You can now sign in.');
      // Refresh auth state to check if user is now authenticated
      refreshAuth();
      
      // Auto-redirect after 3 seconds if user becomes authenticated
      const timer = setTimeout(() => {
        if (user) {
          console.log('AuthScreen: Auto-redirecting verified user to main app');
          router.replace('/(tabs)');
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams.verified, refreshAuth, user, router]);

  // If user is already authenticated, automatically redirect to main app
  useEffect(() => {
    if (user) {
      console.log('AuthScreen: User is already authenticated, redirecting to main app');
      router.replace('/(tabs)');
    }
  }, [user, router]);

  // Show loading screen while redirecting authenticated users
  if (user) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>✅ Welcome back!</Text>
          <Text style={styles.message}>Redirecting to your fishing dashboard...</Text>
        </View>
      </View>
    );
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
          setShowVerificationMessage(true);
          // Clear form and switch to sign in mode
          setIsSignUp(false);
          setEmail('');
          setPassword('');
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
          <Image source={WhatFlyLogo} style={styles.logo} resizeMode="contain" />
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


          {showVerificationMessage ? (
            <View style={styles.verificationContainer}>
              <Text style={styles.verificationTitle}>Check Your Email!</Text>
              <Text style={styles.verificationText}>
                We've sent you a verification link at {email}. Please check your email and click the link to verify your account before signing in.
              </Text>
              <TouchableOpacity
                style={styles.verificationButton}
                onPress={() => setShowVerificationMessage(false)}
              >
                <Text style={styles.verificationButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {emailVerified ? (
            <View style={[styles.verificationContainer, styles.successContainer]}>
              <Text style={[styles.verificationTitle, styles.successTitle]}>✅ Email Verified!</Text>
              <Text style={styles.verificationText}>
                Your email has been successfully verified. You can now sign in to your account.
              </Text>
              <TouchableOpacity
                style={[styles.verificationButton, styles.successButton]}
                onPress={() => {
                  setEmailVerified(false);
                  if (user) {
                    // If user is already authenticated (which they should be after email verification), go to main app
                    router.replace('/(tabs)');
                  }
                }}
              >
                <Text style={[styles.verificationButtonText, styles.successButtonText]}>
                  {user ? 'Continue to App' : 'Continue to Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {status ? (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          ) : null}

        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => {
              Linking.openURL('mailto:whatflyfishing@gmail.com?subject=WhatFly Support&body=Hi WhatFly Team,');
            }}
          >
            <Text style={styles.contactButtonText}>📧 Contact Support</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>
            Having trouble? Email us at whatflyfishing@gmail.com
          </Text>
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
  logo: {
    width: 525,
    height: 225,
    marginBottom: 20,
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
  verificationContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#1a4d3a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ade80',
    alignItems: 'center',
  },
  verificationTitle: {
    color: '#4ade80',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  verificationText: {
    color: '#e5e7eb',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  verificationButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  verificationButtonText: {
    color: '#1a4d3a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    backgroundColor: '#1a4d3a',
    borderColor: '#22c55e',
  },
  successTitle: {
    color: '#22c55e',
  },
  successButton: {
    backgroundColor: '#22c55e',
  },
  successButtonText: {
    color: '#ffffff',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contactButton: {
    backgroundColor: '#3a3a3a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    marginBottom: 10,
  },
  contactButtonText: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#ffd33d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1a1d21',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
