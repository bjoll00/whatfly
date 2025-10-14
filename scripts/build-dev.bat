@echo off
REM WhatFly Development Build Script for Windows
REM This script builds a development client with all native features

echo 🎣 WhatFly Development Build Setup
echo ==================================

REM Check if EAS CLI is installed
eas --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ EAS CLI not found. Installing...
    npm install -g @expo/eas-cli
) else (
    echo ✅ EAS CLI found
)

REM Check if logged in to Expo
echo 🔐 Checking Expo login status...
eas whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Expo. Please login:
    eas login
) else (
    echo ✅ Logged in to Expo
)

echo.
echo 📱 Choose your platform:
echo 1) iOS
echo 2) Android
echo 3) Both
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo 🍎 Building for iOS...
    eas build --profile development --platform ios
) else if "%choice%"=="2" (
    echo 🤖 Building for Android...
    eas build --profile development --platform android
) else if "%choice%"=="3" (
    echo 📱 Building for both platforms...
    eas build --profile development --platform ios
    eas build --profile development --platform android
) else (
    echo ❌ Invalid choice
    exit /b 1
)

echo.
echo ✅ Build started!
echo 📋 Check build status with: eas build:list
echo 📱 Install the app on your device when build completes
echo 🚀 Start development server with: npx expo start --dev-client


