// Test complete authentication flow
// Run with: node test-full-auth.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aflfbalfpjhznkbwatqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

async function testFullAuth() {
  try {
    console.log('=== Testing Complete Auth Flow ===');
    
    // Step 1: Check initial session
    console.log('\n1. Checking initial session...');
    const { data: initialSession } = await supabase.auth.getSession();
    console.log('Initial session:', initialSession?.user?.id || 'None');
    
    // Step 2: Try to sign in
    console.log('\n2. Attempting sign in...');
    const email = 'test@example.com';
    const password = 'testpassword123';
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError.message);
      return;
    }
    
    console.log('Sign in successful!');
    console.log('User ID:', signInData.user?.id);
    console.log('Email:', signInData.user?.email);
    
    // Step 3: Check session immediately after sign in
    console.log('\n3. Checking session after sign in...');
    const { data: sessionAfterSignIn } = await supabase.auth.getSession();
    console.log('Session after sign in:', sessionAfterSignIn?.user?.id || 'None');
    
    // Step 4: Test database access
    console.log('\n4. Testing database access...');
    const { data: flies, error: fliesError } = await supabase
      .from('flies')
      .select('*');
    
    if (fliesError) {
      console.error('Database access error:', fliesError);
    } else {
      console.log('Database access successful:', flies.length, 'flies found');
    }
    
    // Step 5: Create a new client and check if session persists
    console.log('\n5. Testing session persistence with new client...');
    const supabase2 = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    
    const { data: sessionWithNewClient } = await supabase2.auth.getSession();
    console.log('Session with new client:', sessionWithNewClient?.user?.id || 'None');
    
    // Step 6: Sign out
    console.log('\n6. Signing out...');
    await supabase.auth.signOut();
    
    // Step 7: Check session after sign out
    console.log('\n7. Checking session after sign out...');
    const { data: sessionAfterSignOut } = await supabase.auth.getSession();
    console.log('Session after sign out:', sessionAfterSignOut?.user?.id || 'None');
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testFullAuth();
