// Test session persistence
// Run with: node test-session.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aflfbalfpjhznkbwatqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSession() {
  try {
    console.log('Testing session persistence...');
    
    // Check current session
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Current session:', session?.user?.id || 'None');
    console.log('Error:', error?.message || 'None');
    
    if (session) {
      console.log('Session exists, testing database access...');
      
      // Test database access
      const { data: flies, error: fliesError } = await supabase
        .from('flies')
        .select('*');
      
      if (fliesError) {
        console.error('Database access error:', fliesError);
      } else {
        console.log('Database access successful:', flies.length, 'flies found');
      }
    } else {
      console.log('No session found. This might be the issue.');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testSession();
