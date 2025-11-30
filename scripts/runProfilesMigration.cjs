/**
 * Run Profiles Table Migration
 * 
 * This script connects directly to Supabase Postgres and runs the migration.
 * 
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/runProfilesMigration.cjs
 * 
 * Get your DATABASE_URL from:
 *   Supabase Dashboard → Project Settings → Database → Connection string → URI
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Check for DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ DATABASE_URL environment variable is required.\n');
  console.log('To get your database URL:');
  console.log('1. Go to: https://supabase.com/dashboard/project/aflfbalfpjhznkbwatqf/settings/database');
  console.log('2. Find "Connection string" section');
  console.log('3. Copy the URI (starts with postgresql://)\n');
  console.log('Then run:');
  console.log('  DATABASE_URL="your-connection-string" node scripts/runProfilesMigration.cjs\n');
  process.exit(1);
}

async function runMigration() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create_profiles_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split into individual statements and run each one
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📄 Running ${statements.length} SQL statements...\n`);

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 50).replace(/\n/g, ' ').trim() + '...';

      try {
        await client.query(statement);
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}`);
        successCount++;
      } catch (err) {
        // Check for "already exists" errors
        if (err.code === '42P07' || // relation already exists
            err.code === '42710' || // duplicate object
            err.code === '42P16' || // duplicate trigger
            err.message.includes('already exists')) {
          console.log(`⏭️  [${i + 1}/${statements.length}] Already exists: ${preview}`);
          skipCount++;
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Error: ${preview}`);
          console.error(`   Code: ${err.code}, Message: ${err.message}`);
        }
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Executed: ${successCount}`);
    console.log(`   ⏭️  Skipped (already exist): ${skipCount}`);
    console.log('\n🎉 Migration completed!');

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
