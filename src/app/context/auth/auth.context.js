import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  profile: null,
  authLoading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

