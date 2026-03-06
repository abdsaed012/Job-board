import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseEnvError() {
  if (hasSupabaseEnv) return null;

  if (!supabaseUrl && !supabaseAnonKey) {
    return 'Supabase environment variables are not configured.';
  }

  if (!supabaseUrl) {
    return 'VITE_SUPABASE_URL is missing.';
  }

  if (!supabaseAnonKey) {
    return 'VITE_SUPABASE_ANON_KEY is missing.';
  }

  return 'Supabase configuration is invalid.';
}

