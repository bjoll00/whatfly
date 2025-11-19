# Getting Your OpenWeatherMap API Key

## Step-by-Step Instructions

1. **Visit OpenWeatherMap:**
   - Go to: https://openweathermap.org/api
   - Click "Sign Up" (top right) if you don't have an account
   - Free tier is sufficient for development

2. **Get Your API Key:**
   - After signing up, go to: https://home.openweathermap.org/api_keys
   - Click "Generate" to create a new API key
   - Copy the API key (it looks like: `abc123def456ghi789`)

3. **Add API Key to Backend:**
   - Open `backend/.env` file
   - Find the line: `OPENWEATHER_API_KEY=your_openweather_api_key_here`
   - Replace `your_openweather_api_key_here` with your actual API key:
     ```
     OPENWEATHER_API_KEY=abc123def456ghi789
     ```
   - Save the file

4. **Restart Backend Server:**
   - The backend will auto-reload if using `npm run dev`
   - Or stop and restart: `Ctrl+C` then `npm run dev` again

5. **Verify It Works:**
   - Open: http://localhost:3001/health
   - Should show: `{"status":"ok"}`
   - Test weather endpoint: http://localhost:3001/api/weather/current?lat=40.7128&lon=-74.0060
   - Should return weather data (not an error)

---

## Current Status

✅ Backend dependencies installed  
✅ Backend server running on port 3001  
✅ Health check working  
⏳ **Waiting for API key** - Add it to `backend/.env` and restart

---

## Notes

- Free tier includes: 60 calls/minute, 1,000,000 calls/month
- API key may take 10-15 minutes to activate after creation
- Keep your API key secret - never commit it to git (it's already in `.gitignore`)

