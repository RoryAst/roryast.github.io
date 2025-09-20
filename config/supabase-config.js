// Supabase Configuration Template
// Copy this file and rename it to supabase-config.js
// Replace the placeholder values with your actual Supabase project credentials

const SUPABASE_CONFIG = {
    // Your Supabase project URL (found in Project Settings > API)
    url: 'https://izfhbdbktzvsirswhvai.supabase.co',
    
    // Your Supabase anon key (found in Project Settings > API)
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6ZmhiZGJrdHp2c2lyc3dodmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMTMwMDksImV4cCI6MjA3Mzg4OTAwOX0.4yYEWinKetLXuI_VCkFfen5YCifst2kinRPTNszomh0',
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
} else {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}

/*
SETUP INSTRUCTIONS:
1. Go to https://supabase.com and create a new project
2. Go to Project Settings > API
3. Copy your Project URL and replace 'YOUR_SUPABASE_URL'
4. Copy your anon public key and replace 'YOUR_SUPABASE_ANON_KEY'
5. Run the SQL from supabase-schema.sql in your Supabase SQL Editor
6. Update the script.js file to use your actual credentials
7. Test the email form to ensure it's working

SECURITY NOTES:
- The anon key is safe to use in client-side code
- Never expose your service role key in client-side code
- The RLS policies ensure proper access control
*/
