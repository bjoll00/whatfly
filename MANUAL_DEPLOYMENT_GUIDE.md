# Manual Account Deletion Deployment Guide

Since the Supabase CLI installation via npm is no longer supported, here are the manual deployment steps:

## Option 1: Install Supabase CLI (Recommended)

### Windows (PowerShell):
```powershell
# Download and install Supabase CLI
Invoke-WebRequest -Uri "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip" -OutFile "supabase.zip"
Expand-Archive -Path "supabase.zip" -DestinationPath "C:\supabase"
$env:PATH += ";C:\supabase"
```

### Or use Scoop (if you have it):
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Or use Chocolatey (if you have it):
```powershell
choco install supabase
```

## Option 2: Manual Upload via Supabase Dashboard

Since CLI installation can be tricky, you can manually upload the Edge Function:

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your WhatFly project
3. Go to **Functions** in the left sidebar

### Step 2: Create New Function
1. Click **"Create a new function"**
2. Name it: `delete-account`
3. Copy the code from `supabase/functions/delete-account/index.ts`
4. Paste it into the function editor
5. Click **"Deploy function"**

### Step 3: Test the Function
1. Go to your app
2. Sign in with a test account
3. Go to Settings → Delete Account
4. Follow the confirmation process

## Option 3: Quick Test Without Deployment

If you want to test the modal functionality first (without actual deletion):

1. **The modals are already working** - you can test the UI
2. **The function call will fail** - but you'll see the proper error handling
3. **Deploy the function later** when you're ready for full functionality

## What the Edge Function Does

The `delete-account` function:
1. ✅ **Verifies user authentication** - ensures only authenticated users can delete their own account
2. ✅ **Deletes fishing logs** - removes all user's catch history
3. ✅ **Deletes feedback** - removes all user's feedback submissions  
4. ✅ **Deletes user account** - removes user from Supabase auth
5. ✅ **Returns success/error** - proper response handling

## Testing the Complete Flow

Once deployed, the account deletion will:

1. **Show custom modals** (already working)
2. **Call Edge Function** with user's auth token
3. **Delete all user data** from Supabase
4. **Sign user out** and clear local state
5. **Show success message**

## Troubleshooting

### Function Not Found Error:
```
Error: Function not found: delete-account
```
**Solution:** Deploy the function using one of the methods above.

### Permission Errors:
```
Error: Failed to delete user account
```
**Solution:** Check that the function has service role permissions (automatically granted).

### Auth Errors:
```
Error: Invalid or expired token
```
**Solution:** Make sure user is properly signed in.

## Next Steps

1. **Choose your deployment method** (CLI or manual upload)
2. **Deploy the function**
3. **Test with a test account**
4. **Verify deletion in Supabase Dashboard**

The account deletion UI is already working perfectly - you just need to deploy the server-side function!
