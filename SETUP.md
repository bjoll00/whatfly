# WhatFly - Fly Fishing App Setup Guide

## Overview
WhatFly is a React Native app that helps fly fishermen choose the right flies based on current conditions. The app learns from user input to improve suggestions over time.

## Features
- **Authentication**: Sign up/Sign in with email and password
- **What Fly Tab**: AI-powered fly suggestions based on fishing conditions
- **New Log Tab**: Log fishing trips with conditions and results
- **History Tab**: View past fishing logs and track success

## Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- Supabase account

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Copy and paste the contents of `database-setup.sql` into the SQL editor
4. Run the SQL to create the tables and sample data
5. Copy and paste the contents of `update-database-policies.sql` and run it

### 3. Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication → Settings**
2. Under **Auth Providers**, enable **Email**
3. Configure email settings as needed (or use default)

### 4. Configure Supabase

1. Go to your Supabase project settings
2. Copy your project URL and anon key
3. Open `lib/config.ts`
4. Replace the placeholder values:
   ```typescript
   export const SUPABASE_CONFIG = {
     url: 'https://your-project.supabase.co', // Your actual URL
     anonKey: 'your-actual-anon-key', // Your actual anon key
   };
   ```

### 5. Run the App

```bash
npm start
```

Then scan the QR code with the Expo Go app on your phone, or press 'w' to run in web browser.

## Database Schema

### fishing_logs table
- Stores user fishing trip data
- Includes conditions, flies used, and results
- User-specific with Row Level Security

### flies table
- Stores fly patterns and their characteristics
- Includes success rates and usage statistics
- Publicly readable, authenticated users can modify

## Key Features

### Fly Suggestion Algorithm
The app uses a scoring system that considers:
- Weather conditions match
- Water clarity compatibility
- Water level appropriateness
- Time of day effectiveness
- Water temperature ranges
- Historical success rates

### Learning System
- Tracks which flies are successful in different conditions
- Updates success rates based on user feedback
- Improves suggestions over time

## Customization

### Adding New Fly Types
1. Add new fly types to the `type` enum in `lib/types.ts`
2. Update the database schema if needed
3. Add sample flies to `lib/config.ts`

### Modifying Suggestion Algorithm
Edit the `scoreFly` method in `lib/flySuggestionService.ts` to adjust how flies are scored and ranked.

## Troubleshooting

### Common Issues
1. **Supabase connection errors**: Verify your URL and anon key in `lib/config.ts`
2. **Database errors**: Ensure you've run the SQL setup script
3. **Build errors**: Try clearing node_modules and reinstalling dependencies

### Getting Help
- Check the Supabase documentation for database issues
- Review React Native/Expo documentation for app issues
- Check the console for error messages

## Next Steps

1. Set up user authentication (optional)
2. Add more fly patterns to the database
3. Implement push notifications for optimal fishing times
4. Add weather API integration for automatic condition detection
5. Create fly tying guides and patterns
