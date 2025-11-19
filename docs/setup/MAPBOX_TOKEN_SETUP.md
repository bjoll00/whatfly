# Mapbox Token Setup - Quick Fix

## Error
```
ERROR  Mapbox [error] MapLoad error Failed to load source: 
You must provide a Mapbox API access token for Mapbox tile sources
```

## Solution

### Step 1: Get Your Mapbox Access Token

1. Go to https://account.mapbox.com/
2. Sign in or create an account
3. Navigate to **Tokens** section
4. Copy your **Default public token** (starts with `pk.`)

### Step 2: Create `.env` File

Create a file named `.env` in your project root directory (same folder as `package.json`):

```env
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here
```

**Important:** Replace `pk.your_actual_token_here` with your actual token from Mapbox.

### Step 3: Restart Development Server

After creating/updating the `.env` file:

1. **Stop** your current Expo server (Ctrl+C in terminal)
2. **Restart** it:
   ```bash
   npx expo start --clear
   ```

The `--clear` flag ensures the new environment variables are loaded.

### Step 4: Verify It's Working

You should see:
- ✅ Map loads without errors
- ✅ No "Mapbox token not configured" warnings in console
- ✅ Map tiles display correctly

## Troubleshooting

### Still seeing the error?

1. **Check file location**: `.env` must be in the project root (same folder as `package.json`)
2. **Check variable name**: Must be exactly `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` (case-sensitive)
3. **Check token format**: Should start with `pk.` (public token)
4. **Restart server**: Always restart Expo after changing `.env`
5. **Clear cache**: Use `npx expo start --clear`

### Token Restrictions

If your token has URL restrictions, make sure:
- Your app's domain is allowed
- For development: `localhost` or `127.0.0.1` should be allowed
- For production: Add your app's domain

### Example `.env` File

```env
# Mapbox Configuration
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNrb2V4cWJzYjA...

# Backend API (if needed)
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Security Note

⚠️ **Never commit your `.env` file to git!**

The `.env` file should already be in `.gitignore`. To verify:
- Check that `.env` is listed in `.gitignore`
- Never share your token publicly

