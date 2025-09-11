# WhatFly Deployment Guide

## 🌐 Web Deployment (Recommended First)

### Option 1: Vercel (Easiest)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Build for web**:
   ```bash
   npx expo export:web
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Choose the `dist` folder
   - Deploy!

### Option 2: Netlify

1. **Build for web**:
   ```bash
   npx expo export:web
   ```

2. **Go to [netlify.com](https://netlify.com)**
3. **Drag and drop** the `dist` folder
4. **Your app is live!**

### Option 3: GitHub Pages

1. **Build for web**:
   ```bash
   npx expo export:web
   ```

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Enable GitHub Pages** in repository settings
4. **Select source**: Deploy from a branch
5. **Choose**: `main` branch, `/dist` folder

## 📱 Mobile App Deployment

### Option 1: Expo Application Services (EAS) - Recommended

1. **Install EAS CLI**:
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS**:
   ```bash
   eas build:configure
   ```

4. **Build for Android**:
   ```bash
   eas build --platform android
   ```

5. **Build for iOS**:
   ```bash
   eas build --platform ios
   ```

6. **Submit to stores**:
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

### Option 2: Expo Go (Development/Testing)

1. **Start development server**:
   ```bash
   npm start
   ```

2. **Share QR code** with users
3. **Users scan with Expo Go app**

## 🔧 Pre-Deployment Checklist

### ✅ Required Steps:

1. **Update app.json** with production settings:
   ```json
   {
     "expo": {
       "name": "WhatFly",
       "slug": "whatfly",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash-icon.png",
         "resizeMode": "contain",
         "backgroundColor": "#25292e"
       },
       "web": {
         "favicon": "./assets/favicon.png"
       }
     }
   }
   ```

2. **Test your app**:
   ```bash
   npm run web
   ```

3. **Verify Supabase connection** works in production

4. **Test all features**:
   - User registration/login
   - Fly suggestions
   - Logging fishing trips
   - Popular flies section

## 🚀 Quick Deploy Commands

### For Web (Vercel):
```bash
npx expo export:web
vercel
```

### For Mobile (EAS):
```bash
eas build:configure
eas build --platform all
```

## 📊 Post-Deployment

1. **Monitor usage** in Supabase dashboard
2. **Check analytics** in Vercel/Netlify
3. **Gather user feedback**
4. **Update based on usage data**

## 🎯 Recommended Launch Strategy

1. **Start with web** (Vercel) - fastest to deploy
2. **Share with friends** for testing
3. **Deploy mobile app** (EAS) after web validation
4. **Submit to app stores** for wider distribution

Your app is ready to launch! 🎣
