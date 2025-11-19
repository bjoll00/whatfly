# WhatFly 🎣

A React Native/Expo app that suggests the best flies for fly fishing based on real-time weather, water conditions, and location data.

## 🎯 Overview

WhatFly helps anglers choose the right fly by analyzing:
- **Real-time weather conditions** (temperature, wind, cloud cover)
- **Water conditions** (flow rate, temperature, clarity)
- **Location data** (coordinates, elevation, water type)
- **Time factors** (time of day, season, moon phase)
- **Comprehensive fly database** with detailed attributes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- Mapbox account (for maps)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whatfly
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the project root:
   ```env
   # Supabase
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Mapbox
   EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
   
   # Backend API (optional, auto-detected)
   EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
   ```
   
   Create `backend/.env`:
   ```env
   OPENWEATHER_API_KEY=your-openweather-api-key
   PORT=3001
   ```

4. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

5. **Start the app**
   ```bash
   npm start
   ```

For detailed setup instructions, see [docs/setup/](./docs/setup/).

## 📁 Project Structure

```
whatfly/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   └── *.tsx              # App screens
├── components/            # React components
│   ├── FishingMap.tsx    # Main map component
│   ├── FlySuggestionsModal.tsx
│   └── ...
├── lib/                   # Core libraries and services
│   ├── newFlySuggestionService.ts  # Main fly suggestion algorithm
│   ├── fetchFishingData.ts          # Data fetching
│   ├── mapDataConverter.ts         # Data conversion
│   ├── supabase.ts                 # Database client
│   └── ...
├── scripts/               # Utility scripts
│   ├── database/         # Database scripts
│   ├── migrations/       # SQL migrations
│   └── utilities/        # Utility scripts
├── docs/                 # Documentation
│   ├── setup/           # Setup guides
│   ├── features/        # Feature documentation
│   ├── database/        # Database docs
│   ├── api/            # API documentation
│   └── troubleshooting/ # Troubleshooting guides
├── backend/             # Express.js backend server
│   ├── server.js       # Main server file
│   └── routes/         # API routes
└── supabase/           # Supabase functions and migrations
```

## ✨ Key Features

### 🎣 Fly Suggestions
Intelligent fly suggestions based on real-time conditions using:
- Ideal conditions matching (temperature, flow ranges)
- Hatch matching (insect life stages, seasons)
- Category-based bonuses (dry, nymph, streamer)
- Size matching (based on water clarity)
- Success rate weighting

See [docs/features/FLY_SUGGESTIONS_IMPLEMENTATION.md](./docs/features/FLY_SUGGESTIONS_IMPLEMENTATION.md) for details.

### 🗺️ Interactive Map
- Mapbox-powered interactive map
- Location selection with real-time data
- Weather and water condition display
- USGS water station integration

### 📊 Real-Time Data
- OpenWeatherMap API for weather
- USGS Water Services for water conditions
- Solunar.org for celestial data
- Automatic data conversion and processing

## 📚 Documentation

All documentation is organized in the [`docs/`](./docs/) directory:

- **[Setup & Getting Started](./docs/setup/)** - Setup guides and configuration
- **[Features](./docs/features/)** - Feature documentation and implementation details
- **[Database](./docs/database/)** - Database structure and migrations
- **[API & Backend](./docs/api/)** - API integration and backend documentation
- **[Troubleshooting](./docs/troubleshooting/)** - Common issues and solutions

## 🛠️ Development

### Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run lint       # Run ESLint
```

### Backend Scripts

```bash
cd backend
npm start          # Start backend server
npm run dev        # Start with nodemon (auto-reload)
```

### Database Scripts

```bash
# Check database status
node scripts/database/checkFlyDatabase.js

# Populate database
node scripts/database/populateDatabase.js

# Normalize data
node scripts/database/normalizeImitatedInsectData.js
```

See [scripts/README.md](./scripts/README.md) for all available scripts.

## 🔧 Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **Navigation**: Expo Router
- **Maps**: Mapbox (@rnmapbox/maps)
- **Database**: Supabase (PostgreSQL)
- **Backend**: Express.js, Node.js
- **APIs**: OpenWeatherMap, USGS Water Services, Solunar.org

## 🔒 Security

- All API keys stored in environment variables
- Backend proxies external API calls
- Row Level Security (RLS) in Supabase
- No sensitive data in codebase

See [docs/api/SECURITY_STATUS.md](./docs/api/SECURITY_STATUS.md) for details.

## 🤝 Contributing

1. Read the [documentation](./docs/)
2. Check [troubleshooting guides](./docs/troubleshooting/) for common issues
3. Follow the existing code style
4. Test your changes thoroughly

## 📝 License

[Add your license here]

## 🙏 Acknowledgments

- OpenWeatherMap for weather data
- USGS for water condition data
- Solunar.org for celestial data
- Mapbox for mapping services

---

**For new team members**: Start with [docs/setup/](./docs/setup/) and [docs/features/](./docs/features/) to get up to speed quickly!
