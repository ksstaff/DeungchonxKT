import { createClient } from '@supabase/supabase-js';

// IMPORTANT: In a real environment, set these in .env.local
// REACT_APP_SUPABASE_URL
// REACT_APP_SUPABASE_ANON_KEY

// For this demo, we check if they are set in the environment. 
// If not, the db service will fallback to localStorage.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;
