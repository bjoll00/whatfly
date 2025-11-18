/**
 * Quick diagnostic script to check fly database status
 * Run with: node scripts/checkFlyDatabase.js
 */

const { createClient } = require('@supabase/supabase-js');

// Use the same credentials from your .env or scripts
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://aflfbalfpjhznkbwatqf.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 CHECKING FLY DATABASE STATUS');
  console.log('================================\n');

  try {
    // Test 1: Check connection
    console.log('1️⃣ Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('flies')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      console.error('❌ Connection Error:', testError.message);
      console.error('   Code:', testError.code);
      console.error('   Details:', testError.details);
      console.error('   Hint:', testError.hint);
      
      if (testError.code === 'PGRST116' || testError.message?.includes('permission denied')) {
        console.error('\n⚠️  RLS (Row Level Security) is blocking access!');
        console.error('   Solution: Go to Supabase Dashboard > Authentication > Policies');
        console.error('   Create a policy that allows SELECT on the flies table for authenticated/anonymous users');
      }
      return;
    }

    console.log('✅ Connection successful!\n');

    // Test 2: Count flies
    console.log('2️⃣ Counting flies in database...');
    const { count, error: countError } = await supabase
      .from('flies')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count Error:', countError.message);
      return;
    }

    console.log(`📊 Total flies: ${count || 0}\n`);

    if (count === 0) {
      console.log('⚠️  DATABASE IS EMPTY!');
      console.log('\n🔧 SOLUTION:');
      console.log('   Run: node scripts/populateDatabase.js');
      console.log('   Or: node scripts/rebuildFliesForMap.js');
      return;
    }

    // Test 3: Get sample flies
    console.log('3️⃣ Fetching sample flies...');
    const { data: flies, error: fetchError } = await supabase
      .from('flies')
      .select('id, name, type, primary_size, color')
      .limit(5);

    if (fetchError) {
      console.error('❌ Fetch Error:', fetchError.message);
      return;
    }

    console.log(`✅ Retrieved ${flies.length} sample flies:`);
    flies.forEach((fly, index) => {
      console.log(`   ${index + 1}. ${fly.name} (${fly.type}, size ${fly.primary_size || 'N/A'}, ${fly.color || 'N/A'})`);
    });

    // Test 4: Check required fields
    console.log('\n4️⃣ Checking fly data structure...');
    const { data: sampleFly, error: sampleError } = await supabase
      .from('flies')
      .select('*')
      .limit(1)
      .single();

    if (sampleError) {
      console.error('❌ Sample Error:', sampleError.message);
      return;
    }

    const requiredFields = ['id', 'name', 'type', 'best_conditions'];
    const missingFields = requiredFields.filter(field => !sampleFly[field]);
    
    if (missingFields.length > 0) {
      console.warn(`⚠️  Missing required fields: ${missingFields.join(', ')}`);
    } else {
      console.log('✅ All required fields present');
      console.log('   Fields found:', Object.keys(sampleFly).slice(0, 10).join(', '), '...');
    }

    // Test 5: Check best_conditions structure
    if (sampleFly.best_conditions) {
      console.log('\n5️⃣ Checking best_conditions structure...');
      const bc = sampleFly.best_conditions;
      const bcFields = ['weather', 'water_clarity', 'water_level', 'time_of_day', 'time_of_year'];
      const missingBCFields = bcFields.filter(field => !bc[field]);
      
      if (missingBCFields.length > 0) {
        console.warn(`⚠️  Missing best_conditions fields: ${missingBCFields.join(', ')}`);
      } else {
        console.log('✅ best_conditions structure looks good');
      }
    } else {
      console.warn('⚠️  best_conditions field is missing!');
      console.warn('   Flies need best_conditions to be suggested');
    }

    console.log('\n✅ DATABASE CHECK COMPLETE');
    console.log('==========================');
    console.log(`Status: ${count > 0 ? '✅ Ready' : '❌ Empty'}`);
    console.log(`Flies: ${count || 0}`);
    console.log(`Sample: ${flies.length > 0 ? '✅ Valid' : '❌ Invalid'}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDatabase();

