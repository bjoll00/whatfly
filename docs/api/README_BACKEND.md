# WhatFly Backend API - Quick Start Guide

This guide will help you set up and run the secure backend API for the WhatFly app.

## 📁 Folder Structure

```
whatfly/
├── backend/                    # Backend API server
│   ├── routes/
│   │   ├── weather.js         # Weather API routes
│   │   └── waterConditions.js # Water conditions API routes
│   ├── server.js              # Main Express server
│   ├── package.json           # Backend dependencies
│   ├── .env.example           # Environment variables template
│   └── README.md              # Backend documentation
│
└── app/                       # Your Expo/React Native app
    └── lib/
        ├── apiConfig.ts       # Frontend API configuration
        └── weatherService.ts  # Updated to use backend API
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env and add your API keys
# OPENWEATHER_API_KEY=your_key_here

# Start the server
npm run dev
```

The backend will run on `http://localhost:3001`

### 2. Frontend Setup

```bash
# In the root directory, create/update .env
echo "EXPO_PUBLIC_API_BASE_URL=http://localhost:3001" > .env

# Start Expo
npm start
```

## 🔐 Security Features

✅ **API Keys on Backend Only** - All external API keys stored in backend environment variables  
✅ **CORS Protection** - Only allows requests from your app domain  
✅ **Response Filtering** - Removes sensitive data before sending to frontend  
✅ **Error Handling** - Proper error handling without exposing internal details  

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Weather
```
GET /api/weather/current?lat={latitude}&lon={longitude}
GET /api/weather/forecast?lat={latitude}&lon={longitude}&days={days}
```

### Water Conditions
```
GET /api/water-conditions/current?lat={latitude}&lon={longitude}
```

## 🌐 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- Vercel (Serverless)
- Render
- Railway

## 📝 Example Usage

See [examples/WeatherExample.tsx](./examples/WeatherExample.tsx) for a complete React Native component example.

## 🔧 Troubleshooting

**Backend won't start:**
- Check Node.js version (18+ required)
- Verify `.env` file exists and has correct values
- Check port 3001 isn't already in use

**CORS errors:**
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check CORS configuration in `backend/server.js`

**API errors:**
- Verify API keys in backend `.env` are correct
- Check backend logs for detailed error messages

