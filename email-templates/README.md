# Email Templates for WhatFly

This directory contains styled email templates for Supabase authentication emails.

## Files

- `confirm-signup.html` - Styled HTML version of the confirmation email
- `confirm-signup.txt` - Plain text version of the confirmation email
- `password-reset.html` - Styled HTML version of the password reset email
- `password-reset.txt` - Plain text version of the password reset email
- `README.md` - This instruction file

## How to Update Supabase Email Templates

### Step 1: Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your WhatFly project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Update Email Templates

#### Confirmation Email Template:
1. Find the **Confirm signup** template
2. Click **Edit** or **Customize**
3. Replace the existing template with the content from `confirm-signup.html`
4. For the **Subject** field, use: `Confirm your WhatFly account`
5. Save the changes

#### Password Reset Email Template:
1. Find the **Reset password** template
2. Click **Edit** or **Customize**
3. Replace the existing template with the content from `password-reset.html`
4. For the **Subject** field, use: `Reset your WhatFly password`
5. Save the changes

### Step 3: Configure Template Settings

Make sure the following settings are enabled:
- **Enable email confirmations**: ON
- **Enable password reset**: ON
- **Confirm email change**: ON (if you want users to confirm email changes)

### Step 4: Test the Templates

1. **Test Confirmation Email:**
   - Create a test account with a real email address
   - Check that the email arrives with the correct styling
   - Verify that the confirmation link works properly

2. **Test Password Reset Email:**
   - Use the "Forgot Password" feature in your app
   - Check that the reset email arrives with the correct styling
   - Verify that the reset link works properly

## Template Features

Both HTML templates include:
- **Branded styling** that matches your app's dark theme (#25292e background)
- **WhatFlyFishingLogo** prominently displayed at the top
- **Website-focused messaging** that directs users back to your site
- **Responsive design** that works on mobile and desktop
- **Clear call-to-action** button for the main action
- **Fallback text link** in case the button doesn't work
- **Website link** in footer to drive traffic back to your app
- **Security information** about link expiration

### Confirmation Email Specific Features:
- **Feature highlights** showing what users can do after confirmation
- **Welcome messaging** for new users

### Password Reset Email Specific Features:
- **Security notice** with expiration information
- **Clear instructions** about what to do if the user didn't request the reset
- **Support contact** information for help

## Customization

You can modify the templates by:
- Changing colors in the CSS (look for color values like `#25292e`, `#ffd33d`)
- Updating the logo or branding elements
- Modifying the text content
- Adjusting the styling to match your preferences

## Variables

The template uses Supabase's built-in variables:
- `{{ .ConfirmationURL }}` - The confirmation link that users need to click
- `{{ .Email }}` - The user's email address (if you want to include it)
- `{{ .SiteURL }}` - Your site's URL (if you want to include it)

## Notes

- The HTML template is designed to work across different email clients
- The plain text version is included as a fallback
- Make sure to test the template thoroughly before deploying
- Consider adding your actual logo image if you have one hosted online
