import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { getUsernameValidationError, isValidUsername } from '../lib/profileService';

export default function UsernameSetupScreen() {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { user, loading: authLoading, createProfile, checkUsernameAvailable, needsUsername } = useAuth();

  // Redirect if user doesn't need username setup (wait for auth loading first)
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) {
      console.log('UsernameSetup: Auth still loading, waiting...');
      return;
    }
    
    if (!user) {
      console.log('UsernameSetup: No user, redirecting to auth');
      router.replace('/auth');
    } else if (!needsUsername) {
      console.log('UsernameSetup: User already has profile, redirecting to map');
      router.replace('/(tabs)/map');
    }
  }, [user, needsUsername, authLoading]);

  // Debounced username availability check
  useEffect(() => {
    // Clear previous state
    setIsAvailable(null);
    setValidationError(null);
    
    if (!username) {
      return;
    }

    // Validate format first
    const error = getUsernameValidationError(username);
    if (error) {
      setValidationError(error);
      return;
    }

    // Check availability with debounce
    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      try {
        const available = await checkUsernameAvailable(username);
        setIsAvailable(available);
        if (!available) {
          setValidationError('Username is already taken');
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setValidationError('Error checking availability');
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, checkUsernameAvailable]);

  const handleContinue = useCallback(async () => {
    if (!isValidUsername(username) || !isAvailable || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await createProfile(username);
      
      if (error) {
        console.error('Error creating profile:', error);
        setSubmitError(error.message || 'Failed to create profile');
        setIsSubmitting(false);
        return;
      }

      console.log('Profile created successfully, navigating to app');
      router.replace('/(tabs)/map');
    } catch (error) {
      console.error('Unexpected error:', error);
      setSubmitError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  }, [username, isAvailable, isSubmitting, createProfile]);

  const canContinue = isValidUsername(username) && isAvailable === true && !isChecking && !isSubmitting;

  // Show loading if auth is loading or user state is invalid for this screen
  if (authLoading || !user || !needsUsername) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Choose your username</Text>
        <Text style={styles.subtitle}>
          This is how other anglers will find you
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.atSymbol}>@</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="username"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            maxLength={20}
          />
          <View style={styles.statusIndicator}>
            {isChecking ? (
              <ActivityIndicator size="small" color="#ffd33d" />
            ) : username.length > 0 ? (
              isAvailable === true ? (
                <Text style={styles.availableIcon}>✓</Text>
              ) : validationError ? (
                <Text style={styles.unavailableIcon}>✗</Text>
              ) : null
            ) : null}
          </View>
        </View>

        <View style={styles.validationContainer}>
          <Text style={[
            styles.charCount,
            username.length > 20 && styles.charCountError
          ]}>
            {username.length}/20
          </Text>
          
          {validationError ? (
            <Text style={styles.errorText}>{validationError}</Text>
          ) : isAvailable === true ? (
            <Text style={styles.successText}>Username is available!</Text>
          ) : null}
        </View>

        {submitError ? (
          <View style={styles.submitErrorContainer}>
            <Text style={styles.submitErrorText}>{submitError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#25292e" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.usernameRules}>
          Usernames can only contain letters, numbers, and underscores
        </Text>
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
    padding: 24,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#555',
    paddingHorizontal: 16,
    height: 56,
  },
  atSymbol: {
    fontSize: 20,
    color: '#ffd33d',
    fontWeight: '600',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: '#fff',
    paddingVertical: 12,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableIcon: {
    fontSize: 20,
    color: '#4ade80',
    fontWeight: 'bold',
  },
  unavailableIcon: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  validationContainer: {
    marginTop: 12,
    minHeight: 40,
  },
  charCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  charCountError: {
    color: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  successText: {
    fontSize: 14,
    color: '#4ade80',
    marginTop: 4,
  },
  submitErrorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  submitErrorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#ffd33d',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  continueButtonDisabled: {
    backgroundColor: '#555',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25292e',
  },
  usernameRules: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});
