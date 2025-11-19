const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://aflfbalfpjhznkbwatqf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY');

async function checkAllFlies() {
  console.log('🔍 Checking all flies for corrupted time_of_day data...');
  
  const { data: flies, error } = await supabase
    .from('flies')
    .select('name, best_conditions')
    .limit(20);
  
  if (error) {
    console.error('Error fetching flies:', error);
    return;
  }
  
  console.log('\nFlies with corrupted time_of_day data:');
  flies.forEach(fly => {
    if (fly.best_conditions?.time_of_day) {
      const timeOfDay = fly.best_conditions.time_of_day;
      const hasSeasonalData = timeOfDay.some(time => 
        ['spring', 'summer', 'fall', 'winter', 'early_spring', 'late_spring', 'early_summer', 'late_summer', 'early_fall', 'late_fall'].includes(time)
      );
      
      if (hasSeasonalData) {
        console.log(`❌ ${fly.name}: ${JSON.stringify(timeOfDay)}`);
      }
    }
  });
  
  // Check specifically for Chubby Chernobyl
  console.log('\n🔍 Checking all Chubby Chernobyl entries...');
  const { data: chubbyFlies, error: chubbyError } = await supabase
    .from('flies')
    .select('id, name, best_conditions')
    .ilike('name', '%chubby%');
  
  if (chubbyError) {
    console.error('Error fetching Chubby flies:', chubbyError);
  } else {
    chubbyFlies.forEach(fly => {
      console.log(`Found: ${fly.name} (ID: ${fly.id})`);
      console.log(`  time_of_day: ${JSON.stringify(fly.best_conditions?.time_of_day)}`);
    });
  }
}

checkAllFlies().catch(console.error);
