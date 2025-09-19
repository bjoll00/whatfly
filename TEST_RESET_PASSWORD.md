# Quick Password Reset Test

## Test Steps:

### 1. Check Current Setup
1. **Open your app** at `http://localhost:8082`
2. **Open browser console** (F12 → Console tab)
3. **Go to auth page** and click "Forgot Password?"
4. **Enter any email** and click "Send Reset Link"
5. **Look for this log:** `AuthContext: Using redirect URL: http://localhost:8082/reset-password`

### 2. Configure Supabase (if needed)
If the URL in step 1 is correct, add it to Supabase:
1. **Go to Supabase Dashboard** → Authentication → URL Configuration
2. **Add to Redirect URLs:** `http://localhost:8082/reset-password`
3. **Set Site URL to:** `http://localhost:8082`
4. **Save changes**

### 3. Test Password Reset
1. **Request password reset** again (with the same email)
2. **Check your email** for the reset link
3. **Click the reset link** in the email
4. **Should see:** Password reset form (not redirect to auth)

### 4. Manual Test (if email doesn't work)
Try visiting this URL directly:
```
http://localhost:8082/reset-password?access_token=test&refresh_token=test
```
- **If it shows the form:** Page is working, issue is Supabase config
- **If it redirects to auth:** Page needs the tokens

## Expected Console Logs:
```
AuthContext: Attempting password reset for: your@email.com
AuthContext: Using redirect URL: http://localhost:8082/reset-password
AuthContext: Password reset response: {data: {...}, error: null}
```

## If Still Not Working:
1. **Check Supabase logs** in the dashboard
2. **Try a different email** that's registered in your app
3. **Check spam folder** for the reset email
4. **Verify email is confirmed** in Supabase Auth users table
