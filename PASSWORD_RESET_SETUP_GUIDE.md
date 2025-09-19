# Password Reset Setup Guide

This guide will help you configure Supabase to properly handle password reset redirects and eliminate the 404 error.

## Step 1: Configure Supabase Redirect URLs

### Access Supabase Dashboard:
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your WhatFly project
3. Navigate to **Authentication** → **URL Configuration**

### Add Redirect URLs:
Add these URLs to the **Redirect URLs** section:

**For Development:**
```
http://localhost:8081/reset-password
http://localhost:3000/reset-password
```

**For Production:**
```
https://your-domain.com/reset-password
https://whatfly.app/reset-password
```

**For Mobile (Deep Links):**
```
whatfly://reset-password
```

### Configure Site URL:
Set your **Site URL** to:
- **Development:** `http://localhost:8081`
- **Production:** `https://your-domain.com` or `https://whatfly.app`

## Step 2: Update Email Templates

### Use the Custom Password Reset Template:
1. Go to **Authentication** → **Email Templates**
2. Find the **Reset password** template
3. Click **Edit** or **Customize**
4. Replace the existing template with the content from `email-templates/password-reset.html`
5. Set the **Subject** to: `Reset your WhatFly password`
6. Save the changes

## Step 3: Test the Password Reset Flow

### Test Steps:
1. **Start your app** (`npm start`)
2. **Go to the auth page** and click "Forgot Password?"
3. **Enter your email** and click "Send Reset Link"
4. **Check your email** for the password reset email
5. **Click the reset link** in the email
6. **Verify** that you're taken to `/reset-password` page (not 404)
7. **Enter a new password** and confirm it
8. **Click "Update Password"**
9. **Verify** that you can sign in with the new password

## Step 4: Troubleshooting

### Common Issues:

#### 1. Still Getting 404 Error:
- **Check Supabase redirect URLs**: Make sure the exact URL is added
- **Check Site URL**: Must match your app's domain
- **Check email template**: Make sure it's using the correct redirect URL

#### 2. "Invalid redirect URL" Error:
- **Add the exact URL** to Supabase redirect URLs list
- **Include protocol**: Make sure to include `http://` or `https://`
- **Check for typos**: URL must match exactly

#### 3. Password Update Fails:
- **Check browser console** for error messages
- **Verify tokens**: Make sure the reset link contains valid tokens
- **Check Supabase logs**: Look for any server-side errors

#### 4. Redirect Loop:
- **Check Site URL**: Must be set correctly in Supabase
- **Verify redirect logic**: Make sure the reset page redirects properly after success

## Step 5: Mobile App Configuration

### For EAS Build (Production):
Update your `app.json` to include the deep link scheme:

```json
{
  "expo": {
    "scheme": "whatfly",
    "web": {
      "bundler": "metro"
    }
  }
}
```

### For Development Build:
The deep link `whatfly://reset-password` will work automatically once you create a development build.

## Security Notes

- **Reset links expire** in 1 hour for security
- **Tokens are single-use** - once used, they become invalid
- **Rate limiting** applies to password reset requests
- **Email verification** may be required depending on your Supabase settings

## File Structure

The password reset feature includes these files:
- `app/reset-password.tsx` - The reset password page
- `lib/AuthContext.tsx` - Updated with resetPassword function
- `email-templates/password-reset.html` - Styled email template
- `email-templates/password-reset.txt` - Plain text fallback

## Support

If you continue to have issues:
1. Check the browser console for errors
2. Verify Supabase configuration matches this guide
3. Test with a fresh reset request
4. Contact support at whatflyfishing@gmail.com
