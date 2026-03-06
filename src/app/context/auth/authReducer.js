export const initialAuthState = {
  user: null,
  profile: null,
  authLoading: true,
  error: null,
};

export function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, authLoading: action.payload };
    case 'SET_AUTH':
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile ?? null,
        error: null,
      };
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload ?? null,
      };
    case 'CLEAR_AUTH':
      return {
        ...state,
        user: null,
        profile: null,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload || null,
      };
    default:
      return state;
  }
}

