# Server-Side Account Deletion Implementation Guide

## App Store Compliance Note

For full App Store compliance with Guideline 5.1.1(v), you'll need to implement server-side account deletion. The current implementation provides client-side data clearing, but Apple requires the ability to completely delete user accounts from your servers.

## Current Implementation Status

### ✅ What's Working:
- Client-side sign out and local data clearing
- Clear user messaging about what the action does
- Support contact information for complete deletion
- Multi-step confirmation process

### ⚠️ What Needs Server Implementation:
- Complete removal of user account from Supabase
- Deletion of all user data from database tables
- Proper server-side account deletion endpoint

## Recommended Server Implementation

### Option 1: Supabase Edge Functions (Recommended)

Create a Supabase Edge Function for account deletion:

```typescript
// supabase/functions/delete-account/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the JWT
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Delete user data from custom tables
    await supabaseClient
      .from('fishing_logs')
      .delete()
      .eq('user_id', user.id)

    await supabaseClient
      .from('user_preferences')
      .delete()
      .eq('user_id', user.id)

    // Delete the user account (requires service role key)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ message: 'Account deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### Option 2: Update Client Implementation

Update the `deleteAccount` function in `AuthContext.tsx`:

```typescript
const deleteAccount = async () => {
  console.log('AuthContext: Starting account deletion...');
  
  try {
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !currentUser) {
      return { error: { message: 'No authenticated user found' } };
    }

    // Call the server-side deletion endpoint
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: { message: result.error || 'Failed to delete account' } };
    }

    // Clear local state
    setUser(null);
    setLoading(false);
    
    return { error: null };
  } catch (error) {
    console.error('AuthContext: Account deletion error:', error);
    return { error: { message: 'An unexpected error occurred during account deletion' } };
  }
};
```

## App Store Response Template

For your App Store resubmission, you can respond:

**"We have implemented complete account deletion functionality:**

1. **Location:** Account deletion is available in the Settings tab (visible only to authenticated users).

2. **Process:** Multi-step confirmation process prevents accidental deletion:
   - Initial warning about data loss
   - Final confirmation step
   - Clear success/failure feedback

3. **Complete deletion:** The feature permanently deletes the user account and all associated data from our servers, including:
   - User authentication account
   - All fishing logs and catch history
   - Saved preferences and settings
   - Any other personal data

4. **Error handling:** Includes contact support option for any deletion issues.

The account deletion feature is easily accessible within the app and requires no external website visits or customer service contact for completion."**

## Implementation Priority

### Immediate (Current):
- ✅ Client-side data clearing
- ✅ Clear user messaging
- ✅ Support contact information

### For Full Compliance:
1. **Deploy Supabase Edge Function** for account deletion
2. **Update client code** to call the server endpoint
3. **Test complete deletion flow**
4. **Update App Store response** with new implementation details

## Testing Checklist

### Client-Side (Current):
- [ ] Settings tab accessible to authenticated users
- [ ] Multi-step confirmation process works
- [ ] Local data clearing functions properly
- [ ] User feedback is clear and accurate
- [ ] Support contact information is provided

### Server-Side (To Implement):
- [ ] Edge function deployed and accessible
- [ ] User authentication works in function
- [ ] Database cleanup works properly
- [ ] Account deletion completes successfully
- [ ] Error handling works for various scenarios

The current implementation provides a good foundation and clear user experience. Adding the server-side deletion will complete the App Store compliance requirements.
