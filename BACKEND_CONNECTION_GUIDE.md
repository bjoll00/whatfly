# Backend Connection Guide

## Quick Setup Steps

### Step 1: Find Your Computer's IP Address

Your current IP address is: **192.168.0.97**

To verify or find it manually:
```bash
# Windows PowerShell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}
```

### Step 2: Update Frontend .env File

Create or update `.env` in the **project root** (not in backend folder):

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.97:3001
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

**Important:** After changing `.env`, you MUST restart Expo:
1. Press `Ctrl+C` in the Expo terminal
2. Run `npm start` again

### Step 3: Start the Backend Server

In a **separate terminal**:

```bash
cd backend
npm install  # Only needed first time
npm run dev
```

You should see:
```
🚀 WhatFly Backend API running on port 3001
📱 Mobile device URL: http://192.168.0.97:3001
```

### Step 4: Verify Backend is Running

**Option A: From your computer**
Open in browser: `http://localhost:3001/health`
Should return: `{"status":"ok"}`

**Option B: From your phone**
Open in phone browser: `http://192.168.0.97:3001/health`
Should return: `{"status":"ok"}`

### Step 5: Check Backend Configuration

Make sure `backend/.env` exists and has your API keys:

```env
PORT=3001
NODE_ENV=development
OPENWEATHER_API_KEY=your_actual_api_key_here
```

## Troubleshooting

### "Network request failed" Error

**Causes:**
1. Backend not running → Start it with `cd backend && npm run dev`
2. Wrong IP address → Update `.env` with correct IP
3. Firewall blocking → Allow Node.js through Windows Firewall
4. Wrong network → Phone and computer must be on same WiFi

**Fix:**
1. Check backend is running (you should see the server logs)
2. Verify IP address matches your current network IP
3. Restart Expo after changing `.env`
4. Check Windows Firewall settings

### Backend Shows "Cannot GET /health"

**Cause:** Backend server is not running or crashed

**Fix:**
1. Check backend terminal for errors
2. Restart backend: `cd backend && npm run dev`
3. Check if port 3001 is already in use:
   ```bash
   netstat -ano | findstr :3001
   ```

### Phone Can't Connect

**Check:**
1. ✅ Phone and computer on same WiFi network
2. ✅ Backend shows the correct IP address
3. ✅ `.env` file has correct IP (not `localhost`)
4. ✅ Expo restarted after changing `.env`
5. ✅ Backend server is running

### IP Address Changed

If your IP address changes (e.g., after reconnecting to WiFi):

1. Find new IP: `Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}`
2. Update root `.env`: `EXPO_PUBLIC_API_BASE_URL=http://NEW_IP:3001`
3. Restart Expo: Press `Ctrl+C`, then `npm start`

## Testing Connection

### Test from App
1. Select a location on the map
2. Check console logs for connection errors
3. If weather data shows "Weather data unavailable", backend is not connected

### Test from Browser
Open: `http://192.168.0.97:3001/api/weather/current?lat=40.7&lon=-111.9`

Should return weather data (not an error).

## Production Deployment

For production, use a deployed backend URL:
```
EXPO_PUBLIC_API_BASE_URL=https://your-backend.vercel.app
```

See `DEPLOYMENT.md` for deployment instructions.

