# WhatFly App Deployment Script
# This script helps you build and deploy your app to both stores

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("ios", "android", "all")]
    [string]$Platform,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "preview", "production")]
    [string]$Profile = "production"
)

Write-Host "🎣 WhatFly App Deployment Script" -ForegroundColor Cyan
Write-Host "Platform: $Platform" -ForegroundColor Yellow
Write-Host "Profile: $Profile" -ForegroundColor Yellow
Write-Host ""

# Check if EAS CLI is installed
try {
    $easVersion = eas --version
    Write-Host "✅ EAS CLI found: $easVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g @expo/eas-cli
}

# Check if logged in to EAS
try {
    $user = eas whoami
    Write-Host "✅ Logged in as: $user" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to EAS. Please run: eas login" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting build process..." -ForegroundColor Cyan

# Build based on platform
switch ($Platform) {
    "ios" {
        Write-Host "Building for iOS..." -ForegroundColor Yellow
        eas build --platform ios --profile $Profile
    }
    "android" {
        Write-Host "Building for Android..." -ForegroundColor Yellow
        eas build --platform android --profile $Profile
    }
    "all" {
        Write-Host "Building for both platforms..." -ForegroundColor Yellow
        eas build --platform all --profile $Profile
    }
}

Write-Host ""
Write-Host "✅ Build process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Download the build artifacts from the EAS dashboard" -ForegroundColor White
Write-Host "2. For iOS: Upload to App Store Connect using Xcode" -ForegroundColor White
Write-Host "3. For Android: Upload to Google Play Console" -ForegroundColor White
Write-Host "4. Complete your store listings and submit for review" -ForegroundColor White
Write-Host ""
Write-Host "📖 See STORE_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan
