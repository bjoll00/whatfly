// Test sign-in functionality
// Run with: node test-signin.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aflfbalfpjhznkbwatqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignIn() {
  try {
    console.log('Testing sign-in...');
    
    // Replace with your actual email and password
    const email = 'your-email@example.com';
    const password = 'your-password';
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
    } else {
      console.log('Sign in successful:', data);
      
      // Test database access
      const { data: flies, error: fliesError } = await supabase
        .from('flies')
        .select('*');
      
      if (fliesError) {
        console.error('Flies error:', fliesError);
      } else {
        console.log('Database access successful:', flies.length, 'flies found');
      }
      
      // Sign out
      await supabase.auth.signOut();
      console.log('Signed out successfully');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testSignIn();
