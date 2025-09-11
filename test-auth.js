// Test authentication and database access
// Run with: node test-auth.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aflfbalfpjhznkbwatqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (signUpError) {
      console.error('Sign up error:', signUpError);
    } else {
      console.log('Sign up success:', signUpData);
    }
    
    // Test sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError);
    } else {
      console.log('Sign in success:', signInData);
      
      // Test database access
      const { data: flies, error: fliesError } = await supabase
        .from('flies')
        .select('*');
      
      if (fliesError) {
        console.error('Flies error:', fliesError);
      } else {
        console.log('Flies access success:', flies.length, 'flies found');
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuth();
