import { supabase, hasSupabaseEnv, getSupabaseEnvError } from './supabase/supabaseClient';

function buildEnvError() {
  const message = getSupabaseEnvError?.() || 'Supabase is not configured.';
  return new Error(message);
}

export async function signUp(email, password) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  return supabase.auth.signUp({ email, password });
}

export async function signIn(email, password) {
  if (!supabase || !hasSupabaseEnv) {
    return { data: null, error: buildEnvError() };
  }

  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase || !hasSupabaseEnv) {
    return { error: buildEnvError() };
  }

  return supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase || !hasSupabaseEnv) {
    return { data: { session: null }, error: buildEnvError() };
  }

  return supabase.auth.getSession();
}

export function onAuthStateChange(handler) {
  if (!supabase || !hasSupabaseEnv) {
    return { unsubscribe: () => {} };
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    handler?.(event, session);
  });

  return {
    unsubscribe: () => {
      subscription.unsubscribe();
    },
  };
}

