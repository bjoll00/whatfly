# Test Account Deletion

## Quick Test Steps

1. **Sign in to your app** with a test account
2. **Go to Settings tab**
3. **Click "Delete Account"** (red button)
4. **First modal appears** - click "Delete Account"
5. **Second modal appears** - type "DELETE" and click "I Understand, Delete My Account"
6. **Account should be deleted**

## Expected Behavior

### ✅ Success Case:
- Modals appear correctly
- Account deletion completes
- User is signed out
- Success message appears
- User cannot sign in again with deleted account

### ❌ Error Cases to Check:
- **Function not deployed:** "Function not found: delete-account"
- **Auth issues:** "Invalid or expired token"
- **Permission issues:** "Failed to delete user account"

## Debug Information

### Console Logs to Look For:
```
SettingsScreen: TouchableOpacity pressed
SettingsScreen: Delete account button pressed
AuthContext: Starting account deletion...
AuthContext: Deleting account for user: [email]
AuthContext: Account deleted successfully from server
AuthContext: Account deletion completed successfully
```

### Supabase Dashboard:
- **Functions → delete-account → Logs** - Check for server-side logs
- **Authentication → Users** - Verify user is deleted
- **Table Editor → fishing_logs** - Verify user's data is deleted

## Troubleshooting

### If modals don't appear:
- Check browser console for JavaScript errors
- Verify you're signed in (button only appears for authenticated users)

### If function call fails:
- Run the deployment script: `./scripts/deploy-account-deletion.ps1`
- Check Supabase project is linked correctly
- Verify Edge Function is deployed in Supabase Dashboard

### If deletion doesn't work:
- Check Edge Function logs in Supabase Dashboard
- Verify service role key has proper permissions
- Test with a fresh user account
