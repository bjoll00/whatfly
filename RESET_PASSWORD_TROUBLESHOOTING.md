# Password Reset Troubleshooting Guide

## Current Issue: "No tokens provided" Error

The reset password page is redirecting to auth because it's not receiving the required tokens from Supabase. This means the Supabase redirect URLs need to be configured.

## Step-by-Step Fix:

### 1. Configure Supabase Redirect URLs

**Go to Supabase Dashboard:**
1. Visit [supabase.com](https://supabase.com) and sign in
2. Select your WhatFly project
3. Navigate to **Authentication** → **URL Configuration**

**Add These Redirect URLs:**
```
http://localhost:8081/reset-password
http://localhost:8082/reset-password
http://localhost:3000/reset-password
```

**Set Site URL to:**
```
http://localhost:8082
```
(Or whatever port your app is currently running on)

### 2. Test the Flow

1. **Request Password Reset:**
   - Go to your app's auth page
   - Click "Forgot Password?"
   - Enter your email
   - Click "Send Reset Link"

2. **Check Console Logs:**
   - Look for: `AuthContext: Using redirect URL: http://localhost:8082/reset-password`
   - This confirms the correct URL is being sent to Supabase

3. **Check Your Email:**
   - Look for the password reset email
   - The link should point to: `http://localhost:8082/reset-password?...`

4. **Click the Email Link:**
   - Should take you to the reset password page (not redirect to auth)
   - Should show the password input form

### 3. Common Issues & Solutions

#### Issue: Still getting "No tokens provided"
**Solution:** 
- Double-check the redirect URLs in Supabase match exactly
- Make sure the Site URL is set correctly
- Try requesting a new password reset after saving Supabase settings

#### Issue: "Invalid redirect URL" error
**Solution:**
- Add the exact URL from the console log to Supabase redirect URLs
- Include the protocol (http://)
- Make sure there are no extra spaces or characters

#### Issue: Email link goes to wrong URL
**Solution:**
- Check that Supabase is using the updated redirect URL
- Try requesting a new reset after updating Supabase settings

### 4. Debug Steps

**Check Current Redirect URL:**
1. Open browser console in your app
2. Request a password reset
3. Look for: `AuthContext: Using redirect URL: [URL]`
4. Make sure this exact URL is in Supabase redirect URLs

**Verify Supabase Configuration:**
1. Go to Authentication → URL Configuration
2. Check that your redirect URLs list includes the URL from step above
3. Verify Site URL matches your current app URL

### 5. Quick Test

**Manual URL Test:**
Try visiting this URL directly in your browser:
```
http://localhost:8082/reset-password?access_token=test&refresh_token=test
```

If it shows the reset password form (instead of redirecting to auth), then the page is working and the issue is just Supabase configuration.

### 6. Still Not Working?

If you're still having issues:
1. Check the browser console for any error messages
2. Verify your Supabase project settings
3. Try with a different email address
4. Make sure you're using the same email that's registered in your app

## Expected Flow After Fix:

1. User clicks "Forgot Password?" → Modal opens
2. User enters email → Clicks "Send Reset Link"
3. Console shows: `AuthContext: Using redirect URL: http://localhost:8082/reset-password`
4. User receives email with reset link
5. User clicks link → Goes to reset password page (not auth page)
6. User enters new password → Success!
