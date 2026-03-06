export function formatError(error) {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
}

export function getErrorMessage(error) {
  return formatError(error);
}
