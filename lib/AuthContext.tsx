import { User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as profileService from './profileService';
import { supabase } from './supabase';
import { Profile, ProfileUpdate } from './types';

// Required for web browser auth sessions
WebBrowser.maybeCompleteAuthSession();

// Storage keys
const GUEST_MODE_KEY = 'whatfly_guest_mode'; // Note: SecureStore doesn't allow @ in keys

// Platform-aware storage helper using expo-secure-store
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  }
};

interface AuthContextType {
  // User & Profile state
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isGuest: boolean;
  needsUsername: boolean; // True when user is authenticated but has no profile
  
  // Email/Password auth
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
  refreshAuth: () => Promise<void>;
  
  // Social auth (to be implemented with OAuth)
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithApple: () => Promise<{ error: any }>;
  
  // Guest mode
  continueAsGuest: () => Promise<void>;
  exitGuestMode: () => Promise<void>;
  
  // Profile management
  createProfile: (username: string) => Promise<{ error: any }>;
  updateProfile: (updates: ProfileUpdate) => Promise<{ error: any }>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [needsUsername, setNeedsUsername] = useState(false);

  // Load profile when user changes
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const userProfile = await profileService.getProfile(userId);
      setProfile(userProfile);
      
      // Check if user needs to set up username
      if (!userProfile) {
        setNeedsUsername(true);
      } else {
        setNeedsUsername(false);
      }
    } catch (error) {
      console.error('AuthContext: Error loading profile:', error);
      setProfile(null);
      setNeedsUsername(true);
    }
  }, []);

  // Check for guest mode on mount
  useEffect(() => {
    const checkGuestMode = async () => {
      try {
        const guestMode = await storage.getItem(GUEST_MODE_KEY);
        if (guestMode === 'true') {
          setIsGuest(true);
        }
      } catch (error) {
        // Ignore guest mode errors
      }
    };
    checkGuestMode();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let hasInitialized = false;
    
    // Get initial session with timeout
    const initAuth = async () => {
      try {
        // Add timeout for getSession to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) => 
          setTimeout(() => resolve({ data: { session: null } }), 5000)
        );
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (!isMounted) return;
        hasInitialized = true;
        
        setUser(session?.user ?? null);
        
        // Load profile if user exists (with timeout)
        if (session?.user) {
          try {
            await Promise.race([
              loadProfile(session.user.id),
              new Promise<void>((resolve) => setTimeout(resolve, 5000))
            ]);
          } catch (e) {
            // Profile load failed, continue anyway
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      // Skip INITIAL_SESSION if we already initialized
      if (event === 'INITIAL_SESSION' && hasInitialized) return;
      
      // Mark as initialized if this is the first event
      if (event === 'INITIAL_SESSION') {
        hasInitialized = true;
      }
      
      setLoading(true);
      setUser(session?.user ?? null);
      
      // Handle user sign in
      if (session?.user) {
        setIsGuest(false);
        storage.removeItem(GUEST_MODE_KEY).catch(() => {});
        // Wait for profile load with timeout
        try {
          await Promise.race([
            loadProfile(session.user.id),
            new Promise<void>((resolve) => setTimeout(resolve, 5000))
          ]);
        } catch (e) {
          // Profile load failed, continue anyway
        }
      } else {
        setProfile(null);
        setNeedsUsername(false);
      }
      
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: Attempting sign in');
    setLoading(true);
    
    // Clear guest mode when signing in
    setIsGuest(false);
    await storage.removeItem(GUEST_MODE_KEY);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('AuthContext: Sign in response:', { data: !!data, error });

    if (error) {
      setLoading(false);
    }

    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    // Clear guest mode when signing up
    setIsGuest(false);
    await storage.removeItem(GUEST_MODE_KEY);
    
    // Use deep links for mobile apps to redirect back to the app after email verification
    let redirectTo: string;
    
    if (Platform.OS === 'web') {
      // Web platform - use web URL
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isDevelopment) {
        redirectTo = `${window.location.origin}/auth?verified=true`;
      } else {
        redirectTo = 'https://whatfly.app/auth?verified=true';
      }
    } else {
      // Mobile platform (iOS/Android) - use deep link to redirect back to the app
      redirectTo = 'whatfly://auth?verified=true';
    }

    console.log('AuthContext: Using email confirmation redirect URL:', redirectTo);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    console.log('Sign up response:', { data: !!data, error });
    return { data, error };
  };

  const resetPassword = async (email: string) => {
    console.log('AuthContext: Attempting password reset for:', email);
    
    // Determine the redirect URL based on platform
    let redirectTo: string;
    if (Platform.OS === 'web') {
      // Check if we're in development (localhost) or production
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isDevelopment) {
        // Development - use current origin (handles any port)
        redirectTo = `${window.location.origin}/reset-password`;
        console.log('AuthContext: Development mode - using redirect URL:', redirectTo);
      } else {
        // Production - use your production domain
        redirectTo = 'https://whatfly.app/reset-password';
        console.log('AuthContext: Production mode - using redirect URL:', redirectTo);
      }
    } else {
      // Mobile platform - use deep link
      redirectTo = 'whatfly://reset-password';
      console.log('AuthContext: Using deep link:', redirectTo);
    }
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
      captchaToken: undefined,
    });
    console.log('AuthContext: Password reset response:', { data, error });
    return { data, error };
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting sign out...');
      
      // Clear all state
      console.log('AuthContext: Clearing user state immediately');
      setUser(null);
      setProfile(null);
      setNeedsUsername(false);
      setIsGuest(false);
      setLoading(false);
      
      // Clear guest mode from storage
      await storage.removeItem(GUEST_MODE_KEY);
      
      // Try to sign out from Supabase, but don't fail if it errors
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn('AuthContext: Supabase sign out error (ignoring):', error);
        } else {
          console.log('AuthContext: Supabase sign out successful');
        }
      } catch (supabaseError) {
        console.warn('AuthContext: Supabase sign out failed (ignoring):', supabaseError);
      }
      
      console.log('AuthContext: Sign out completed - user state cleared');
    } catch (error) {
      console.error('AuthContext: Unexpected sign out error:', error);
      // Even if there's an error, clear the user state
      setUser(null);
      setProfile(null);
      setNeedsUsername(false);
      setIsGuest(false);
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    console.log('AuthContext: Starting account deletion...');
    
    try {
      // Use the current user from context
      if (!user) {
        console.error('AuthContext: No authenticated user found for deletion');
        return { error: { message: 'No authenticated user found' } };
      }

      console.log('AuthContext: Deleting account for user:', user.email);
      
      // Get the current session to get the access token
      console.log('AuthContext: Getting session for deletion...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('AuthContext: Session result:', { session: !!session, error: sessionError });
      
      if (sessionError || !session) {
        console.error('AuthContext: No valid session found for deletion', { sessionError, session });
        return { error: { message: 'No valid session found' } };
      }

      console.log('AuthContext: Session access token available:', !!session.access_token);

      // Call the Supabase Edge Function to delete the account
      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('AuthContext: Edge function error:', error);
        return { error: { message: `Failed to delete account: ${error.message}` } };
      }

      if (!data.success) {
        console.error('AuthContext: Account deletion failed:', data.error);
        return { error: { message: data.error || 'Account deletion failed' } };
      }

      console.log('AuthContext: Account deleted successfully from server');
      
      // Clear local state
      setUser(null);
      setProfile(null);
      setNeedsUsername(false);
      setIsGuest(false);
      setLoading(false);
      
      console.log('AuthContext: Account deletion completed successfully');
      
      return { error: null };
    } catch (error) {
      console.error('AuthContext: Unexpected account deletion error:', error);
      return { error: { message: 'An unexpected error occurred during account deletion' } };
    }
  };

  const refreshAuth = async () => {
    console.log('AuthContext: Refreshing auth state...');
    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('AuthContext: Refresh session check:', { session: session?.user?.id, error });
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadProfile(session.user.id);
      }
    } catch (error) {
      console.error('AuthContext: Refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Social auth - Google (OAuth)
  const signInWithGoogle = async () => {
    console.log('AuthContext: Starting Google sign in...');
    
    // Clear guest mode
    setIsGuest(false);
    await storage.removeItem(GUEST_MODE_KEY);
    
    try {
      // For native apps, use Supabase OAuth with web browser
      if (Platform.OS !== 'web') {
        // Get the OAuth URL from Supabase
        const redirectUrl = AuthSession.makeRedirectUri({
          scheme: 'whatfly',
          path: 'auth/callback',
        });
        
        console.log('AuthContext: Google OAuth redirect URL:', redirectUrl);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
          },
        });
        
        if (error) {
          console.error('AuthContext: Google OAuth URL error:', error);
          return { error };
        }
        
        if (!data.url) {
          return { error: { message: 'Failed to get Google sign in URL' } };
        }
        
        console.log('AuthContext: Opening Google OAuth in browser...');
        
        // Open the OAuth URL in a web browser
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
          { showInRecents: true }
        );
        
        console.log('AuthContext: Web browser result:', result.type);
        
        if (result.type === 'success' && result.url) {
          console.log('AuthContext: Callback URL received:', result.url);
          
          // Parse the URL to extract parameters
          const queryIndex = result.url.indexOf('?');
          const hashIndex = result.url.indexOf('#');
          
          let code: string | null = null;
          let accessToken: string | null = null;
          let refreshToken: string | null = null;
          
          // Check query params first (PKCE flow returns code in query params)
          if (queryIndex !== -1) {
            let queryString = result.url.substring(queryIndex + 1);
            if (hashIndex !== -1 && hashIndex > queryIndex) {
              queryString = result.url.substring(queryIndex + 1, hashIndex);
            }
            const queryParams = new URLSearchParams(queryString);
            code = queryParams.get('code');
            accessToken = queryParams.get('access_token');
            refreshToken = queryParams.get('refresh_token');
            console.log('AuthContext: Query params - code:', !!code, 'access_token:', !!accessToken);
          }
          
          // Check hash fragment (implicit flow returns tokens in hash)
          if (hashIndex !== -1 && !accessToken) {
            const hashParams = new URLSearchParams(result.url.substring(hashIndex + 1));
            accessToken = hashParams.get('access_token');
            refreshToken = hashParams.get('refresh_token');
            console.log('AuthContext: Hash params - access_token:', !!accessToken);
          }
          
          // PKCE Flow: Exchange authorization code for session
          if (code) {
            console.log('AuthContext: Exchanging authorization code for session...');
            const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (sessionError) {
              console.error('AuthContext: Code exchange error:', sessionError);
              return { error: sessionError };
            }
            
            console.log('AuthContext: Google sign in successful via PKCE');
            return { error: null };
          }
          
          // Implicit Flow: Set session directly with tokens
          if (accessToken) {
            console.log('AuthContext: Setting session from tokens...');
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (sessionError) {
              console.error('AuthContext: Session set error:', sessionError);
              return { error: sessionError };
            }
            
            console.log('AuthContext: Google sign in successful via implicit flow');
            return { error: null };
          }
          
          console.error('AuthContext: No code or access token found in callback URL');
          console.log('AuthContext: Full URL for debugging:', result.url);
        }
        
        if (result.type === 'cancel') {
          return { error: { message: 'Sign in was cancelled' } };
        }
        
        return { error: { message: 'Failed to complete Google sign in. Check redirect URL configuration.' } };
      }
      
      // For web, use standard OAuth redirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) {
        console.error('AuthContext: Google sign in error:', error);
        return { error };
      }
      
      console.log('AuthContext: Google sign in initiated:', data);
      return { error: null };
      
    } catch (error: any) {
      console.error('AuthContext: Google sign in failed:', error);
      return { error: { message: error.message || 'Failed to initiate Google sign in' } };
    }
  };

  // Social auth - Apple (Native)
  const signInWithApple = async () => {
    console.log('AuthContext: Starting Apple sign in...');
    
    // Clear guest mode
    setIsGuest(false);
    await storage.removeItem(GUEST_MODE_KEY);
    
    try {
      // Check if Apple Sign In is available (iOS only)
      if (Platform.OS !== 'ios') {
        return { error: { message: 'Apple Sign In is only available on iOS devices' } };
      }
      
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        return { error: { message: 'Apple Sign In is not available on this device' } };
      }
      
      // Generate a secure nonce for the auth request
      const rawNonce = Crypto.getRandomBytes(32);
      const nonce = Array.from(rawNonce).map(b => b.toString(16).padStart(2, '0')).join('');
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );
      
      console.log('AuthContext: Requesting Apple credentials...');
      
      // Request Apple Sign In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      
      console.log('AuthContext: Apple credentials received, signing in to Supabase...');
      
      // Sign in to Supabase with the Apple ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
        nonce: nonce,
      });
      
      if (error) {
        console.error('AuthContext: Supabase Apple sign in error:', error);
        return { error };
      }
      
      console.log('AuthContext: Apple sign in successful:', data.user?.id);
      return { error: null };
      
    } catch (error: any) {
      console.error('AuthContext: Apple sign in failed:', error);
      
      // Handle user cancellation
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return { error: { message: 'Sign in was cancelled' } };
      }
      
      return { error: { message: error.message || 'Failed to sign in with Apple' } };
    }
  };

  // Guest mode
  const continueAsGuest = async () => {
    console.log('AuthContext: Continuing as guest...');
    setIsGuest(true);
    setLoading(false);
    await storage.setItem(GUEST_MODE_KEY, 'true');
  };

  const exitGuestMode = async () => {
    console.log('AuthContext: Exiting guest mode...');
    setIsGuest(false);
    await storage.removeItem(GUEST_MODE_KEY);
  };

  // Profile management
  const createProfile = async (username: string) => {
    if (!user) {
      return { error: { message: 'No authenticated user' } };
    }
    
    console.log('AuthContext: Creating profile with username:', username);
    const result = await profileService.createProfile(user.id, username);
    
    if (result.profile) {
      setProfile(result.profile);
      setNeedsUsername(false);
    }
    
    return { error: result.error };
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) {
      return { error: { message: 'No authenticated user' } };
    }
    
    console.log('AuthContext: Updating profile:', updates);
    const result = await profileService.updateProfile(user.id, updates);
    
    if (result.profile) {
      setProfile(result.profile);
    }
    
    return { error: result.error };
  };

  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    return profileService.checkUsernameAvailable(username);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isGuest,
    needsUsername,
    signIn,
    signUp,
    resetPassword,
    signOut,
    deleteAccount,
    refreshAuth,
    signInWithGoogle,
    signInWithApple,
    continueAsGuest,
    exitGuestMode,
    createProfile,
    updateProfile,
    checkUsernameAvailable,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
