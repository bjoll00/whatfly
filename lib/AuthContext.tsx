import { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Initializing...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthContext: Initial session check:', { session: session?.user?.id, error });
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthContext: Auth state changed:', event, session?.user?.id);
      console.log('AuthContext: Setting user to:', session?.user);
      console.log('AuthContext: Setting loading to false');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('AuthContext: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: Attempting sign in');
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('AuthContext: Sign in response:', { data, error });
    
    // The auth state change listener will handle updating the user state
    // No need to manually set user here as it can cause race conditions
    setLoading(false);
    
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
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
    console.log('Sign up response:', { data, error });
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
          // Force manual password reset mode
          captchaToken: undefined,
        });
        console.log('AuthContext: Password reset response:', { data, error });
        return { data, error };
      };

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting sign out...');
      
      // Always clear user state first, regardless of Supabase response
      console.log('AuthContext: Clearing user state immediately');
      setUser(null);
      setLoading(false);
      
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
    } catch (error) {
      console.error('AuthContext: Refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    resetPassword,
    signOut,
    deleteAccount,
    refreshAuth,
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

