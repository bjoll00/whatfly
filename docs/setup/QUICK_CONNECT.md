# Quick Connect to Dev Server

## Your Setup Status
- ✅ Backend: Running on port 3001
- ✅ Expo: Running on port 8081  
- ✅ IP Address: 192.168.0.98
- ✅ .env configured: http://192.168.0.98:3001

## Steps to Connect

### Step 1: Check Expo Terminal
Look at your Expo terminal window. You should see:
```
Metro waiting on exp://192.168.0.98:8081
```

If you see `exp://localhost:8081`, you need to restart Expo.

### Step 2: Connect via Expo Go App

**Option A: Scan QR Code**
1. Open **Expo Go** app on your phone
2. Tap "Scan QR Code"
3. Scan the QR code from your terminal
4. Wait for app to load

**Option B: Enter URL Manually**
1. Open **Expo Go** app
2. Tap "Enter URL manually"
3. Type: `exp://192.168.0.98:8081`
4. Tap "Connect"

### Step 3: If Still Not Working

**Restart Expo Server:**
1. In Expo terminal, press `Ctrl+C` to stop
2. Run: `npm start`
3. Look for the QR code or connection URL
4. Make sure it shows `exp://192.168.0.98:8081` (not localhost)

**Check Network:**
- Make sure phone and computer are on same WiFi
- Try disabling VPN if you're using one
- Check Windows Firewall isn't blocking port 8081

## Troubleshooting Commands

```bash
# Check if Expo is running
netstat -ano | findstr :8081

# Restart Expo
npm start

# Check backend
curl http://192.168.0.98:3001/health
```

## Still Having Issues?

1. **Try tunnel mode:**
   - In Expo terminal, press `s`
   - Select "tunnel" option
   - Scan the new QR code

2. **Check firewall:**
   - Windows might be blocking port 8081
   - Allow Node.js through Windows Firewall

3. **Try different network:**
   - Switch phone to same WiFi network as computer
   - Or use tunnel mode for different networks

