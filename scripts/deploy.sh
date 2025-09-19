#!/bin/bash

# WhatFly App Deployment Script
# This script helps you build and deploy your app to both stores

PLATFORM=$1
PROFILE=${2:-production}

if [ -z "$PLATFORM" ]; then
    echo "❌ Usage: ./deploy.sh <ios|android|all> [profile]"
    echo "   Profile options: development, preview, production (default: production)"
    exit 1
fi

if [[ "$PLATFORM" != "ios" && "$PLATFORM" != "android" && "$PLATFORM" != "all" ]]; then
    echo "❌ Invalid platform. Use: ios, android, or all"
    exit 1
fi

echo "🎣 WhatFly App Deployment Script"
echo "Platform: $PLATFORM"
echo "Profile: $PROFILE"
echo ""

# Check if EAS CLI is installed
if command -v eas &> /dev/null; then
    EAS_VERSION=$(eas --version)
    echo "✅ EAS CLI found: $EAS_VERSION"
else
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
fi

# Check if logged in to EAS
if eas whoami &> /dev/null; then
    USER=$(eas whoami)
    echo "✅ Logged in as: $USER"
else
    echo "❌ Not logged in to EAS. Please run: eas login"
    exit 1
fi

echo ""
echo "🚀 Starting build process..."

# Build based on platform
case $PLATFORM in
    "ios")
        echo "Building for iOS..."
        eas build --platform ios --profile $PROFILE
        ;;
    "android")
        echo "Building for Android..."
        eas build --platform android --profile $PROFILE
        ;;
    "all")
        echo "Building for both platforms..."
        eas build --platform all --profile $PROFILE
        ;;
esac

echo ""
echo "✅ Build process completed!"
echo ""
echo "Next steps:"
echo "1. Download the build artifacts from the EAS dashboard"
echo "2. For iOS: Upload to App Store Connect using Xcode"
echo "3. For Android: Upload to Google Play Console"
echo "4. Complete your store listings and submit for review"
echo ""
echo "📖 See STORE_DEPLOYMENT_GUIDE.md for detailed instructions"
