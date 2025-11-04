# Quick Start Guide

Get your secure backend API running in 5 minutes!

## Step 1 Steps

### 1️⃣ Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and add your OpenWeatherMap API key:
```env
OPENWEATHER_API_KEY=your_key_here
PORT=3001
```

### 2️⃣ Start Backend

```bash
npm run dev
```

You should see:
```
🚀 WhatFly Backend API running on port 3001
✅ All required environment variables are set
```

### 3️⃣ Test Backend

Open a new terminal and test:
```bash
curl http://localhost:3001/health
```

You should see:
```json
{"status":"ok","timestamp":"...","environment":"development"}
```

### 4️⃣ Update Frontend

Create/update `.env` in the root directory:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 5️⃣ Start Your App

```bash
npm start
```

## ✅ Done!

Your app now securely uses the backend API. All API keys are safe on the backend!

---

## 🆘 Need Help?

- **Backend won't start?** Check [backend/README.md](./backend/README.md)
- **Frontend can't connect?** Check `EXPO_PUBLIC_API_BASE_URL` matches your backend URL
- **Getting CORS errors?** Update `FRONTEND_URL` in `backend/.env`
- **Deploy to production?** See [DEPLOYMENT.md](./DEPLOYMENT.md)

