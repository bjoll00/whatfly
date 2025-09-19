# WhatFly App Store Readiness Checklist

## ✅ Completed Items

### App Configuration
- [x] Bundle identifiers configured (`com.whatfly.fishing`)
- [x] Version numbers set (1.0.0)
- [x] App metadata added (description, keywords, category)
- [x] iOS and Android permissions configured
- [x] EAS build profiles configured for production
- [x] App icons configured
- [x] Splash screen configured

### Build Configuration
- [x] EAS project ID configured
- [x] Production build profiles for both platforms
- [x] Android AAB build type for Play Store
- [x] iOS Release build configuration
- [x] Deployment scripts created

## ⚠️ Required Before Store Submission

### 1. App Store Assets (HIGH PRIORITY)
- [ ] **iOS App Store Screenshots** (Required)
  - iPhone 6.7" (1290 x 2796 pixels) - 3-10 screenshots
  - iPhone 6.5" (1242 x 2688 pixels) - 3-10 screenshots  
  - iPhone 5.5" (1242 x 2208 pixels) - 3-10 screenshots
  - iPad Pro 12.9" (2048 x 2732 pixels) - 3-10 screenshots
  - iPad Pro 11" (1668 x 2388 pixels) - 3-10 screenshots

- [ ] **Google Play Store Screenshots** (Required)
  - Phone screenshots (16:9 or 9:16 ratio)
  - Tablet screenshots (16:10 or 10:16 ratio)
  - Feature graphic (1024 x 500 pixels)

- [ ] **App Icon Optimization** (Recommended)
  - Ensure 1024x1024 iOS icon is optimized
  - Test adaptive icon on Android

### 2. Developer Accounts (REQUIRED)
- [ ] **Apple Developer Account** ($99/year)
  - Sign up at developer.apple.com
  - Complete enrollment process
  - Set up App Store Connect

- [ ] **Google Play Console Account** ($25 one-time)
  - Sign up at play.google.com/console
  - Complete developer registration
  - Verify identity

### 3. App Store Listings (REQUIRED)
- [ ] **App Store Connect Setup**
  - Create new app listing
  - Complete app information
  - Add screenshots and metadata
  - Set pricing (Free/Paid)
  - Configure availability

- [ ] **Google Play Console Setup**
  - Create app listing
  - Complete store listing details
  - Upload screenshots and graphics
  - Set content rating
  - Configure pricing and distribution

### 4. Testing & Quality Assurance
- [ ] **Production Build Testing**
  - Test iOS build on physical device
  - Test Android build on physical device
  - Verify all features work correctly
  - Test on different screen sizes

- [ ] **Store Compliance**
  - Review Apple App Store Guidelines
  - Review Google Play Developer Policy
  - Ensure app meets all requirements

### 5. Legal & Privacy (REQUIRED)
- [ ] **Privacy Policy** (Required for both stores)
  - Create privacy policy document
  - Host on your website
  - Link in app store listings

- [ ] **Terms of Service** (Recommended)
  - Create terms of service
  - Link in app store listings

- [ ] **App Store Review Guidelines Compliance**
  - Ensure app follows platform guidelines
  - Test for any policy violations

## 🚀 Quick Start Commands

### Build for Production
```bash
# Build for both platforms
npm run build:all

# Build for iOS only
npm run build:ios

# Build for Android only
npm run build:android
```

### Submit to Stores (After builds complete)
```bash
# Submit to iOS App Store
npm run submit:ios

# Submit to Google Play Store
npm run submit:android
```

## 📱 Screenshot Requirements

### iOS Screenshots Needed:
1. **Main app screen** - showing fly selection interface
2. **Catch log screen** - showing fishing history
3. **AI recommendation screen** - showing fly suggestions
4. **Settings/profile screen** - showing user options
5. **Onboarding screen** - showing app introduction

### Android Screenshots Needed:
1. **Main app screen** - showing fly selection interface
2. **Catch log screen** - showing fishing history
3. **AI recommendation screen** - showing fly suggestions
4. **Settings/profile screen** - showing user options

## 🎯 Next Immediate Steps

1. **Create app screenshots** (highest priority)
2. **Set up developer accounts** (if not done)
3. **Run production builds** to test
4. **Create store listings** with screenshots
5. **Submit for review**

## 📞 Support Resources

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)

---

**Estimated time to store submission: 2-3 days** (assuming screenshots are created and developer accounts are set up)
