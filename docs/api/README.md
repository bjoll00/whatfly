# API & Backend Documentation

This directory contains API integration, backend, and security documentation.

## 📋 Files

- **[API_INTEGRATION_SUMMARY.md](./API_INTEGRATION_SUMMARY.md)** - Summary of all API integrations
- **[API_SETUP_COMPLETE.md](./API_SETUP_COMPLETE.md)** - API setup completion status
- **[BACKEND_CONNECTION_GUIDE.md](./BACKEND_CONNECTION_GUIDE.md)** - Backend connection guide
- **[README_BACKEND.md](./README_BACKEND.md)** - Backend-specific documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[SECURITY_STATUS.md](./SECURITY_STATUS.md)** - Security status and configuration
- **[SECURITY_SETUP.md](./SECURITY_SETUP.md)** - Security setup guide
- **[SECURITY_AUDIT.md](./SECURITY_AUDIT.md)** - Security audit results

## 🔌 API Integrations

### External APIs
- **OpenWeatherMap** - Weather data
- **USGS Water Services** - Water conditions
- **Solunar.org** - Celestial data
- **Mapbox** - Maps and location services

### Backend API
Express.js server that proxies external API calls and handles:
- Weather data fetching
- Water conditions fetching
- CORS configuration

## 🔒 Security

All API keys are stored in environment variables. See [SECURITY_STATUS.md](./SECURITY_STATUS.md) for details.

