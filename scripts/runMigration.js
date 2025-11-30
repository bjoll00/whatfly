/**
 * Run Database Migration Script
 * 
 * This script runs the profiles table migration using the Supabase service role key.
 * Run with: node scripts/runMigration.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables:');
  if (!supabaseUrl) console.error('   - EXPO_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key (has admin privileges)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Running profiles table migration...\n');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, 'migrations', 'create_profiles_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Split the SQL into individual statements
    // We need to run them one at a time because some might fail if they already exist
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 60).replace(/\n/g, ' ') + '...';
      
      try {
        // Use the rpc function to execute raw SQL
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });

        if (error) {
          // Check if it's an "already exists" type error
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.code === '42P07' || // relation already exists
              error.code === '42710') { // duplicate object
            console.log(`⏭️  [${i + 1}/${statements.length}] Skipped (already exists): ${preview}`);
            skipCount++;
          } else {
            console.error(`❌ [${i + 1}/${statements.length}] Error: ${preview}`);
            console.error(`   ${error.message}`);
            errorCount++;
          }
        } else {
          console.log(`✅ [${i + 1}/${statements.length}] Success: ${preview}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ [${i + 1}/${statements.length}] Exception: ${preview}`);
        console.error(`   ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors.');
      console.log('   You may need to run some statements manually in the Supabase SQL Editor.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Alternative approach: Execute SQL directly via REST API
async function runMigrationViaRest() {
  console.log('🚀 Running profiles table migration via REST API...\n');

  try {
    const migrationPath = join(__dirname, 'migrations', 'create_profiles_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Use the Supabase REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql_query: migrationSQL })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log('✅ Migration executed successfully!');
  } catch (error) {
    console.error('❌ REST API migration failed:', error.message);
    console.log('\n📝 Falling back to direct table creation...');
    await createTablesDirectly();
  }
}

// Direct approach: Create tables using Supabase client
async function createTablesDirectly() {
  console.log('\n🔧 Creating profiles table directly via Supabase client...\n');

  try {
    // First, check if the table already exists by trying to select from it
    const { data: existingData, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('ℹ️  Profiles table already exists!');
      
      // Verify the table structure
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(0);
      
      if (!error) {
        console.log('✅ Table is accessible and ready to use.');
      }
      return;
    }

    // Table doesn't exist, we need to create it
    // Unfortunately, we can't create tables directly via the Supabase JS client
    // We need to use the SQL Editor or CLI for that
    
    console.log('❌ The profiles table does not exist and cannot be created via the API.');
    console.log('\n📋 Please run this SQL in the Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/aflfbalfpjhznkbwatqf/sql\n');
    
    const migrationPath = join(__dirname, 'migrations', 'create_profiles_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    console.log('--- BEGIN SQL ---');
    console.log(migrationSQL);
    console.log('--- END SQL ---');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the migration
createTablesDirectly();
