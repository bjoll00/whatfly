# 📱 iOS Development Build Guide

## Overview
This guide will help you create and install a development build of WhatFly on your iPhone for testing.

## 🎯 What You'll Get
- A development client installed on your iPhone
- Ability to test the app with real-time reload
- Full access to all features including Mapbox
- Test water conditions, fly suggestions, and all new features

---

## 📋 Prerequisites

### 1. Apple Developer Account
- **Free Account**: Works for personal testing (7-day certificate)
- **Paid Account** ($99/year): Recommended for longer testing periods

### 2. Your iPhone UDID
You'll need your device's UDID (Unique Device Identifier):

**Option A - Via iPhone Settings:**
1. Connect iPhone to Mac
2. Open Finder (or iTunes on Windows)
3. Select your iPhone
4. Click on the serial number to reveal UDID
5. Copy the UDID

**Option B - Via EAS CLI:**
```bash
eas device:create
```
This will generate a registration URL you can open on your iPhone.

### 3. Required Tools
```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login to Expo
eas login
```

---

## 🚀 Quick Start (Recommended)

### Option 1: Use the Build Script
```bash
cd scripts
build-ios-dev.bat
```

The script will:
1. Check prerequisites
2. Log you into EAS
3. Start the iOS build
4. Provide installation instructions

---

## 🔧 Manual Build Process

### Step 1: Login to EAS
```bash
eas login
```
Use your Expo account credentials.

### Step 2: Register Your Device

**If you haven't already:**
```bash
eas device:create
```

This will give you a URL like:
```
https://expo.dev/accounts/[username]/devices/create
```

1. Open this URL on your iPhone
2. Tap "Register Device"
3. Install the profile
4. Go to Settings > General > VPN & Device Management
5. Install the profile
6. Your device is now registered!

### Step 3: Configure Your Apple Account

EAS will prompt you for:
- **Apple ID**: Your Apple Developer account email
- **Apple ID Password**: Your password (or app-specific password if using 2FA)

The system will automatically:
- Generate certificates
- Create provisioning profiles
- Register your device

### Step 4: Start the Build
```bash
eas build --profile development --platform ios
```

**Expected build time**: 15-20 minutes

You'll see output like:
```
✔ Build complete!
Build details: https://expo.dev/accounts/[username]/projects/whatfly-fishing-app/builds/[build-id]

Install the build on your device:
https://expo.dev/artifacts/[build-id]
```

---

## 📲 Installing on Your iPhone

### Method 1: Direct Download (Recommended)
1. **Open the install link** from the build output on your iPhone
2. **Tap Install** when prompted
3. **Trust the Developer**:
   - Go to Settings > General > VPN & Device Management
   - Tap your developer profile
   - Tap "Trust [Your Name]"
4. **Open WhatFly** from your home screen

### Method 2: QR Code
1. Go to the build URL on your computer
2. Scan the QR code with your iPhone camera
3. Follow the installation prompts

### Method 3: Via Expo Dashboard
1. Go to https://expo.dev
2. Navigate to Projects > WhatFly
3. Click "Builds"
4. Find your development build
5. Tap "Install" on your iPhone

---

## 🧪 Testing the App

### Start the Development Server
```bash
npx expo start --dev-client
```

You'll see:
```
› Metro waiting on exp+whatfly-fishing-app://expo-development-client/?url=http://[IP]:8081
› Scan the QR code above to open the project in a development build
```

### Connect Your iPhone
**Option 1 - QR Code:**
1. Open Camera app on iPhone
2. Scan the QR code
3. Tap the notification
4. App loads with live reload!

**Option 2 - Same Network:**
1. Make sure iPhone and computer are on same WiFi
2. Open WhatFly app on iPhone
3. It should auto-connect
4. Or manually enter the URL

### Testing Features
Now you can test:
- ✅ Real GPS location detection
- ✅ Mapbox maps with Utah fishing spots
- ✅ Real-time water conditions
- ✅ Enhanced fly suggestions
- ✅ Time-of-day recommendations (try changing system time!)
- ✅ Mouse patterns at night
- ✅ All new features

---

## 🔄 Updating the Build

### For Code Changes:
**No rebuild needed!** Just:
```bash
npx expo start --dev-client
```
Changes sync automatically with live reload.

### For Native Changes (rare):
If you modify:
- `app.json` (native settings)
- Add new native modules
- Change permissions

Then rebuild:
```bash
eas build --profile development --platform ios
```

---

## 🐛 Troubleshooting

### "Unable to Install App"
**Solution**: Trust the developer profile
- Settings > General > VPN & Device Management
- Tap your profile
- Tap "Trust"

### "App Keeps Crashing"
**Solution**: Check Metro bundler is running
```bash
npx expo start --dev-client --clear
```

### "Could Not Connect to Development Server"
**Solutions**:
1. Ensure iPhone and computer on same WiFi
2. Check firewall isn't blocking port 8081
3. Manually enter the URL in the app

### "Certificate Expired" (Free Account)
**Issue**: Free Apple accounts have 7-day certificates

**Solutions**:
1. Rebuild the app every 7 days
2. Or upgrade to paid developer account ($99/year)

### "Device Not Registered"
**Solution**: Register your device
```bash
eas device:create
```

---

## 📊 Build Profiles Explained

### Development Profile (Current)
```json
"development": {
  "developmentClient": true,
  "distribution": "internal",
  "ios": {
    "simulator": false,
    "buildConfiguration": "Debug"
  }
}
```

**Features**:
- ✅ Live reload
- ✅ Debug logging
- ✅ Development client
- ✅ Fast iteration
- ❌ Slower performance
- ❌ Larger app size

**Use for**: Daily testing and development

### Preview Profile
```bash
eas build --profile preview --platform ios
```

**Features**:
- ✅ Production-like performance
- ✅ Smaller size
- ❌ No live reload
- ❌ Must rebuild for changes

**Use for**: Pre-release testing

### Production Profile
```bash
eas build --profile production --platform ios
```

**Features**:
- ✅ App Store ready
- ✅ Optimized performance
- ✅ Smallest size

**Use for**: Final App Store submission

---

## 💡 Pro Tips

### 1. Device Registration in Bulk
Register multiple devices at once:
```bash
eas device:create
```
Share the link with beta testers!

### 2. Build Notifications
Get notified when build completes:
- EAS sends email
- Check https://expo.dev/builds

### 3. Build Logs
If build fails, check logs:
```bash
eas build:view [build-id]
```

### 4. Local Testing First
Before building for iOS, test on:
1. Web (`npx expo start --web`)
2. iOS Simulator (if you have Mac)
3. Then build for device

### 5. Version Control
Commit changes before building:
```bash
git add .
git commit -m "Ready for iOS build"
```

---

## 📱 Testing Checklist

Once installed, test these features:

### Basic Functionality
- [ ] App launches successfully
- [ ] Navigation between tabs works
- [ ] User can sign up/login (if applicable)

### Location Features
- [ ] GPS location detected accurately
- [ ] Current location button works
- [ ] Location picker opens and works

### Map Features
- [ ] Mapbox map loads and displays
- [ ] Utah fishing spot buttons work
- [ ] Tapping map locations shows data
- [ ] Water conditions display

### Fly Suggestions
- [ ] Quick suggest works
- [ ] Fly suggestions load
- [ ] Water conditions show in suggestions
- [ ] Reasons are displayed
- [ ] Real-time data indicators show

### Time-Based Features
- [ ] Change time of day → different flies
- [ ] Night mode → mouse patterns appear
- [ ] Morning → PMDs highly ranked
- [ ] Afternoon → hoppers prioritized

### Water Conditions
- [ ] Utah locations show UTAH_DATABASE source
- [ ] Flow rates displayed correctly
- [ ] Water temperature shows
- [ ] Gauge height displays
- [ ] Condition ratings appear

---

## 🎓 Next Steps

After successful installation:

1. **Share with Beta Testers**:
   ```bash
   eas device:create
   ```
   Share the registration URL

2. **Monitor Crashes**:
   - Check Metro bundler logs
   - Use `console.log` for debugging
   - Errors appear in terminal

3. **Iterate Quickly**:
   - Make code changes
   - Save → Auto reload on device
   - No rebuild needed!

4. **Prepare for App Store**:
   - Test thoroughly
   - Fix all issues
   - Build with production profile
   - Submit via EAS Submit

---

## 📞 Support

### EAS Build Status
Check build status anytime:
```bash
eas build:list
```

### View Specific Build
```bash
eas build:view [build-id]
```

### Cancel Build
```bash
eas build:cancel [build-id]
```

---

## 🎉 Success!

Once you see WhatFly on your iPhone home screen with real-time features working, you're ready to:

1. ✅ Test all new water condition features
2. ✅ Try the enhanced fly suggestions
3. ✅ Explore Utah fishing spots
4. ✅ Test mouse patterns at night
5. ✅ Verify time-of-day recommendations

**Happy fishing and testing! 🎣📱**

