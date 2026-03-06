import { useContext } from 'react';
import { ApplicationsContext } from './applicationsContext';

export function useApplications() {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error('useApplications must be used within an ApplicationsProvider');
  return ctx;
}

