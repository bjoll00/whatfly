# Account Deletion Setup Guide

This guide explains how to set up true account deletion that removes users from the Supabase database.

## Overview

The account deletion feature now includes:
- ✅ **Two-step confirmation modals** (working on web)
- ✅ **Supabase Edge Function** for server-side deletion
- ✅ **Complete data cleanup** (fishing logs, feedback, etc.)
- ✅ **App Store compliant** account deletion

## Setup Steps

### 1. Deploy the Edge Function

First, you need to deploy the `delete-account` Edge Function to your Supabase project:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (replace with your project reference)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy delete-account
```

### 2. Set Environment Variables

Make sure your Supabase project has the required environment variables:

- `SUPABASE_URL` (automatically available)
- `SUPABASE_SERVICE_ROLE_KEY` (automatically available)

These are automatically provided to Edge Functions by Supabase.

### 3. Test the Function

After deployment, you can test the account deletion:

1. **Sign in to your app**
2. **Go to Settings tab**
3. **Click "Delete Account"**
4. **Follow the two-step confirmation process**
5. **Type "DELETE" to confirm**
6. **Account should be permanently deleted**

### 4. Verify Deletion

To verify the account was deleted:

1. **Try to sign in** with the deleted account - should fail
2. **Check Supabase Dashboard** → Authentication → Users - user should be gone
3. **Check your tables** → fishing_logs, feedback - user's data should be gone

## How It Works

### Client Side (AuthContext.tsx)
1. User confirms deletion in modal
2. Gets current session and access token
3. Calls Edge Function with authorization header
4. Clears local state on success

### Server Side (Edge Function)
1. Verifies user's JWT token
2. Deletes user data from custom tables:
   - `fishing_logs` (user's catch history)
   - `feedback` (user's feedback submissions)
3. Deletes user from `auth.users` table
4. Returns success/error response

## Security Features

- ✅ **JWT token verification** - only authenticated users can delete their own account
- ✅ **Service role key** - Edge Function has admin privileges to delete users
- ✅ **CORS headers** - proper cross-origin support
- ✅ **Error handling** - comprehensive error responses
- ✅ **Logging** - detailed console logs for debugging

## Troubleshooting

### Function Not Found Error
```
Error: Function not found: delete-account
```
**Solution:** Make sure you deployed the function:
```bash
supabase functions deploy delete-account
```

### Authorization Error
```
Error: Invalid or expired token
```
**Solution:** Make sure the user is properly authenticated and has a valid session.

### Permission Denied
```
Error: Failed to delete user account
```
**Solution:** Make sure your Supabase project has the service role key configured and the Edge Function has the correct permissions.

### Data Not Deleted
If user data remains in custom tables:
1. Check the Edge Function logs in Supabase Dashboard
2. Verify table names match your schema
3. Make sure RLS policies allow deletion

## App Store Compliance

This implementation fully complies with App Store requirements:

- ✅ **Account deletion available** - users can delete their accounts
- ✅ **Complete data removal** - all user data is deleted
- ✅ **Clear process** - obvious how to delete account
- ✅ **Confirmation steps** - prevents accidental deletion
- ✅ **No forced login** - users can use app without account

## Support

If you encounter issues:

1. **Check Supabase Dashboard** → Functions → delete-account → Logs
2. **Check browser console** for client-side errors
3. **Verify environment variables** are set correctly
4. **Test with a fresh user account** to isolate issues

The function includes comprehensive error handling and logging to help diagnose any problems.
