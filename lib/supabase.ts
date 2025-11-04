import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './config';
import { Feedback, Fly } from './types';

const supabaseUrl = SUPABASE_CONFIG.url;
const supabaseAnonKey = SUPABASE_CONFIG.anonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Enable deep link handling for mobile apps
    flowType: 'pkce'
  }
});

// Auth helpers
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// Helper to get current user with proper typing
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

// Database table names
export const TABLES = {
  FLIES: 'flies',
  FEEDBACK: 'feedback',
} as const;

// Flies Service
export const fliesService = {
  // Get all flies
  async getFlies(): Promise<Fly[]> {
    const { data, error } = await supabase
      .from(TABLES.FLIES)
      .select('*')
      .order('success_rate', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get flies by conditions
  async getFliesByConditions(conditions: {
    weather_conditions?: string;
    water_clarity?: string;
    water_level?: string;
    time_of_day?: string;
    water_temperature?: number;
  }): Promise<Fly[]> {
    let query = supabase.from(TABLES.FLIES).select('*');

    // Add filters based on conditions
    if (conditions.weather_conditions) {
      query = query.contains('best_conditions->weather', [conditions.weather_conditions]);
    }
    if (conditions.water_clarity) {
      query = query.contains('best_conditions->water_clarity', [conditions.water_clarity]);
    }
    if (conditions.water_level) {
      query = query.contains('best_conditions->water_level', [conditions.water_level]);
    }
    if (conditions.time_of_day) {
      query = query.contains('best_conditions->time_of_day', [conditions.time_of_day]);
    }

    const { data, error } = await query.order('success_rate', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Update fly success rate
  async updateFlySuccess(flyId: string, wasSuccessful: boolean): Promise<void> {
    console.log(`Updating fly ${flyId}, successful: ${wasSuccessful}`);
    
    const { data: fly, error: fetchError } = await supabase
      .from(TABLES.FLIES)
      .select('successful_uses, total_uses')
      .eq('id', flyId)
      .single();

    if (fetchError) {
      console.error('Error fetching fly:', fetchError);
      throw fetchError;
    }

    console.log('Current fly stats:', fly);

    const newTotalUses = fly.total_uses + 1;
    const newSuccessfulUses = fly.successful_uses + (wasSuccessful ? 1 : 0);
    const newSuccessRate = newSuccessfulUses / newTotalUses;

    console.log('New stats:', { newTotalUses, newSuccessfulUses, newSuccessRate });

    const { error: updateError } = await supabase
      .from(TABLES.FLIES)
      .update({
        total_uses: newTotalUses,
        successful_uses: newSuccessfulUses,
        success_rate: newSuccessRate,
      })
      .eq('id', flyId);

    if (updateError) {
      console.error('Error updating fly:', updateError);
      throw updateError;
    }
    
    console.log('Fly updated successfully');
  },

  // Create a new fly
  async createFly(fly: Omit<Fly, 'id' | 'created_at' | 'updated_at' | 'success_rate' | 'total_uses' | 'successful_uses'>): Promise<Fly> {
    const newFly = {
      ...fly,
      success_rate: 0,
      total_uses: 0,
      successful_uses: 0,
    };

    const { data, error } = await supabase
      .from(TABLES.FLIES)
      .insert([newFly])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Feedback Service
export const feedbackService = {
  // Get all feedback for a user
  async getFeedback(userId: string): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from(TABLES.FEEDBACK)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create a new feedback entry
  async createFeedback(feedback: Omit<Feedback, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Feedback> {
    const newFeedback = {
      ...feedback,
      status: 'pending' as const,
    };

    const { data, error } = await supabase
      .from(TABLES.FEEDBACK)
      .insert([newFeedback])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update feedback status (admin only)
  async updateFeedbackStatus(id: string, status: Feedback['status']): Promise<Feedback> {
    const { data, error } = await supabase
      .from(TABLES.FEEDBACK)
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete feedback (user can only delete their own)
  async deleteFeedback(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.FEEDBACK)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
