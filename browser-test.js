// Run this in your browser console on the auth page
// Copy and paste this entire code block

console.log('=== Browser Auth Test ===');

// Test 1: Check if Supabase client exists
if (typeof window !== 'undefined' && window.supabase) {
  console.log('Supabase client found');
} else {
  console.log('Supabase client not found - this might be the issue');
}

// Test 2: Check localStorage for Supabase session
const supabaseSession = localStorage.getItem('sb-aflfbalfpjhznkbwatqf-auth-token');
console.log('Supabase session in localStorage:', supabaseSession ? 'Found' : 'Not found');

// Test 3: Check all localStorage keys
console.log('All localStorage keys:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.includes('supabase') || key.includes('auth')) {
    console.log('  ', key, ':', localStorage.getItem(key)?.substring(0, 50) + '...');
  }
}

// Test 4: Try to get current session
if (typeof window !== 'undefined' && window.supabase) {
  window.supabase.auth.getSession().then(({ data: { session }, error }) => {
    console.log('Current session:', session?.user?.id || 'None');
    console.log('Error:', error?.message || 'None');
  });
}

console.log('=== End Browser Test ===');
