import { useEffect, useReducer, useCallback } from 'react';
import { authReducer, initialAuthState } from './authReducer';
import { AuthContext } from './auth.context';
import {
  signIn as signInService,
  signOut as signOutService,
  signUp as signUpService,
  getSession,
  onAuthStateChange,
} from '../../../services/auth.service';
import {
  createProfile,
  getProfile,
} from '../../../services/profiles.service';
import { EMPLOYER, JOB_SEEKER } from '../../constants/roles';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    let mounted = true;

    async function initialise() {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      try {
        const { data, error } = await getSession();

        if (!mounted) return;

        if (error) {
          dispatch({
            type: 'SET_ERROR',
            payload: error.message || 'Unable to restore session.',
          });
        }

        const session = data?.session;
        const user = session?.user ?? null;

        if (user) {
          const { data: profileData } = await getProfile(user.id);
          if (!mounted) return;
          dispatch({
            type: 'SET_AUTH',
            payload: { user, profile: profileData ?? null },
          });
        } else {
          dispatch({ type: 'CLEAR_AUTH' });
        }
      } finally {
        if (mounted) {
          dispatch({ type: 'AUTH_LOADING', payload: false });
        }
      }
    }

    initialise();

    const { unsubscribe } = onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        const { data: profileData } = await getProfile(user.id);
        if (!mounted) return;
        dispatch({
          type: 'SET_AUTH',
          payload: { user, profile: profileData ?? null },
        });
      }

      if (event === 'SIGNED_OUT') {
        dispatch({ type: 'CLEAR_AUTH' });
      }
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    const result = await signInService(email, password);
    if (result.error) {
      dispatch({
        type: 'SET_ERROR',
        payload: result.error.message || 'Unable to sign in.',
      });
    } else {
      dispatch({ type: 'SET_ERROR', payload: null });
    }
    dispatch({ type: 'AUTH_LOADING', payload: false });
    return result;
  }, []);

  const signOut = useCallback(async () => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    const result = await signOutService();
    if (result.error) {
      dispatch({
        type: 'SET_ERROR',
        payload: result.error.message || 'Unable to sign out.',
      });
    } else {
      dispatch({ type: 'CLEAR_AUTH' });
    }
    dispatch({ type: 'AUTH_LOADING', payload: false });
    return result;
  }, []);

  const signUp = useCallback(async ({ fullName, email, password, role }) => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    const result = await signUpService(email, password);

    if (result.error) {
      dispatch({
        type: 'SET_ERROR',
        payload: result.error.message || 'Unable to sign up.',
      });
      dispatch({ type: 'AUTH_LOADING', payload: false });
      return result;
    }

    const user = result.data?.user ?? result.user ?? null;

    if (user) {
      // Ensure role matches DB exactly: 'employer' or 'job_seeker'
      const normalizedRole =
        role === EMPLOYER || role === JOB_SEEKER ? role : JOB_SEEKER;

      await createProfile({
        id: user.id,
        full_name: fullName,
        role: normalizedRole,
      });

      const { data: profileData } = await getProfile(user.id);
      dispatch({
        type: 'SET_AUTH',
        payload: { user, profile: profileData ?? null },
      });
    }

    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'AUTH_LOADING', payload: false });
    return result;
  }, []);

  const setProfile = useCallback((profile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
  }, []);

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
