import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error(
    '❌ VITE_SUPABASE_URL is not defined!\n' +
    'Please check:\n' +
    '1. .env file exists locally\n' +
    '2. Environment variables are set in Vercel\n' +
    '3. You have redeployed after adding env vars'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    '❌ VITE_SUPABASE_ANON_KEY is not defined!\n' +
    'Please check:\n' +
    '1. .env file exists locally\n' +
    '2. Environment variables are set in Vercel\n' +
    '3. You have redeployed after adding env vars'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'skillmint-auth'
  }
});
