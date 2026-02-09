import { createClient } from '@supabase/supabase-js';

// IMPORTANT: In a real environment, set these in Vercel Project Settings
// VITE_SUPABASE_URL
// VITE_SUPABASE_ANON_KEY

// Cast import.meta to any to prevent TypeScript errors if vite types are missing
const env = (import.meta as any).env;

const supabaseUrl = env?.VITE_SUPABASE_URL || '';
const supabaseKey = env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;