import { supabase, hasSupabaseEnv, getSupabaseEnvError } from '../supabase/supabaseClient';

function buildEnvError() {
  const message = getSupabaseEnvError?.() || 'Supabase is not configured.';
  return new Error(message);
}

export async function createJob(jobData) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert([jobData])
    .select()
    .single();

  return { data, error };
}

export async function updateJob(id, patch) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  const { data, error } = await supabase
    .from('jobs')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteJob(id) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  const { error } = await supabase.from('jobs').delete().eq('id', id);

  return { data: null, error: error ?? null };
}

export async function getJobById(id) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return { data, error };
}

export async function getAllJobs() {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  return { data: data ?? [], error };
}

export async function getMyJobs(employerId) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('employer_id', employerId)
    .order('created_at', { ascending: false });

  return { data: data ?? [], error };
}
