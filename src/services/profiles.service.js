import { supabase, hasSupabaseEnv, getSupabaseEnvError } from './supabase/supabaseClient';

function buildEnvError() {
  const message = getSupabaseEnvError?.() || 'Supabase is not configured.';
  return new Error(message);
}

export async function createProfile({ id, full_name, role }) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id, full_name, role }])
    .select()
    .single();

  return { data, error };
}

export async function getProfile(userId) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  return { data, error };
}

export async function updateProfile(userId, patch) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

