# Deployment Guide

This guide covers deploying the WhatFly backend API to various platforms.

## Prerequisites

- Node.js 18+ installed
- Git repository set up
- API keys ready (OpenWeatherMap, etc.)

## Environment Variables Setup

Before deploying, ensure you have all required environment variables:

```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app-domain.com
OPENWEATHER_API_KEY=your_actual_api_key_here
```

## Deployment Options

### Option 1: Vercel (Recommended for Serverless)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
cd backend
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- Project name: `whatfly-backend`
- Directory: `./` (current directory)

#### Step 3: Set Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - `OPENWEATHER_API_KEY` = `your_key_here`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `your_app_url` (optional)

#### Step 4: Redeploy

After adding environment variables, redeploy:

```bash
vercel --prod
```

#### Step 5: Update Frontend API URL

Update `lib/apiConfig.ts`:

```typescript
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_BASE_URL || 
  'https://your-backend.vercel.app'; // Your Vercel deployment URL
```

---

### Option 2: Render

#### Step 1: Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your Git repository

#### Step 2: Configure Service

- **Name**: `whatfly-backend`
- **Environment**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Root Directory**: Leave empty (or set to `backend` if backend is a subdirectory)

#### Step 3: Set Environment Variables

In the Render dashboard, go to **Environment** tab and add:

```
NODE_ENV=production
OPENWEATHER_API_KEY=your_key_here
FRONTEND_URL=https://your-app.com
```

#### Step 4: Deploy

Click **Create Web Service** and Render will automatically deploy.

#### Step 5: Update Frontend

Update `lib/apiConfig.ts` with your Render URL:

```typescript
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_BASE_URL || 
  'https://whatfly-backend.onrender.com';
```

---

### Option 3: Railway

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

#### Step 2: Login and Initialize

```bash
railway login
cd backend
railway init
```

#### Step 3: Set Environment Variables

```bash
railway variables set OPENWEATHER_API_KEY=your_key_here
railway variables set NODE_ENV=production
```

#### Step 4: Deploy

```bash
railway up
```

---

## Local Development Setup

### Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` and add your API keys:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
OPENWEATHER_API_KEY=your_actual_api_key_here
```

5. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

### Frontend

1. Install dependencies (if not already done):
```bash
npm install
```

2. Create or update `.env` file in the root directory:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

3. Start Expo:
```bash
npm start
```

---

## Testing the API

### Test Health Endpoint

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### Test Weather Endpoint

```bash
curl "http://localhost:3001/api/weather/current?lat=40.7128&lon=-74.0060"
```

### Test Water Conditions Endpoint

```bash
curl "http://localhost:3001/api/water-conditions/current?lat=40.7128&lon=-74.0060"
```

---

## Security Checklist

- ✅ API keys stored in environment variables only
- ✅ `.env` file added to `.gitignore`
- ✅ CORS configured to only allow your app domain
- ✅ Error messages don't expose sensitive information
- ✅ HTTPS used in production
- ✅ No API keys in frontend code

---

## Troubleshooting

### Backend won't start

- Check Node.js version: `node --version` (should be 18+)
- Verify `.env` file exists and has correct values
- Check if port 3001 is already in use

### CORS errors

- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check CORS configuration in `backend/server.js`

### API returns errors

- Verify API keys are set correctly in environment variables
- Check backend logs for detailed error messages
- Test API endpoints directly with curl or Postman

### Frontend can't connect to backend

- Verify `API_BASE_URL` in `lib/apiConfig.ts` is correct
- Check if backend is running and accessible
- For production, ensure backend URL is using HTTPS

---

## Production Best Practices

1. **Use HTTPS**: Always use HTTPS in production
2. **Rate Limiting**: Consider adding rate limiting to prevent abuse
3. **Monitoring**: Set up error monitoring (e.g., Sentry)
4. **Logging**: Configure proper logging for production
5. **Backup**: Keep backups of your environment variables
6. **Update Regularly**: Keep dependencies updated for security

