// Script to count flies in the database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aflfbalfpjhznkbwatqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function countFlies() {
  console.log('🔍 Counting flies in database...');
  
  try {
    const { count, error } = await supabase
      .from('flies')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error counting flies:', error);
      return;
    }
    
    console.log(`📊 Total flies in database: ${count}`);
    
    // Get breakdown by type
    const { data: flies, error: fliesError } = await supabase
      .from('flies')
      .select('type');
    
    if (fliesError) {
      console.error('Error getting fly types:', fliesError);
      return;
    }
    
    const typeCounts = {};
    flies.forEach(fly => {
      typeCounts[fly.type] = (typeCounts[fly.type] || 0) + 1;
    });
    
    console.log('📊 Breakdown by type:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Count failed:', error);
  }
}

countFlies();
