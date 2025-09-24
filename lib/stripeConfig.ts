// lib/stripeConfig.ts
// Stripe configuration and setup

export const STRIPE_CONFIG = {
  // Publishable key (safe to expose in client-side code)
  PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
  
  // Subscription plans
  PLANS: {
    basic: {
      id: 'price_basic_monthly',
      name: 'Basic',
      price: 2.99,
      interval: 'month',
      features: [
        'Enhanced fly suggestions',
        'Basic weather integration', 
        '50 catch logs per month',
        'Export catch data'
      ]
    },
    pro: {
      id: 'price_pro_monthly',
      name: 'Pro',
      price: 7.99,
      interval: 'month',
      features: [
        'Unlimited fly suggestions',
        'Unlimited catch logs',
        'Advanced weather data',
        'Fly tying guides',
        'Community features',
        'Priority support'
      ]
    },
    guide: {
      id: 'price_guide_monthly',
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
  }
};

// Environment variables needed:
// EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
// STRIPE_SECRET_KEY=sk_test_... (server-side only)
