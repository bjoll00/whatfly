// Script to check the current database schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aflfbalfpjhznkbwatqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking current database schema...');
  
  try {
    // Get a sample fly to see the current structure
    const { data: flies, error } = await supabase
      .from('flies')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching flies:', error);
      return;
    }
    
    if (flies && flies.length > 0) {
      console.log('📊 Current fly structure:');
      console.log(JSON.stringify(flies[0], null, 2));
    } else {
      console.log('📊 No flies found in database');
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema();
