import { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    console.log('Sign up response:', { data, error });
    return { data, error };
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting sign out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('AuthContext: Sign out successful, clearing user state');
        // Immediately clear user state and set loading to false
        setUser(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Sign out error:', error);
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
    signOut,
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
