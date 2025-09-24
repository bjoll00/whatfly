# Stripe Integration Setup Guide

This guide will help you set up Stripe payment processing for your WhatFly app.

## Prerequisites

- Stripe account ([https://stripe.com](https://stripe.com))
- Supabase project with Edge Functions enabled
- Stripe CLI (optional, for testing webhooks locally)

## Step 1: Stripe Account Setup

### 1.1 Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete account verification

### 1.2 Get API Keys
1. Go to **Developers → API keys**
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

### 1.3 Create Products and Prices
1. Go to **Products** in your Stripe dashboard
2. Create three products:

**Basic Plan:**
- Name: "WhatFly Basic"
- Price: $2.99/month
- Copy the Price ID (starts with `price_`)

**Pro Plan:**
- Name: "WhatFly Pro"
- Price: $7.99/month
- Copy the Price ID

**Guide Plan:**
- Name: "WhatFly Guide"
- Price: $14.99/month
- Copy the Price ID

## Step 2: Environment Variables

### 2.1 Update Stripe Config
Edit `lib/stripeConfig.ts` and replace the price IDs:

```typescript
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_your_actual_key_here',
  
  PLANS: {
    basic: {
      id: 'price_your_basic_price_id', // Replace with actual price ID
      name: 'Basic',
      price: 2.99,
      // ... rest of config
    },
    pro: {
      id: 'price_your_pro_price_id', // Replace with actual price ID
      name: 'Pro',
      price: 7.99,
      // ... rest of config
    },
    guide: {
      id: 'price_your_guide_price_id', // Replace with actual price ID
      name: 'Guide',
      price: 14.99,
      // ... rest of config
    }
  }
};
```

### 2.2 Set Supabase Environment Variables
1. Go to your Supabase Dashboard
2. Navigate to **Settings → Edge Functions**
3. Add these environment variables:

```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 3: Deploy Edge Functions

### 3.1 Deploy Functions
Deploy the Stripe Edge Functions to your Supabase project:

```bash
# Deploy checkout session creator
supabase functions deploy create-checkout-session

# Deploy subscription status checker
supabase functions deploy get-subscription-status

# Deploy webhook handler
supabase functions deploy stripe-webhook
```

### 3.2 Set Up Webhook Endpoint
1. Go to your Stripe Dashboard
2. Navigate to **Developers → Webhooks**
3. Click **Add endpoint**
4. Set endpoint URL to: `https://your-project.supabase.co/functions/v1/stripe-webhook`
5. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Copy the webhook signing secret and add it to Supabase environment variables

## Step 4: Database Setup

### 4.1 Create User Usage Table
Run the SQL from `user-usage-table.sql` in your Supabase SQL Editor:

```sql
-- Copy and paste the entire contents of user-usage-table.sql
-- This creates the table for tracking user usage and premium status
```

## Step 5: Test the Integration

### 5.1 Test Checkout Flow
1. Run your app: `npm start`
2. Sign in to your app
3. Go to WhatFly tab
4. Use 3 fly suggestions (hit the limit)
5. Click "Upgrade for Unlimited"
6. Select a plan and click "Upgrade"
7. You should be redirected to Stripe Checkout

### 5.2 Test Webhook
1. Complete a test purchase in Stripe Checkout
2. Check your Supabase logs to ensure the webhook processed correctly
3. Verify the user's `is_premium` status was updated to `true`

## Step 6: Production Setup

### 6.1 Switch to Live Mode
1. In Stripe Dashboard, toggle to **Live mode**
2. Create live products and prices
3. Update environment variables with live keys
4. Update webhook endpoint URL
5. Redeploy Edge Functions

### 6.2 Update App Configuration
1. Update `STRIPE_CONFIG` with live price IDs
2. Update `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` with live publishable key
3. Build and deploy your app

## Troubleshooting

### Common Issues:

**"Failed to create checkout session"**
- Check that Stripe secret key is set correctly
- Verify price IDs match your Stripe dashboard
- Check Supabase Edge Function logs

**"Webhook signature verification failed"**
- Ensure webhook secret is correct
- Check that webhook endpoint URL is accessible
- Verify webhook events are configured correctly

**"Invalid or expired token"**
- Check that user is properly authenticated
- Verify JWT token is being passed correctly
- Check Supabase auth configuration

### Debug Steps:
1. Check Supabase Edge Function logs
2. Check Stripe Dashboard for webhook delivery logs
3. Use Stripe CLI for local webhook testing
4. Verify environment variables are set correctly

## Security Notes

- Never expose your Stripe secret key in client-side code
- Always use HTTPS for webhook endpoints
- Validate webhook signatures
- Use environment variables for sensitive data
- Regularly rotate API keys

## Support

- Stripe Documentation: [https://stripe.com/docs](https://stripe.com/docs)
- Supabase Edge Functions: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- WhatFly Support: whatflyfishing@gmail.com
