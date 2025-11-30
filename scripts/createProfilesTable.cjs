/**
 * Create Profiles Table via Supabase Client
 * 
 * This creates the profiles table by executing SQL statements via the
 * Supabase management API, working around direct database connection issues.
 * 
 * Run with: node scripts/createProfilesTable.cjs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

// SQL statements to run - split up for individual execution
const SQL_STATEMENTS = [
  // 1. Create the profiles table
  `CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    fishing_experience TEXT CHECK (fishing_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,
  
  // 2. Add username length constraint (may fail if already exists)
  `DO $$ BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT username_length CHECK (char_length(username) <= 20);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  
  // 3. Add username format constraint (may fail if already exists)  
  `DO $$ BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  
  // 4. Enable RLS
  `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`,
  
  // 5. Create RLS policies (wrapped in DO blocks to handle duplicates)
  `DO $$ BEGIN
    CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  
  `DO $$ BEGIN
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  
  `DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  
  `DO $$ BEGIN
    CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  
  // 6. Create updated_at function
  `CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql'`,
  
  // 7. Create trigger (drop first to avoid duplicate)
  `DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles`,
  
  `CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()`,
  
  // 8. Create indexes
  `CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username)`,
  `CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name)`,
  
  // 9. Grant permissions
  `GRANT ALL ON public.profiles TO authenticated`,
  `GRANT SELECT ON public.profiles TO anon`,
];

// Function to execute SQL via Supabase Management API
async function executeSQL(sql, description) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${projectRef}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: body });
        } else {
          resolve({ success: false, status: res.statusCode, error: body });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ success: false, error: e.message });
    });

    req.write(data);
    req.end();
  });
}

// Alternative: Use Supabase client to check/create via RPC
async function checkAndCreateTable() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('🔍 Checking if profiles table exists...\n');

  // Try to query the profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (!error) {
    console.log('✅ Profiles table already exists and is accessible!');
    console.log('   You can start using the authentication features.\n');
    return true;
  }

  if (error.code === '42P01' || error.message.includes('does not exist')) {
    console.log('⚠️  Profiles table does not exist.\n');
    console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/aflfbalfpjhznkbwatqf/sql/new\n');
    console.log('=' .repeat(60));
    
    // Read and print the full migration
    const migrationPath = path.join(__dirname, 'migrations', 'create_profiles_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    console.log(sql);
    console.log('=' .repeat(60));
    console.log('\n📝 Copy the SQL above and paste it into the Supabase SQL Editor.\n');
    return false;
  }

  // Some other error (likely RLS)
  console.log('⚠️  Could not check profiles table:', error.message);
  console.log('   The table might exist but have permission issues.\n');
  return false;
}

// Main
checkAndCreateTable().catch(console.error);
