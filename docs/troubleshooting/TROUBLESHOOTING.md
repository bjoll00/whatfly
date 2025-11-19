# Troubleshooting API Errors

## Common Issues and Solutions

### Issue: "Cannot connect to backend server" or "Network error"

**Symptoms:**
- Weather data not loading
- Water conditions not loading
- API request errors in console

**Solution:**
1. **Start the backend server:**
   ```bash
   cd backend
   npm install  # First time only
   npm run dev
   ```
   You should see: `✅ Server running on http://localhost:3001`

2. **Verify backend is running:**
   - Open browser: http://localhost:3001/health
   - Should see: `{"status":"ok"}`

### Issue: "Weather API is not configured" or "Service unavailable"

**Symptoms:**
- Backend running but returns 503 errors
- "Weather API is not configured" error

**Solution:**
1. **Create/update backend `.env` file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Add your API key to `.env`:**
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

3. **Get a free OpenWeatherMap API key:**
   - Visit: https://openweathermap.org/api
   - Sign up for free account
   - Copy your API key
   - Paste it in `backend/.env`

4. **Restart backend server** after adding API key

### Issue: CORS errors

**Symptoms:**
- "Blocked by CORS policy" errors
- Backend receives request but blocks it

**Solution:**
1. **Check backend `server.js` CORS configuration**
2. **For mobile testing:** The backend is configured to allow requests with no origin (mobile apps)
3. **For web testing:** Ensure your Expo web URL is in the `allowedOrigins` array

### Issue: Frontend can't find backend

**Symptoms:**
- "Cannot connect to backend server at http://localhost:3001"

**Solution:**
1. **Check `API_BASE_URL` in `lib/apiConfig.ts`**
   - Default: `http://localhost:3001`
   - For mobile devices on same network: Use your computer's IP (e.g., `http://192.168.1.100:3001`)

2. **Create frontend `.env` file (optional):**
   ```bash
   # In project root
   echo "EXPO_PUBLIC_API_BASE_URL=http://localhost:3001" > .env
   ```

3. **For mobile device testing:**
   - Find your computer's IP address:
     - Windows: `ipconfig` (look for IPv4 Address)
     - Mac/Linux: `ifconfig` or `ip addr`
   - Use that IP in `.env`:
     ```env
     EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3001
     ```
   - Restart Expo dev server after changing `.env`

### Quick Diagnostic Commands

```bash
# Check if backend is running
curl http://localhost:3001/health

# Check backend logs
# Look at the terminal where you ran `npm run dev`

# Check frontend API config
# Open lib/apiConfig.ts and verify API_BASE_URL

# Test backend endpoint directly
curl "http://localhost:3001/api/weather/current?lat=40.7128&lon=-74.0060"
```

### Still Having Issues?

1. **Check backend logs** - Look for error messages
2. **Check browser/mobile console** - Look for API errors
3. **Verify API key** - Make sure it's correctly set in `backend/.env`
4. **Verify backend is running** - Port 3001 should be listening

