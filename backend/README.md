# WhatFly Backend API

Secure backend API server for the WhatFly React Native app. This server acts as a proxy between the mobile app and external APIs, keeping API keys safe on the backend.

## Features

- 🔒 **Secure API Key Storage** - API keys stored in environment variables, never exposed to frontend
- 🌐 **CORS Protection** - Only allows requests from authorized origins
- 🚀 **RESTful API** - Clean, organized endpoint structure
- 📡 **External API Proxying** - Handles all external API calls securely
- ✅ **Error Handling** - Comprehensive error handling and logging

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your actual API keys:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
OPENWEATHER_API_KEY=your_actual_api_key_here
```

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

## API Endpoints

### Health Check
- **GET** `/health` - Check if server is running

### Weather
- **GET** `/api/weather/current?lat={latitude}&lon={longitude}` - Get current weather
- **GET** `/api/weather/forecast?lat={latitude}&lon={longitude}&days={days}` - Get weather forecast

### Water Conditions
- **GET** `/api/water-conditions/current?lat={latitude}&lon={longitude}` - Get water conditions

## Example Usage

```javascript
// Get current weather
const response = await fetch('http://localhost:3001/api/weather/current?lat=40.7128&lon=-74.0060');
const weather = await response.json();

// Get water conditions
const waterResponse = await fetch('http://localhost:3001/api/water-conditions/current?lat=40.7128&lon=-74.0060');
const water = await waterResponse.json();
```

## Deployment

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd backend
vercel
```

3. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add environment variables (OPENWEATHER_API_KEY, etc.)

### Render

1. Create a new Web Service on Render
2. Connect your Git repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard

## Security Notes

- Never commit `.env` files to Git
- Always use environment variables for API keys
- Configure CORS to only allow your app's domain
- Use HTTPS in production
- Consider rate limiting for production deployments

