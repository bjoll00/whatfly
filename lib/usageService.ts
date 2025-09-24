// lib/usageService.ts
// Usage tracking and limits for free vs premium users

import { supabase } from './supabase';
import { useAuth } from './AuthContext';

export interface UsageLimit {
  type: 'fly_suggestions' | 'catch_logs';
  limit: number;
  used: number;
  resetDate: Date;
}

export interface UserUsage {
  userId: string;
  flySuggestionsUsed: number;
  catchLogsUsed: number;
  lastResetDate: Date;
  isPremium: boolean;
}

export class UsageService {
  // Usage limits for free users
  static readonly FREE_LIMITS = {
    FLY_SUGGESTIONS: 3, // per day
    CATCH_LOGS: 10, // total
  };

  // Get current user usage
  static async getUserUsage(userId: string): Promise<UserUsage> {
    try {
      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user usage:', error);
        return this.createDefaultUsage(userId);
      }

      if (!data) {
        return this.createDefaultUsage(userId);
      }

      // Check if we need to reset daily limits
      const today = new Date();
      const lastReset = new Date(data.last_reset_date);
      const needsReset = today.getDate() !== lastReset.getDate() || 
                        today.getMonth() !== lastReset.getMonth() || 
                        today.getFullYear() !== lastReset.getFullYear();

      if (needsReset) {
        await this.resetDailyUsage(userId);
        return this.createDefaultUsage(userId);
      }

      return {
        userId: data.user_id,
        flySuggestionsUsed: data.fly_suggestions_used || 0,
        catchLogsUsed: data.catch_logs_used || 0,
        lastResetDate: new Date(data.last_reset_date),
        isPremium: data.is_premium || false,
      };
    } catch (error) {
      console.error('Error in getUserUsage:', error);
      return this.createDefaultUsage(userId);
    }
  }

  // Check if user can perform an action
  static async canPerformAction(
    userId: string, 
    actionType: 'fly_suggestions' | 'catch_logs'
  ): Promise<{ canPerform: boolean; usage: UserUsage; limit: number }> {
    const usage = await this.getUserUsage(userId);
    
    // Premium users have unlimited access
    if (usage.isPremium) {
      return {
        canPerform: true,
        usage,
        limit: -1 // -1 indicates unlimited
      };
    }

    let limit: number;
    let used: number;

    switch (actionType) {
      case 'fly_suggestions':
        limit = this.FREE_LIMITS.FLY_SUGGESTIONS;
        used = usage.flySuggestionsUsed;
        break;
      case 'catch_logs':
        limit = this.FREE_LIMITS.CATCH_LOGS;
        used = usage.catchLogsUsed;
        break;
      default:
        return {
          canPerform: false,
          usage,
          limit: 0
        };
    }

    return {
      canPerform: used < limit,
      usage,
      limit
    };
  }

  // Increment usage count
  static async incrementUsage(
    userId: string, 
    actionType: 'fly_suggestions' | 'catch_logs'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { canPerform, usage } = await this.canPerformAction(userId, actionType);
      
      if (!canPerform && !usage.isPremium) {
        return {
          success: false,
          error: 'Usage limit exceeded'
        };
      }

      // Update usage count
      const updateData: any = {};
      
      if (actionType === 'fly_suggestions') {
        updateData.fly_suggestions_used = (usage.flySuggestionsUsed || 0) + 1;
      } else if (actionType === 'catch_logs') {
        updateData.catch_logs_used = (usage.catchLogsUsed || 0) + 1;
      }

      // Upsert usage record
      const { error } = await supabase
        .from('user_usage')
        .upsert({
          user_id: userId,
          ...updateData,
          last_reset_date: usage.lastResetDate.toISOString(),
          is_premium: usage.isPremium,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating usage:', error);
        return {
          success: false,
          error: 'Failed to update usage'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in incrementUsage:', error);
      return {
        success: false,
        error: 'Unexpected error'
      };
    }
  }

  // Set premium status
  static async setPremiumStatus(userId: string, isPremium: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_usage')
        .upsert({
          user_id: userId,
          is_premium: isPremium,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error setting premium status:', error);
        return {
          success: false,
          error: 'Failed to update premium status'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in setPremiumStatus:', error);
      return {
        success: false,
        error: 'Unexpected error'
      };
    }
  }

  // Reset daily usage (for fly suggestions)
  private static async resetDailyUsage(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_usage')
        .upsert({
          user_id: userId,
          fly_suggestions_used: 0,
          last_reset_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error resetting daily usage:', error);
      }
    } catch (error) {
      console.error('Error in resetDailyUsage:', error);
    }
  }

  // Create default usage record
  private static createDefaultUsage(userId: string): UserUsage {
    return {
      userId,
      flySuggestionsUsed: 0,
      catchLogsUsed: 0,
      lastResetDate: new Date(),
      isPremium: false,
    };
  }

  // Get usage limits for display
  static getUsageLimits(isPremium: boolean): { flySuggestions: number; catchLogs: number } {
    if (isPremium) {
      return {
        flySuggestions: -1, // Unlimited
        catchLogs: -1, // Unlimited
      };
    }

    return {
      flySuggestions: this.FREE_LIMITS.FLY_SUGGESTIONS,
      catchLogs: this.FREE_LIMITS.CATCH_LOGS,
    };
  }

  // Get usage status message
  static getUsageStatusMessage(usage: UserUsage, actionType: 'fly_suggestions' | 'catch_logs'): string {
    if (usage.isPremium) {
      return 'Premium - Unlimited access';
    }

    const limits = this.getUsageLimits(false);
    let used: number;
    let limit: number;

    switch (actionType) {
      case 'fly_suggestions':
        used = usage.flySuggestionsUsed;
        limit = limits.flySuggestions;
        break;
      case 'catch_logs':
        used = usage.catchLogsUsed;
        limit = limits.catchLogs;
        break;
      default:
        return '';
    }

    const remaining = limit - used;
    return `${used}/${limit} used (${remaining} remaining)`;
  }
}
