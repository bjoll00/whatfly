# Secure API Integration - Complete Setup

This document summarizes the secure API integration setup for the WhatFly app.

## 🎯 Goal Achieved

✅ **API keys are now stored securely on the backend**  
✅ **Frontend only communicates with your backend API**  
✅ **No API keys exposed in frontend code**  
✅ **CORS configured to protect your endpoints**

---

## 📁 Project Structure

```
whatfly/
├── backend/                          # Backend API Server
│   ├── server.js                    # Main Express server
│   ├── routes/
│   │   ├── weather.js               # Weather API routes
│   │   └── waterConditions.js       # Water conditions API routes
│   ├── package.json                 # Backend dependencies
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore                   # Git ignore (includes .env)
│   ├── vercel.json                  # Vercel deployment config
│   └── README.md                    # Backend documentation
│
├── lib/
│   ├── apiConfig.ts                 # Frontend API configuration
│   ├── weatherService.ts            # Updated to use backend
│   └── waterConditionsService.ts    # Updated to use backend
│
└── examples/
    └── WeatherExample.tsx           # Example React component
```

---

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env`:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
OPENWEATHER_API_KEY=your_actual_api_key_here
```

### 3. Start Backend Server

```bash
npm run dev    # Development with auto-reload
npm start      # Production mode
```

Server runs on `http://localhost:3001`

---

## 📱 Frontend Setup

### 1. Configure API Base URL

Create or update `.env` in the root directory:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

For production, update `lib/apiConfig.ts`:

```typescript
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_BASE_URL || 
  'https://your-backend.vercel.app'; // Your production backend URL
```

### 2. Frontend Now Uses Backend

The frontend services (`weatherService.ts`, `waterConditionsService.ts`) now automatically call your backend API instead of external APIs directly.

**No code changes needed in your components!** They continue to work as before.

---

## 🔐 Security Features

### Backend Security

1. **Environment Variables** - API keys stored in `.env` (never committed to Git)
2. **CORS Protection** - Only allows requests from authorized origins
3. **Response Filtering** - Removes sensitive data before sending to frontend
4. **Error Handling** - Errors don't expose internal details

### Frontend Security

1. **No API Keys** - All keys removed from frontend code
2. **Backend Proxy** - All external API calls go through your backend
3. **Centralized Config** - API endpoints defined in `lib/apiConfig.ts`

---

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Weather
```
GET /api/weather/current?lat={lat}&lon={lon}
GET /api/weather/forecast?lat={lat}&lon={lon}&days={days}
```

### Water Conditions
```
GET /api/water-conditions/current?lat={lat}&lon={lon}
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `cd backend && vercel`
3. Add environment variables in Vercel dashboard
4. Update frontend `API_BASE_URL` to your Vercel URL

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## ✅ Verification Checklist

- [ ] Backend `.env` file created with API keys
- [ ] Backend server starts without errors
- [ ] Frontend `.env` has `EXPO_PUBLIC_API_BASE_URL` set
- [ ] Health check endpoint responds: `curl http://localhost:3001/health`
- [ ] No API keys in frontend code (checked with grep)
- [ ] CORS allows your frontend URL
- [ ] Production deployment configured with environment variables

---

## 🧪 Testing

### Test Backend

```bash
# Health check
curl http://localhost:3001/health

# Weather
curl "http://localhost:3001/api/weather/current?lat=40.7128&lon=-74.0060"

# Water conditions
curl "http://localhost:3001/api/water-conditions/current?lat=40.7128&lon=-74.0060"
```

### Test Frontend

1. Start backend: `cd backend && npm run dev`
2. Start Expo: `npm start`
3. Select a location on the map
4. Verify weather and water data appear correctly

---

## 🔍 Troubleshooting

**Backend won't start:**
- Check Node.js version (18+ required)
- Verify `.env` file exists in `backend/` directory
- Check port 3001 isn't in use

**Frontend can't connect:**
- Verify backend is running on correct port
- Check `EXPO_PUBLIC_API_BASE_URL` matches backend URL
- For mobile devices, use your computer's IP address instead of localhost

**CORS errors:**
- Update `FRONTEND_URL` in backend `.env`
- Check CORS configuration in `backend/server.js`

**API errors:**
- Verify API keys in backend `.env` are correct
- Check backend logs for detailed error messages

---

## 📚 Additional Resources

- [Backend README](./backend/README.md) - Detailed backend documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guides
- [examples/WeatherExample.tsx](./examples/WeatherExample.tsx) - Complete component example

---

## 🎉 Summary

Your app is now securely configured:

1. ✅ Backend server handles all external API calls
2. ✅ API keys safely stored in environment variables
3. ✅ Frontend only communicates with your backend
4. ✅ No sensitive data exposed in frontend code
5. ✅ Ready for production deployment

