// lib/stripeService.ts
// Stripe payment processing service

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';
import { STRIPE_CONFIG } from './stripeConfig';

let stripePromise: Promise<Stripe | null>;

export class StripeService {
  // Initialize Stripe
  static async initializeStripe(): Promise<Stripe | null> {
    if (!stripePromise) {
      stripePromise = loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY);
    }
    return stripePromise;
  }

  // Create a subscription checkout session
  static async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          userId,
          planId,
          successUrl,
          cancelUrl
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        return { error: 'Failed to create checkout session' };
      }

      return { sessionId: data.sessionId };
    } catch (error) {
      console.error('Unexpected error creating checkout session:', error);
      return { error: 'An unexpected error occurred' };
    }
  }

  // Redirect to Stripe Checkout
  static async redirectToCheckout(sessionId: string): Promise<{ error?: string }> {
    try {
      const stripe = await this.initializeStripe();
      
      if (!stripe) {
        return { error: 'Failed to initialize Stripe' };
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId
      });

      if (error) {
        console.error('Stripe checkout error:', error);
        return { error: error.message || 'Checkout failed' };
      }

      return {};
    } catch (error) {
      console.error('Unexpected checkout error:', error);
      return { error: 'An unexpected error occurred during checkout' };
    }
  }

  // Create subscription (complete flow)
  static async createSubscription(
    userId: string,
    planId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Determine success and cancel URLs based on platform
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : 'whatfly://';
      
      const successUrl = `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/subscription-canceled`;

      // Create checkout session
      const { sessionId, error: sessionError } = await this.createCheckoutSession(
        userId,
        planId,
        successUrl,
        cancelUrl
      );

      if (sessionError || !sessionId) {
        return { success: false, error: sessionError || 'Failed to create checkout session' };
      }

      // Redirect to checkout
      const { error: checkoutError } = await this.redirectToCheckout(sessionId);
      
      if (checkoutError) {
        return { success: false, error: checkoutError };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected subscription error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Get subscription status
  static async getSubscriptionStatus(userId: string): Promise<{
    isActive: boolean;
    planId?: string;
    status?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('get-subscription-status', {
        body: { userId }
      });

      if (error) {
        console.error('Error getting subscription status:', error);
        return { isActive: false, error: 'Failed to get subscription status' };
      }

      return {
        isActive: data.isActive || false,
        planId: data.planId,
        status: data.status
      };
    } catch (error) {
      console.error('Unexpected error getting subscription status:', error);
      return { isActive: false, error: 'An unexpected error occurred' };
    }
  }

  // Cancel subscription
  static async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { userId }
      });

      if (error) {
        console.error('Error canceling subscription:', error);
        return { success: false, error: 'Failed to cancel subscription' };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error canceling subscription:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Get plan details
  static getPlanDetails(planId: string) {
    return STRIPE_CONFIG.PLANS[planId as keyof typeof STRIPE_CONFIG.PLANS];
  }
}
