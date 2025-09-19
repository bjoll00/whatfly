# Production Email Setup Guide

## Supabase Configuration for Production

### 1. Authentication Settings

Go to your Supabase Dashboard → Authentication → Settings and configure:

#### Site URL
```
https://whatfly.app
```

#### Redirect URLs (add all of these):
```
https://whatfly.app/reset-password
http://localhost:8081/reset-password
http://localhost:8082/reset-password
whatfly://reset-password
```

### 2. Email Templates

#### Password Reset Template
- **Subject:** `Reset Your WhatFly Password`
- **HTML Template:** Use the `password-reset.html` template
- **Text Template:** Use the `password-reset.txt` template

### 3. SMTP Settings (Optional)

If you want to use a custom SMTP provider instead of Supabase's default:

1. Go to Authentication → Settings → SMTP Settings
2. Configure your SMTP provider (Gmail, SendGrid, etc.)
3. Update the "From" email address

### 4. Testing

#### Development Testing
- App runs on `localhost:8081` or `localhost:8082`
- Password reset emails will redirect to `http://localhost:8081/reset-password`

#### Production Testing
- App runs on `https://whatfly.app`
- Password reset emails will redirect to `https://whatfly.app/reset-password`

### 5. Email Template Variables

The password reset email template uses these Supabase variables:
- `{{ .ConfirmationURL }}` - The actual reset link
- `{{ .Email }}` - User's email address
- `{{ .TokenHash }}` - Token hash (usually not needed)

### 6. Troubleshooting

#### Common Issues:
1. **Wrong redirect URL in email** - Check Supabase Redirect URLs configuration
2. **404 error when clicking link** - Ensure the redirect URL matches your app's domain
3. **Email not received** - Check spam folder, verify SMTP settings

#### Debug Steps:
1. Use the Email Debug Tool in your app
2. Check browser console for redirect URL logs
3. Verify Supabase dashboard settings match your app configuration

### 7. Security Notes

- Password reset links expire in 1 hour
- Users are automatically signed in when they click the reset link
- The reset form appears even if user is already signed in
- All redirect URLs must be explicitly allowed in Supabase settings
