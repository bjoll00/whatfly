# Fix API Request Errors

## Quick Fix Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Add Your API Key
Edit `backend/.env` and replace `your_openweather_api_key_here` with your actual OpenWeatherMap API key.

Get a free key from: https://openweathermap.org/api

### 3. Start the Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
🚀 WhatFly Backend API running on port 3001
✅ All required environment variables are set
```

### 4. Verify Backend is Working
Open in browser: http://localhost:3001/health

Should see: `{"status":"ok"}`

### 5. Restart Your Expo App
The frontend should now be able to connect to the backend.

---

## Common Error Messages

**"Cannot connect to backend server"**
→ Backend is not running. Start it with `cd backend && npm run dev`

**"Weather API is not configured"**
→ Missing API key in `backend/.env`. Add your `OPENWEATHER_API_KEY`

**"Network error" or CORS errors**
→ Make sure backend is running and CORS is configured correctly

---

## For Mobile Device Testing

If testing on a physical device (not emulator):

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   ```

2. Create `.env` in project root:
   ```
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3001
   ```

3. Restart Expo dev server after creating `.env`

---

## Full Setup Example

```bash
# Terminal 1: Backend
cd backend
npm install
# Edit .env and add your OPENWEATHER_API_KEY
npm run dev

# Terminal 2: Frontend
npm start
```

Both should be running for the app to work!

