import { Redirect } from 'expo-router';
import React, { useState } from 'react';
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const { user, signIn, signUp, resetPassword, refreshAuth } = useAuth();

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

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      Alert.alert('Email Required', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    setStatus('Sending reset email...');
    
    try {
      const { error } = await resetPassword(forgotPasswordEmail);
      
      if (error) {
        console.error('Password reset error:', error);
        setStatus('Failed to send reset email');
        Alert.alert(
          'Reset Failed', 
          `Failed to send password reset email: ${error.message}`,
          [
            {
              text: 'Contact Support',
              onPress: () => {
                Linking.openURL('mailto:whatflyfishing@gmail.com?subject=Password Reset Help&body=Hi WhatFly Team, I need help resetting my password for email: ' + forgotPasswordEmail);
              }
            },
            { text: 'OK' }
          ]
        );
      } else {
        setStatus('Password reset email sent!');
        Alert.alert(
          'Check Your Email',
          `We've sent a password reset link to ${forgotPasswordEmail}. Please check your email and click the link to reset your password.`,
          [
            {
              text: 'Contact Support',
              onPress: () => {
                Linking.openURL('mailto:whatflyfishing@gmail.com?subject=Password Reset Help&body=Hi WhatFly Team, I need help resetting my password for email: ' + forgotPasswordEmail);
              }
            },
            { text: 'OK' }
          ]
        );
        setShowForgotPassword(false);
        setForgotPasswordEmail(''); // Clear the email field
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setStatus('Failed to send reset email');
      Alert.alert(
        'Error', 
        'An unexpected error occurred. Please try again or contact support.',
        [
          {
            text: 'Contact Support',
            onPress: () => {
              Linking.openURL('mailto:whatflyfishing@gmail.com?subject=Password Reset Help&body=Hi WhatFly Team, I need help resetting my password for email: ' + forgotPasswordEmail);
            }
          },
          { text: 'OK' }
        ]
      );
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

          {!isSignUp && (
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => setShowForgotPassword(true)}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

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

          {showForgotPassword ? (
            <View style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordTitle}>Reset Password</Text>
              <Text style={styles.forgotPasswordDescription}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              
              <TextInput
                style={styles.forgotPasswordInput}
                placeholder="Enter your email address"
                placeholderTextColor="#8E8E93"
                value={forgotPasswordEmail}
                onChangeText={setForgotPasswordEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              
              <View style={styles.forgotPasswordActions}>
                <TouchableOpacity
                  style={styles.forgotPasswordCancelButton}
                  onPress={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                  }}
                  disabled={loading}
                >
                  <Text style={styles.forgotPasswordCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.forgotPasswordResetButton, loading && styles.authButtonDisabled]}
                  onPress={handleForgotPassword}
                  disabled={loading}
                >
                  <Text style={styles.forgotPasswordResetText}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

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
  forgotPasswordButton: {
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  forgotPasswordDescription: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  forgotPasswordInput: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    width: '100%',
  },
  forgotPasswordContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#1a4d3a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ade80',
    alignItems: 'center',
  },
  forgotPasswordTitle: {
    color: '#4ade80',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  forgotPasswordActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  forgotPasswordCancelButton: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  forgotPasswordCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  forgotPasswordResetButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  forgotPasswordResetText: {
    color: '#1a4d3a',
    fontSize: 16,
    fontWeight: 'bold',
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
});
