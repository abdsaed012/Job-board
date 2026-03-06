import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, hasSupabaseEnv } from '../../../services/supabase/supabaseClient';
import {
  checkApplicationExists,
  createApplication,
  getApplicationsBySeeker,
  updateApplicationStatus as updateApplicationStatusService,
} from '../../../services/applications/applications.service';
import { ApplicationsContext } from './applicationsContext';
import { useAuth } from '../auth/useAuth';
import { EMPLOYER, JOB_SEEKER } from '../../constants/roles';

function upsertApplication(list, app) {
  const idx = list.findIndex((a) => a.id === app.id);
  if (idx === -1) return [app, ...list];
  const next = [...list];
  next[idx] = app;
  return next;
}

function removeApplication(list, id) {
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return list;
  return [...list.slice(0, idx), ...list.slice(idx + 1)];
}

export function ApplicationsProvider({ children }) {
  const { user, profile, authLoading } = useAuth();
  const userId = user?.id ?? null;
  const userRole = profile?.role ?? null;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applicationsRef = useRef(applications);
  useEffect(() => {
    applicationsRef.current = applications;
  }, [applications]);

  const refreshApplications = useCallback(async () => {
    if (!userId || userRole !== JOB_SEEKER) {
      return { data: null, error: null };
    }

    if (applicationsRef.current.length > 0) {
      return { data: applicationsRef.current, error: null };
    }

    setLoading(true);
    setError(null);
    const { data, error: svcError } = await getApplicationsBySeeker(userId);
    setLoading(false);

    if (svcError) {
      setError(svcError);
      return { data: null, error: svcError };
    }

    setApplications(Array.isArray(data) ? data : []);
    return { data, error: null };
  }, [userId, userRole]);

  const applyToJob = useCallback(
    async (jobId, message = '', tempId) => {
      if (!userId || userRole !== JOB_SEEKER) {
        return { error: 'You must be signed in as a job seeker to apply.' };
      }

      const { data: exists, error: existsError } = await checkApplicationExists(jobId, userId);
      if (existsError) {
        return { error: existsError };
      }
      if (exists) {
        return { error: 'You already applied to this job.' };
      }

      const optimisticId = tempId || `temp-${crypto.randomUUID?.() || Date.now()}`;
      const now = new Date().toISOString();
      const optimisticApp = {
        id: optimisticId,
        job_id: jobId,
        seeker_id: userId,
        message,
        status: 'pending',
        created_at: now,
        updated_at: now,
        jobs: null,
        isOptimistic: true,
      };

      setApplications((prev) => [optimisticApp, ...prev]);

      const { data, error: svcError } = await createApplication({
        job_id: jobId,
        seeker_id: userId,
        message,
      });

      if (svcError || !data) {
        setApplications((prev) => removeApplication(prev, optimisticId));
        return { error: svcError || 'Unable to submit your application.' };
      }

      setApplications((prev) => {
        const withoutOptimistic = removeApplication(prev, optimisticId);
        return upsertApplication(withoutOptimistic, { ...data, isOptimistic: false });
      });

      return { error: null, data };
    },
    [userId, userRole]
  );

  const updateApplicationStatus = useCallback(async (applicationId, status) => {
    const previous = applicationsRef.current.find((a) => a.id === applicationId) ?? null;

    if (previous) {
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
      );
    }

    const { data, error: svcError } = await updateApplicationStatusService(applicationId, status);

    if (svcError || !data) {
      if (previous) {
        setApplications((prev) => upsertApplication(prev, previous));
      }
      return { error: svcError || 'Unable to update application.' };
    }

    setApplications((prev) => upsertApplication(prev, data));
    return { error: null, data };
  }, []);

  useEffect(() => {
    if (
      authLoading ||
      !supabase ||
      !hasSupabaseEnv ||
      !userId ||
      userRole !== JOB_SEEKER
    ) {
      return;
    }

    const channel = supabase
      .channel('applications:realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'applications' },
        (payload) => {
          const row = payload?.new;
          if (!row?.id || row.seeker_id !== userId) return;
          setApplications((prev) => {
            if (prev.some((a) => a.id === row.id)) return prev;
            return upsertApplication(prev, { ...row, jobs: null });
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'applications' },
        (payload) => {
          const row = payload?.new;
          if (!row?.id || row.seeker_id !== userId) return;
          setApplications((prev) => upsertApplication(prev, { ...row, jobs: null }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'applications' },
        (payload) => {
          const oldRow = payload?.old;
          const id = oldRow?.id;
          if (!id || oldRow.seeker_id !== userId) return;
          setApplications((prev) => removeApplication(prev, id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userRole, authLoading]);

  const value = useMemo(
    () => ({
      applications,
      loading,
      error,
      applyToJob,
      refreshApplications,
      updateApplicationStatus,
    }),
    [applications, loading, error, applyToJob, refreshApplications, updateApplicationStatus]
  );

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

