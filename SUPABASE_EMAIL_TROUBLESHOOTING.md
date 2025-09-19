# Supabase Email Configuration Troubleshooting Guide

## Issues with Password Reset Emails

Based on the logs, it appears that password reset emails are not being delivered properly. Here's how to diagnose and fix the issue:

## 1. Check Supabase Dashboard Settings

### Authentication Settings
1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication → Settings**
3. **Check the following settings:**

#### Site URL
- **Current setting should be:** `http://localhost:8082` (for development)
- **For production:** `https://your-domain.com`

#### Redirect URLs
Make sure these URLs are added:
```
http://localhost:8082/reset-password
http://localhost:8081/reset-password
https://your-domain.com/reset-password
whatfly://reset-password
```

## 2. Email Provider Configuration

### Check Email Settings
1. **Go to Authentication → Settings → Email**
2. **Verify the following:**

#### SMTP Settings
- **Enable custom SMTP** (if you have a custom email provider)
- **Or use Supabase's built-in email service**

#### Email Templates
- **Password Reset template** should be enabled
- **Custom template** should be set if you're using one

## 3. Common Issues and Solutions

### Issue 1: Emails Going to Spam
**Solution:**
- Check your spam folder
- Add `noreply@supabase.co` to your contacts
- Configure SPF/DKIM records if using custom domain

### Issue 2: Redirect URL Mismatch
**Current logs show:** `ResetPasswordScreen: No tokens provided`
**This means the redirect URL in the email doesn't match your app's URL**

**Solution:**
1. **Check the exact redirect URL** being used in the email
2. **Update Supabase redirect URLs** to match exactly
3. **Test with the exact URL from the email**

### Issue 3: Email Rate Limiting
**Solution:**
- Wait a few minutes between reset requests
- Check Supabase usage limits

### Issue 4: Custom Email Template Issues
**Solution:**
- Temporarily disable custom email template
- Use Supabase default template to test
- Check template syntax if using custom template

## 4. Testing Steps

### Step 1: Verify Email Delivery
1. **Request a password reset**
2. **Check your email immediately** (including spam)
3. **Look for emails from:** `noreply@supabase.co`

### Step 2: Check Email Link
1. **Copy the reset link** from the email
2. **Check the URL structure:**
   ```
   https://aflfbalfpjhznkbwatqf.supabase.co/auth/v1/verify?token=...
   ```
3. **Verify the redirect parameter** in the URL

### Step 3: Test Redirect URL
1. **Manually test the redirect URL** in your browser
2. **Should redirect to:** `http://localhost:8082/reset-password?access_token=...&refresh_token=...`

## 5. Debug Information

### Current Configuration
- **Supabase URL:** `https://aflfbalfpjhznkbwatqf.supabase.co`
- **App URL:** `http://localhost:8082`
- **Reset URL:** `http://localhost:8082/reset-password`

### What to Check
1. **Supabase Dashboard → Authentication → Settings**
2. **Site URL:** Should match your app URL
3. **Redirect URLs:** Should include your reset URL
4. **Email Templates:** Should be properly configured

## 6. Quick Fixes to Try

### Fix 1: Update Redirect URLs
Add these exact URLs to Supabase:
```
http://localhost:8082/reset-password
http://localhost:8081/reset-password
http://localhost:3000/reset-password
```

### Fix 2: Reset Email Template
1. **Go to Authentication → Email Templates**
2. **Reset to default** for password reset
3. **Test again**

### Fix 3: Check Email Provider
1. **Try with a different email address**
2. **Check if emails are being sent to that address**

## 7. Alternative Testing Method

If emails aren't working, you can test the reset flow manually:

1. **Get the reset token** from Supabase logs
2. **Manually construct the URL:**
   ```
   http://localhost:8082/reset-password?access_token=TOKEN&refresh_token=TOKEN
   ```
3. **Test the reset page directly**

## 8. Contact Support

If none of these steps work:
1. **Check Supabase status page**
2. **Contact Supabase support**
3. **Check your Supabase project logs**

## Next Steps

1. **Check your Supabase dashboard settings**
2. **Verify redirect URLs are correct**
3. **Test with a simple email address**
4. **Check spam folder**
5. **Try the manual testing method**

Let me know what you find in your Supabase dashboard!
