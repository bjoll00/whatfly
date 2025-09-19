# WhatFly Development Script
# Quick start script for Expo development

Write-Host "🎣 WhatFly Development Script" -ForegroundColor Cyan
Write-Host ""

# Check if Expo CLI is available
try {
    $expoVersion = npx expo --version
    Write-Host "✅ Expo CLI found: $expoVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Expo CLI not found. Installing..." -ForegroundColor Red
    npm install -g @expo/cli
}

Write-Host ""
Write-Host "🚀 Choose your development option:" -ForegroundColor Cyan
Write-Host "1. Start with Expo Go (QR code for phone)" -ForegroundColor White
Write-Host "2. Start with iOS Simulator" -ForegroundColor White
Write-Host "3. Start with Android Emulator" -ForegroundColor White
Write-Host "4. Start with Web" -ForegroundColor White
Write-Host "5. Check app health" -ForegroundColor White
Write-Host "6. Install/update dependencies" -ForegroundColor White
Write-Host "7. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-7)"

switch ($choice) {
    "1" {
        Write-Host "Starting Expo Go development server..." -ForegroundColor Yellow
        Write-Host "📱 Scan the QR code with Expo Go app on your phone" -ForegroundColor Cyan
        npx expo start
    }
    "2" {
        Write-Host "Starting iOS Simulator..." -ForegroundColor Yellow
        npx expo start --ios
    }
    "3" {
        Write-Host "Starting Android Emulator..." -ForegroundColor Yellow
        npx expo start --android
    }
    "4" {
        Write-Host "Starting Web development..." -ForegroundColor Yellow
        npx expo start --web
    }
    "5" {
        Write-Host "Checking app health..." -ForegroundColor Yellow
        npx expo doctor
        Write-Host ""
        Write-Host "Checking dependencies..." -ForegroundColor Yellow
        npx expo install --check
    }
    "6" {
        Write-Host "Installing/updating dependencies..." -ForegroundColor Yellow
        npm install
        npx expo install
    }
    "7" {
        Write-Host "Goodbye! Happy coding! 👋" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Development session started!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "- Press 'r' to reload the app" -ForegroundColor White
Write-Host "- Press 'm' to toggle the menu" -ForegroundColor White
Write-Host "- Press 'd' to open developer tools" -ForegroundColor White
Write-Host "- Press 'j' to open debugger" -ForegroundColor White
Write-Host "- Press 'Ctrl+C' to stop the server" -ForegroundColor White
