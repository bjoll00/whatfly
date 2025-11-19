const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://aflfbalfpjhznkbwatqf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY');

async function debugWeatherTimeData() {
  console.log('🔍 Debugging Weather and Time Data Flow');
  
  // Test 1: Check what data is in the database for a specific fly
  console.log('\n📊 Test 1: Checking fly conditions in database');
  const { data: adamsFly, error: flyError } = await supabase
    .from('flies')
    .select('name, best_conditions')
    .eq('name', 'Adams')
    .single();
  
  if (flyError) {
    console.error('Error fetching fly:', flyError);
  } else {
    console.log('Adams fly conditions:', JSON.stringify(adamsFly.best_conditions, null, 2));
  }
  
  // Test 2: Check what data is in the database for Chubby Chernobyl
  console.log('\n📊 Test 2: Checking Chubby Chernobyl conditions');
  const { data: chubbyFly, error: chubbyError } = await supabase
    .from('flies')
    .select('name, best_conditions')
    .eq('name', 'Chubby Chernobyl')
    .single();
  
  if (chubbyError) {
    console.error('Error fetching Chubby Chernobyl:', chubbyError);
  } else {
    console.log('Chubby Chernobyl conditions:', JSON.stringify(chubbyFly.best_conditions, null, 2));
  }
  
  // Test 3: Simulate the data that should be passed to the algorithm
  console.log('\n🧪 Test 3: Simulating algorithm input data');
  
  const testConditions = {
    location: 'Test Location',
    latitude: 40.2181,
    longitude: -111.6133,
    weather_conditions: 'cloudy',
    water_clarity: 'clear',
    water_level: 'normal',
    water_flow: 'moderate',
    water_temperature: 42, // Cold water
    time_of_day: 'morning',
    time_of_year: 'spring',
    wind_speed: 'light',
    wind_direction: 'north',
    air_temperature_range: 'cold'
  };
  
  console.log('Test conditions being passed to algorithm:', JSON.stringify(testConditions, null, 2));
  
  // Test 4: Check if the algorithm would properly score these conditions
  console.log('\n🎯 Test 4: Analyzing how algorithm would score flies');
  
  if (adamsFly?.best_conditions) {
    const adamsConditions = adamsFly.best_conditions;
    console.log('\nAdams scoring analysis:');
    console.log('  Weather match:', adamsConditions.weather?.includes('cloudy') ? 'YES' : 'NO');
    console.log('  Time of day match:', adamsConditions.time_of_day?.includes('morning') ? 'YES' : 'NO');
    console.log('  Water temp match:', adamsConditions.water_temperature_range?.min <= 42 && adamsConditions.water_temperature_range?.max >= 42 ? 'YES' : 'NO');
  }
  
  if (chubbyFly?.best_conditions) {
    const chubbyConditions = chubbyFly.best_conditions;
    console.log('\nChubby Chernobyl scoring analysis:');
    console.log('  Weather match:', chubbyConditions.weather?.includes('cloudy') ? 'YES' : 'NO');
    console.log('  Time of day match:', chubbyConditions.time_of_day?.includes('morning') ? 'YES' : 'NO');
    console.log('  Water temp match:', chubbyConditions.water_temperature_range?.min <= 42 && chubbyConditions.water_temperature_range?.max >= 42 ? 'YES' : 'NO');
    console.log('  Should be penalized for cold water:', chubbyConditions.water_temperature_range?.min > 42 ? 'YES - HEAVY PENALTY' : 'NO');
  }
  
  console.log('\n✅ Debug complete! Check the console logs in the app to see what data is actually being passed.');
}

debugWeatherTimeData().catch(console.error);
