import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [status, setStatus] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  
  const { 
    user, 
    loading: authLoading,
    needsUsername,
    signIn, 
    signUp, 
    signInWithGoogle,
    signInWithApple,
    refreshAuth 
  } = useAuth();
  
  const searchParams = useLocalSearchParams();

  // Handle email verification success
  useEffect(() => {
    if (searchParams.verified === 'true') {
      console.log('AuthScreen: Email verification detected');
      setEmailVerified(true);
      setStatus('Email verified successfully! You can now sign in.');
      refreshAuth();
      
      const timer = setTimeout(() => {
        if (user) {
          console.log('AuthScreen: Auto-redirecting verified user');
          if (needsUsername) {
            router.replace('/username-setup');
          } else {
            router.replace('/(tabs)/map');
          }
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams.verified, refreshAuth, user, needsUsername]);

  // Redirect authenticated users (wait for auth loading to complete first)
  useEffect(() => {
    // Don't redirect while auth is still loading (profile being fetched)
    if (authLoading) {
      console.log('AuthScreen: Auth still loading, waiting...');
      return;
    }
    
    if (user) {
      console.log('AuthScreen: User authenticated, needsUsername:', needsUsername);
      if (needsUsername) {
        console.log('AuthScreen: User needs username, redirecting to setup');
        router.replace('/username-setup');
      } else {
        console.log('AuthScreen: User has profile, redirecting to app');
        router.replace('/(tabs)/map');
      }
    }
  }, [user, needsUsername, authLoading]);

  // Show loading while auth is being processed
  if (authLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffd33d" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Show loading/redirect message for authenticated users
  if (user) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffd33d" />
          <Text style={styles.loadingText}>
            {needsUsername ? 'Setting up your profile...' : 'Welcome back!'}
          </Text>
        </View>
      </View>
    );
  }

  const handleEmailAuth = async () => {
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
        const { error } = await signUp(email, password);
        if (error) {
          setStatus('Sign up failed');
          Alert.alert('Error', error.message);
        } else {
          setStatus('Account created!');
          setShowVerificationMessage(true);
          setIsSignUp(false);
          setEmail('');
          setPassword('');
        }
      } else {
        setStatus('Signing in...');
        const { error } = await signIn(email, password);
        if (error) {
          setStatus('Sign in failed');
          Alert.alert('Error', error.message);
        } else {
          setStatus('Sign in successful!');
        }
      }
    } catch (error) {
      setStatus('Unexpected error');
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading('google');
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert('Error', error.message || 'Failed to sign in with Google');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setSocialLoading('apple');
    try {
      const { error } = await signInWithApple();
      if (error) {
        Alert.alert('Error', error.message || 'Failed to sign in with Apple');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSkip = () => {
    // Just go back to the map - user can use basic features without signing in
    router.replace('/(tabs)/map');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={WhatFlyLogo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subtitle}>
            {isSignUp 
              ? 'Create an account to save your catches' 
              : 'Sign in to access your fishing data'
            }
          </Text>
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialButtons}>
          {/* Apple Sign In */}
          <TouchableOpacity
            style={[styles.socialButton, styles.appleButton]}
            onPress={handleAppleSignIn}
            disabled={socialLoading !== null || loading}
          >
            {socialLoading === 'apple' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="logo-apple" size={20} color="#fff" />
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Google Sign In */}
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={socialLoading !== null || loading}
          >
            {socialLoading === 'google' ? (
              <ActivityIndicator size="small" color="#333" />
            ) : (
              <>
                <Image 
                  source={{ uri: 'https://www.google.com/favicon.ico' }} 
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with email</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email/Password Form */}
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
              editable={!loading && socialLoading === null}
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
              editable={!loading && socialLoading === null}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.authButton, 
              (loading || socialLoading !== null) && styles.authButtonDisabled
            ]}
            onPress={handleEmailAuth}
            disabled={loading || socialLoading !== null}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#25292e" />
            ) : (
              <Text style={styles.authButtonText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setStatus('');
              setShowVerificationMessage(false);
            }}
            disabled={loading || socialLoading !== null}
          >
            <Text style={styles.switchButtonText}>
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verification Messages */}
        {showVerificationMessage && (
          <View style={styles.verificationContainer}>
            <Text style={styles.verificationTitle}>📧 Check Your Email!</Text>
            <Text style={styles.verificationText}>
              We've sent you a verification link. Please check your email and click the link to verify your account.
            </Text>
            <TouchableOpacity
              style={styles.verificationButton}
              onPress={() => setShowVerificationMessage(false)}
            >
              <Text style={styles.verificationButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        )}

        {emailVerified && (
          <View style={[styles.verificationContainer, styles.successContainer]}>
            <Text style={[styles.verificationTitle, styles.successTitle]}>
              ✅ Email Verified!
            </Text>
            <Text style={styles.verificationText}>
              Your email has been verified. You can now sign in.
            </Text>
          </View>
        )}

        {status && !showVerificationMessage && !emailVerified && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}

        {/* Skip Option */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading || socialLoading !== null}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>

        <Text style={styles.skipHint}>
          You can create an account later to save your catches and connect with other anglers
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => {
              Linking.openURL('mailto:whatflyfishing@gmail.com?subject=WhatFly Support');
            }}
          >
            <Text style={styles.contactButtonText}>📧 Contact Support</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 300,
    height: 120,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    maxWidth: 280,
  },
  // Social buttons
  socialButtons: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3a3a3a',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  // Form
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  authButton: {
    backgroundColor: '#ffd33d',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  authButtonDisabled: {
    backgroundColor: '#666',
  },
  authButtonText: {
    color: '#25292e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    padding: 10,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#ffd33d',
    fontSize: 15,
  },
  // Verification messages
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  verificationText: {
    color: '#e5e7eb',
    fontSize: 15,
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
  statusContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
  },
  statusText: {
    color: '#ffd33d',
    fontSize: 14,
    textAlign: 'center',
  },
  // Skip option
  skipButton: {
    marginTop: 32,
    padding: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#999',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  skipHint: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  // Footer
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  contactButton: {
    backgroundColor: '#3a3a3a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
  },
  contactButtonText: {
    color: '#ffd33d',
    fontSize: 14,
    fontWeight: '600',
  },
});
