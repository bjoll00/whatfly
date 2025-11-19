@echo off
REM Build iOS Development Client for WhatFly
echo.
echo ========================================
echo Building iOS Development Client
echo ========================================
echo.
echo This will create a development build for iOS that you can install on your iPhone
echo.
echo Prerequisites:
echo 1. You must be logged into your Expo account (eas login)
echo 2. Your Apple Developer account must be set up
echo 3. You'll need to register your device UDID
echo.
pause

echo.
echo Step 1: Checking EAS CLI...
call eas --version
if %errorlevel% neq 0 (
    echo EAS CLI not found! Installing...
    call npm install -g eas-cli
)

echo.
echo Step 2: Logging into EAS (if not already logged in)...
call eas whoami
if %errorlevel% neq 0 (
    echo Please log in to your Expo account:
    call eas login
)

echo.
echo Step 3: Building iOS development client...
echo This will take 10-20 minutes and run on Expo's servers
echo.
call eas build --profile development --platform ios

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo To install on your iPhone:
echo 1. Open the link from the build output on your iPhone
echo 2. Or go to https://expo.dev/accounts/[your-username]/projects/whatfly-fishing-app/builds
echo 3. Scan the QR code or download directly
echo 4. Trust the developer profile in Settings > General > VPN & Device Management
echo.
echo After installation:
echo 1. Run: npm start
echo 2. Press 'i' to open on iOS
echo 3. Or scan the QR code with your iPhone camera
echo.
pause

