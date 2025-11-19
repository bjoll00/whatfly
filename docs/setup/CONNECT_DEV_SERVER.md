# Connect to Development Server

## Quick Connection Steps

### Option 1: Connect via Expo Go App (Recommended)

1. **Make sure both servers are running:**
   ```bash
   # Terminal 1: Backend (should already be running)
   cd backend
   npm run dev
   
   # Terminal 2: Expo (should already be running)
   npm start
   ```

2. **On your phone:**
   - Install **Expo Go** app from App Store (iOS) or Google Play (Android)
   - Make sure your phone is on the **same WiFi network** as your computer
   - Open Expo Go app
   - Scan the QR code shown in your terminal/browser

3. **If QR code doesn't appear:**
   - Press `s` in the Expo terminal to switch to web mode
   - Or press `a` for Android, `i` for iOS
   - The URL should be visible in the terminal

### Option 2: Tunnel Connection (Different WiFi)

If your phone is on a different network:

1. In Expo terminal, press `s` to switch to tunnel mode
2. Scan the new QR code that appears

### Option 3: Manual Connection

1. **Find your computer's IP address:**
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" under your WiFi adapter
   # Example: 192.168.0.98
   ```

2. **Update `.env` file in project root:**
   ```
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP_ADDRESS:3001
   ```
   Example: `EXPO_PUBLIC_API_BASE_URL=http://192.168.0.98:3001`

3. **Restart Expo server:**
   - Press `Ctrl+C` in the Expo terminal
   - Run `npm start` again

4. **In Expo Go app:**
   - Tap "Enter URL manually"
   - Enter: `exp://YOUR_IP_ADDRESS:8081`
   - Example: `exp://192.168.0.98:8081`

## Troubleshooting

### "Cannot connect to backend"
- Make sure backend is running: `cd backend && npm run dev`
- Check that `EXPO_PUBLIC_API_BASE_URL` in `.env` matches your IP address
- Restart Expo after changing `.env`

### "Network request failed"
- Verify your phone and computer are on the same WiFi
- Check firewall isn't blocking ports 3001 or 8081
- Try tunnel mode (press `s` in Expo terminal)

### "Expo Go can't find the server"
- Make sure Expo dev server is running (`npm start`)
- Check that port 8081 is not blocked
- Try restarting Expo: Press `Ctrl+C`, then `npm start`

### Port Already in Use
If you see "port already in use":
```bash
# Kill the process using the port
# Windows PowerShell:
netstat -ano | findstr :8081
# Find the PID, then:
taskkill /PID <PID> /F

# Then restart:
npm start
```

## Current Server Status

- ✅ Backend: Running on port 3001
- ✅ Expo: Running on port 8081

Your IP address should be: **192.168.0.98** (based on network connections)

## Quick Commands

```bash
# Start backend
cd backend
npm run dev

# Start Expo (in project root)
npm start

# Check if servers are running
netstat -ano | findstr ":3001 :8081"
```

