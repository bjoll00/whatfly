# Security Audit - API Key Configuration

## ⚠️ Security Issues Found

### 1. **Mapbox Token Hardcoded** ❌ **CRITICAL**

**Location:** `lib/mapboxConfig.ts`

**Issue:**
```typescript
ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoid2hhdGZseSIsImEiOiJjbWdjdndvcmcwOGR6MmpwczAwdzFzbzBnIn0.UnxcMVxCP3aMw7njywx7lA',
```

**Problem:** The Mapbox public token is hardcoded as a fallback. This means:
- Token is visible in your source code
- Token will be committed to git (if not already)
- Anyone can see and potentially use your token

**Note:** Mapbox public tokens (pk.*) are designed to be used in client-side code, but they should still be:
- Restricted by URL/domain in Mapbox dashboard
- Not committed to version control
- Rotated regularly

---

### 2. **OpenWeatherMap API Key** ✅ **SECURE**

**Location:** `backend/routes/weather.js`

**Status:** ✅ Properly configured
```javascript
const apiKey = process.env.OPENWEATHER_API_KEY;
```

**Security:**
- ✅ Stored in backend `.env` file
- ✅ Never exposed to frontend
- ✅ Backend proxies all requests
- ✅ Frontend only calls your backend API

---

### 3. **USGS Water API** ✅ **SECURE**

**Location:** `backend/routes/waterConditions.js`

**Status:** ✅ Secure (No API key needed)
- ✅ USGS is a public API
- ✅ No authentication required
- ✅ Backend proxies requests for consistency

---

## Security Recommendations

### Fix Mapbox Token Issue

**Option 1: Use Environment Variable Only (Recommended)**

Remove the hardcoded fallback:

```typescript
// lib/mapboxConfig.ts
export const MAPBOX_CONFIG = {
  ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  // Remove the hardcoded token fallback
}
```

**Option 2: Create Frontend .env File**

Create `.env` in project root:
```env
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_actual_token_here
```

**Option 3: Use Different Token for Development**

Keep the hardcoded token but:
1. Restrict it in Mapbox dashboard to localhost only
2. Use a different token for production
3. Document this is for development only

---

## Current Security Status

| API | Key Location | Exposed? | Risk Level |
|-----|-------------|----------|------------|
| **Mapbox** | Hardcoded fallback in code | ✅ Yes (in code) | 🟡 Medium |
| **OpenWeatherMap** | Backend `.env` | ✅ No | ✅ Low |
| **USGS** | No key needed | ✅ N/A | ✅ None |

---

## .gitignore Status

✅ **Good:** `.env` files are in `.gitignore`
- Root `.gitignore`: Has `.env` (line 81)
- `backend/.gitignore`: Has `.env` (line 5)

✅ **Good:** No `.env` files found in repository (they're ignored)

---

## Best Practices Checklist

### ✅ Already Implemented:
- [x] Backend uses environment variables for API keys
- [x] `.env` files are in `.gitignore`
- [x] OpenWeatherMap key stored securely on backend
- [x] Backend proxies external API calls
- [x] Frontend only calls backend, not external APIs directly

### ❌ Needs Fixing:
- [ ] Remove hardcoded Mapbox token from code
- [ ] Create `.env` file with `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
- [ ] Restrict Mapbox token in dashboard (URL restrictions)
- [ ] Document that hardcoded token is for dev only (if keeping it)

---

## Recommended Fixes

### 1. Remove Hardcoded Mapbox Token

**File:** `lib/mapboxConfig.ts`

**Change from:**
```typescript
ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1I...',
```

**Change to:**
```typescript
ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
```

**Then create `.env` file:**
```env
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
```

### 2. Restrict Mapbox Token (Important!)

In Mapbox dashboard:
1. Go to https://account.mapbox.com/
2. Navigate to your token
3. Add URL restrictions:
   - Development: `http://localhost:*`
   - Production: Your production domain
4. Add scopes: Only give minimum required permissions

### 3. Verify Backend .env

Make sure `backend/.env` has:
```env
OPENWEATHER_API_KEY=your_key_here
PORT=3001
NODE_ENV=development
```

---

## Summary

**Overall Security:** 🟡 **Good, but needs improvement**

- ✅ OpenWeatherMap: Secure (backend only)
- ✅ USGS: Secure (public API)
- ⚠️ Mapbox: Needs fix (hardcoded token)

**Action Required:** Remove hardcoded Mapbox token and use environment variable.

