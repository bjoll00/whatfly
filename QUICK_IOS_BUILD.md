# 🚀 Quick iOS Build Reference

## First Time Setup (5 minutes)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Register your iPhone
eas device:create
# Open the URL on your iPhone and follow prompts
```

---

## Build Development Client (15-20 min)

```bash
# Option 1: Use script
cd scripts
build-ios-dev.bat

# Option 2: Manual command
eas build --profile development --platform ios
```

**Wait for build to complete (~15-20 minutes)**

---

## Install on iPhone

1. **Open install link** from build output on your iPhone
2. **Tap Install**
3. **Trust developer**:
   - Settings > General > VPN & Device Management
   - Tap your profile > Trust
4. **Done!** App is now on your home screen

---

## Start Testing

```bash
# Start dev server
npx expo start --dev-client

# Scan QR code with iPhone camera
# Or press 'i' to open directly
```

**That's it! Your app will auto-reload when you save changes** ✨

---

## Common Commands

```bash
# Check build status
eas build:list

# View specific build
eas build:view [build-id]

# Register new device
eas device:create

# Start dev server
npx expo start --dev-client

# Clear cache and restart
npx expo start --dev-client --clear
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Unable to install" | Settings > General > VPN & Device Management > Trust |
| App crashes on launch | Run `npx expo start --dev-client --clear` |
| Can't connect to server | Ensure iPhone and computer on same WiFi |
| Certificate expired (7 days) | Rebuild app with `eas build --profile development --platform ios` |

---

## Testing Checklist

- [ ] GPS location works
- [ ] Mapbox map displays
- [ ] Utah fishing spots load
- [ ] Water conditions show
- [ ] Fly suggestions work
- [ ] Mouse patterns at night
- [ ] Time-based recommendations

---

**Need help?** See full guide: `IOS_DEVELOPMENT_BUILD_GUIDE.md`

