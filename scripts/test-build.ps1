# WhatFly Build Testing Script
# This script helps you test your production builds before store submission

Write-Host "🎣 WhatFly Build Testing Script" -ForegroundColor Cyan
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
Write-Host "🧪 Testing build configuration..." -ForegroundColor Yellow

# Check app.json configuration
Write-Host "Checking app.json configuration..." -ForegroundColor White
if (Test-Path "app.json") {
    $appConfig = Get-Content "app.json" | ConvertFrom-Json
    Write-Host "✅ App name: $($appConfig.expo.name)" -ForegroundColor Green
    Write-Host "✅ Version: $($appConfig.expo.version)" -ForegroundColor Green
    Write-Host "✅ iOS Bundle ID: $($appConfig.expo.ios.bundleIdentifier)" -ForegroundColor Green
    Write-Host "✅ Android Package: $($appConfig.expo.android.package)" -ForegroundColor Green
} else {
    Write-Host "❌ app.json not found!" -ForegroundColor Red
    exit 1
}

# Check EAS configuration
Write-Host "Checking EAS configuration..." -ForegroundColor White
if (Test-Path "eas.json") {
    Write-Host "✅ EAS configuration found" -ForegroundColor Green
} else {
    Write-Host "❌ eas.json not found!" -ForegroundColor Red
    exit 1
}

# Check required assets
Write-Host "Checking required assets..." -ForegroundColor White
$requiredAssets = @(
    "assets/images/WhatFlyFishingLogo.png",
    "assets/images/adaptive-icon.png",
    "assets/images/splash-icon.png"
)

foreach ($asset in $requiredAssets) {
    if (Test-Path $asset) {
        Write-Host "✅ $asset" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $asset" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🚀 Ready to build! Choose an option:" -ForegroundColor Cyan
Write-Host "1. Build for iOS (App Store)" -ForegroundColor White
Write-Host "2. Build for Android (Google Play)" -ForegroundColor White
Write-Host "3. Build for both platforms" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "Building for iOS..." -ForegroundColor Yellow
        eas build --platform ios --profile production
    }
    "2" {
        Write-Host "Building for Android..." -ForegroundColor Yellow
        eas build --platform android --profile production
    }
    "3" {
        Write-Host "Building for both platforms..." -ForegroundColor Yellow
        eas build --platform all --profile production
    }
    "4" {
        Write-Host "Goodbye! 👋" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Build process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Download the build from the EAS dashboard" -ForegroundColor White
Write-Host "2. Test the build on a physical device" -ForegroundColor White
Write-Host "3. If everything works, proceed with store submission" -ForegroundColor White
Write-Host ""
Write-Host "📖 See STORE_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan
