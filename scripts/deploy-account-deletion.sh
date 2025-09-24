#!/bin/bash

# Deploy Account Deletion Edge Function
# This script deploys the delete-account function to Supabase

echo "🚀 Deploying Account Deletion Function..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Supabase CLI. Please install manually:"
        echo "   npm install -g supabase"
        exit 1
    fi
else
    VERSION=$(supabase --version)
    echo "✅ Supabase CLI found: $VERSION"
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory."
    echo "   Please run this script from your project root."
    exit 1
fi

# Deploy the function
echo "📦 Deploying delete-account function..."
supabase functions deploy delete-account

if [ $? -eq 0 ]; then
    echo "✅ Account deletion function deployed successfully!"
    echo ""
    echo "🧪 Test the function by:"
    echo "   1. Sign in to your app"
    echo "   2. Go to Settings tab"
    echo "   3. Click 'Delete Account'"
    echo "   4. Follow the confirmation steps"
    echo ""
    echo "📊 Monitor function logs in Supabase Dashboard:"
    echo "   https://supabase.com/dashboard/project/[YOUR_PROJECT]/functions"
else
    echo "❌ Failed to deploy function. Check the error above."
    exit 1
fi
