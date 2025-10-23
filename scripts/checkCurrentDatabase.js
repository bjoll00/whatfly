// Script to check the current state of the fly database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aflfbalfpjhznkbwatqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGZiYWxmcGpoem5rYndhdHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODcxNzcsImV4cCI6MjA3Mjg2MzE3N30.WdnpRNAcfVWBBZ0GpE4JB_kjpfGgEmp55N76zuuI2OY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentDatabase() {
  console.log('🔍 CHECKING CURRENT FLY DATABASE STATE');
  console.log('=====================================');
  
  try {
    // Get all current flies
    const { data: flies, error } = await supabase
      .from('flies')
      .select('*')
      .order('type', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching flies:', error);
      return;
    }
    
    console.log(`📊 Total flies in database: ${flies.length}\n`);
    
    if (flies.length === 0) {
      console.log('🗑️  Database is empty!');
      console.log('\n🔧 SOLUTION: You need to manually insert flies through the Supabase dashboard');
      console.log('or temporarily disable Row Level Security (RLS) policies.');
      return;
    }
    
    // Check for duplicates
    console.log('🔄 DUPLICATE ANALYSIS:');
    console.log('======================');
    
    const nameCounts = {};
    flies.forEach(fly => {
      nameCounts[fly.name] = (nameCounts[fly.name] || 0) + 1;
    });
    
    const duplicates = Object.entries(nameCounts).filter(([name, count]) => count > 1);
    
    if (duplicates.length > 0) {
      console.log('❌ Found duplicates:');
      duplicates.forEach(([name, count]) => {
        console.log(`  ${name}: ${count} entries`);
      });
    } else {
      console.log('✅ No duplicates found');
    }
    
    // Show current flies by type
    console.log('\n📊 CURRENT FLIES BY TYPE:');
    console.log('=========================');
    
    const typeGroups = {};
    flies.forEach(fly => {
      if (!typeGroups[fly.type]) {
        typeGroups[fly.type] = [];
      }
      typeGroups[fly.type].push(fly);
    });
    
    Object.keys(typeGroups).sort().forEach(type => {
      console.log(`\n🏷️  ${type.toUpperCase()} (${typeGroups[type].length} flies):`);
      typeGroups[type].forEach(fly => {
        console.log(`  • ${fly.name} - Size: ${fly.size}, Color: ${fly.color}`);
      });
    });
    
    // Check if new patterns are missing
    console.log('\n🔍 MISSING NEW PATTERNS:');
    console.log('========================');
    
    const expectedNewPatterns = [
      'Articulated Sculpin', 'Game Changer', 'Double Bunny',
      'Morrish Mouse', 'Deer Hair Mouse', 'Foam Mouse',
      'Chernobyl Ant', 'Chubby Chernobyl'
    ];
    
    const existingNames = flies.map(fly => fly.name);
    const missingPatterns = expectedNewPatterns.filter(pattern => !existingNames.includes(pattern));
    
    if (missingPatterns.length > 0) {
      console.log('❌ Missing new patterns:');
      missingPatterns.forEach(pattern => {
        console.log(`  • ${pattern}`);
      });
    } else {
      console.log('✅ All new patterns present');
    }
    
    // Summary
    console.log('\n📋 DATABASE STATUS SUMMARY:');
    console.log('===========================');
    console.log(`Total flies: ${flies.length}`);
    console.log(`Duplicates: ${duplicates.length > 0 ? 'YES' : 'NO'}`);
    console.log(`New patterns: ${missingPatterns.length === 0 ? 'ALL PRESENT' : `${missingPatterns.length} MISSING`}`);
    
    if (duplicates.length > 0 || missingPatterns.length > 0) {
      console.log('\n🔧 RECOMMENDED ACTIONS:');
      console.log('=======================');
      
      if (duplicates.length > 0) {
        console.log('1. Remove duplicate flies manually in Supabase dashboard');
        duplicates.forEach(([name, count]) => {
          console.log(`   - Keep 1 copy of "${name}", delete ${count - 1} duplicate(s)`);
        });
      }
      
      if (missingPatterns.length > 0) {
        console.log('2. Add missing patterns manually in Supabase dashboard:');
        missingPatterns.forEach(pattern => {
          console.log(`   - Add "${pattern}" pattern`);
        });
      }
      
      console.log('\n3. Alternative: Temporarily disable RLS policies in Supabase:');
      console.log('   - Go to Supabase Dashboard > Authentication > Policies');
      console.log('   - Temporarily disable RLS for the flies table');
      console.log('   - Run the comprehensive update script');
      console.log('   - Re-enable RLS policies');
    } else {
      console.log('\n✅ Database is in good shape!');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkCurrentDatabase();
