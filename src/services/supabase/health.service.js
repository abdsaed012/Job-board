import { supabase, hasSupabaseEnv, getSupabaseEnvError } from './supabaseClient';

export async function checkSupabaseHealth() {
  if (!hasSupabaseEnv || !supabase) {
    return {
      ok: false,
      message: getSupabaseEnvError() ?? 'Supabase is not configured.',
    };
  }

  try {
    const { error } = await supabase.auth.getSession();

    if (error) {
      return {
        ok: false,
        message: error.message || 'Unable to reach Supabase.',
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: err?.message || 'Unable to reach Supabase.',
    };
  }
}

