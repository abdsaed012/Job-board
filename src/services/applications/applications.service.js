import { supabase, hasSupabaseEnv, getSupabaseEnvError } from '../supabase/supabaseClient';

function buildEnvError() {
  const message = getSupabaseEnvError?.() || 'Supabase is not configured.';
  return message;
}

function normalizeError(error) {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return 'Something went wrong';
}

export async function createApplication({ job_id, seeker_id, message }) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  try {
    const { data, error } = await supabase
      .from('applications')
      .insert([{ job_id, seeker_id, message }])
      .select(
        `
          id,
          job_id,
          seeker_id,
          message,
          status,
          created_at,
          updated_at,
          jobs:jobs (
            id,
            company,
            title,
            location,
            category,
            created_at
          )
        `
      )
      .maybeSingle();

    return { data, error: normalizeError(error) };
  } catch (err) {
    return { data: null, error: normalizeError(err) };
  }
}

export async function getApplicationsBySeeker(seekerId) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  try {
    const { data, error } = await supabase
      .from('applications')
      .select(
        `
          id,
          job_id,
          seeker_id,
          message,
          status,
          created_at,
          updated_at,
          jobs:jobs (
            id,
            company,
            title,
            location,
            category,
            created_at
          )
        `
      )
      .eq('seeker_id', seekerId)
      .order('created_at', { ascending: false });

    return { data: data ?? [], error: normalizeError(error) };
  } catch (err) {
    return { data: null, error: normalizeError(err) };
  }
}

export async function getApplicationsForJob(jobId) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  try {
    const { data, error } = await supabase
      .from('applications')
      .select(
        `
          id,
          job_id,
          seeker_id,
          message,
          status,
          created_at,
          profiles ( id, full_name )
        `
      )
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    return { data: data ?? [], error: normalizeError(error) };
  } catch (err) {
    return { data: null, error: normalizeError(err) };
  }
}

export async function checkApplicationExists(jobId, seekerId) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: false, error: buildEnvError() };
  }

  try {
    const { count, error } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', jobId)
      .eq('seeker_id', seekerId);

    return { data: Boolean(count && count > 0), error: normalizeError(error) };
  } catch (err) {
    return { data: false, error: normalizeError(err) };
  }
}

/** Use when you need the count in parallel with fetching jobs (e.g. dashboard). */
export async function getApplicationsCountForEmployer(employerId) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: 0, error: buildEnvError() };
  }

  if (!employerId) {
    return { data: 0, error: null };
  }

  try {
    const { count, error } = await supabase
      .from('applications')
      .select('id, jobs!inner(employer_id)', { count: 'exact', head: true })
      .eq('jobs.employer_id', employerId);

    return { data: count ?? 0, error: normalizeError(error) };
  } catch (err) {
    return { data: 0, error: normalizeError(err) };
  }
}

export async function getApplicationsCountForJobs(jobIds) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: 0, error: buildEnvError() };
  }

  if (!jobIds || jobIds.length === 0) {
    return { data: 0, error: null };
  }

  try {
    const { count, error } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .in('job_id', jobIds);

    return { data: count ?? 0, error: normalizeError(error) };
  } catch (err) {
    return { data: 0, error: normalizeError(err) };
  }
}

export async function updateApplicationStatus(applicationId, status) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  try {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .select(
        `
          id,
          job_id,
          seeker_id,
          message,
          status,
          created_at,
          updated_at,
          jobs:jobs (
            id,
            company,
            title,
            location,
            category,
            created_at
          )
        `
      )
      .maybeSingle();

    return { data, error: normalizeError(error) };
  } catch (err) {
    return { data: null, error: normalizeError(err) };
  }
}

