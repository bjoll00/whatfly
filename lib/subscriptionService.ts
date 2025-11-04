// lib/subscriptionService.ts
// Subscription and premium feature management

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 2.99,
    interval: 'month',
    features: [
      'Enhanced fly suggestions',
      'Basic weather integration',
      '50 catch logs per month',
      'Export catch data'
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 7.99,
    interval: 'month',
    features: [
      'Everything in Basic',
      'Unlimited fly suggestions',
      'Unlimited catch logs',
      'Advanced weather data',
      'Fly tying guides',
      'Community features',
      'Priority support'
    ],
  },
  {
    id: 'guide',
    name: 'Guide',
    price: 14.99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Live weather data',
      'USGS river flow data',
      'Expert guide tips',
      'Advanced analytics',
      'Personal fishing insights'
    ]
  }
];

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

export class SubscriptionService {
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    // TODO: Implement database query to get user subscription
    // This would query your Supabase database for the user's subscription
    return null;
  }

  static async createSubscription(userId: string, planId: string): Promise<{ error?: string }> {
    // Premium features are not currently available
    return { error: 'Premium features are coming soon' };
  }

  static async cancelSubscription(subscriptionId: string): Promise<{ error?: string }> {
    // Premium features are not currently available
    return { error: 'Premium features are coming soon' };
  }

  static async updateSubscription(subscriptionId: string, newPlanId: string): Promise<{ error?: string }> {
    // TODO: Implement subscription plan changes
    return {};
  }

  static isFeatureAvailable(userId: string, feature: string): boolean {
    // TODO: Implement feature access control
    // Check if user's subscription includes the requested feature
    return false;
  }

  static getUsageLimit(userId: string, limitType: 'catch_logs' | 'fly_suggestions'): number {
    // TODO: Implement usage limit checking
    // Return the user's current usage limit based on their subscription
    return 10; // Default free tier limit
  }

  static getCurrentUsage(userId: string, limitType: 'catch_logs' | 'fly_suggestions'): Promise<number> {
    // TODO: Implement current usage tracking
    // Query database for user's current usage of the specified limit type
    return Promise.resolve(0);
  }
}

// Feature flags for premium functionality
export const PREMIUM_FEATURES = {
  UNLIMITED_FLY_SUGGESTIONS: 'unlimited_fly_suggestions',
  UNLIMITED_CATCH_LOGS: 'unlimited_catch_logs',
  ADVANCED_WEATHER: 'advanced_weather',
  FLY_TYING_GUIDES: 'fly_tying_guides',
  COMMUNITY_FEATURES: 'community_features',
  EXPORT_DATA: 'export_data',
  LIVE_WEATHER: 'live_weather',
  USGS_DATA: 'usgs_data',
  EXPERT_GUIDES: 'expert_guides',
  ADVANCED_ANALYTICS: 'advanced_analytics'
} as const;

export type PremiumFeature = typeof PREMIUM_FEATURES[keyof typeof PREMIUM_FEATURES];
