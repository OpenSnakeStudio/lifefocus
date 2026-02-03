// Supabase client with reverse proxy support for bypassing blocks
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use reverse proxy path to hide direct supabase.co requests
// In production (Vercel), use the app's origin + proxy path
// In development, Vite proxy handles it, but SDK still needs full URL
const getSupabaseUrl = () => {
  // For production deployment on Vercel, use the current origin with proxy path
  if (typeof window !== 'undefined' && window.location.origin.includes('lovable.app')) {
    return `${window.location.origin}/_supabase`;
  }
  if (typeof window !== 'undefined' && window.location.origin.includes('vercel.app')) {
    return `${window.location.origin}/_supabase`;
  }
  // For Lovable preview and development, use direct Supabase URL (proxy not available)
  return "https://jexrtsyokhegjxnvqjur.supabase.co";
};

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpleHJ0c3lva2hlZ2p4bnZxanVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA4MTcsImV4cCI6MjA4MDk3NjgxN30.tI3L5GGJMtlXwlNEM-6EsxyQ5BRNrsoP-jk4mzD01_o";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});