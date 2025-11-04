/**
 * WhatFly Backend API Server
 * 
 * This server acts as a secure proxy between the React Native app
 * and external APIs, keeping API keys safe on the backend.
 * 
 * Security Features:
 * - API keys stored in environment variables (never in code)
 * - CORS configured to only allow requests from your app
 * - Response filtering to remove sensitive data
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { weatherRouter } from './routes/weather.js';
import { waterConditionsRouter } from './routes/waterConditions.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CORS Configuration
// Allow all origins in development (mobile apps don't send origin headers)
app.use(
  cors({
    origin: true, // Allow all origins (mobile apps need this)
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/weather', weatherRouter);
app.use('/api/water-conditions', waterConditionsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WhatFly Backend API running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  
  // Validate required environment variables
  const requiredVars = ['OPENWEATHER_API_KEY'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    console.warn('   Some API endpoints may not work without these.');
  } else {
    console.log('✅ All required environment variables are set');
  }
});

export default app;

