import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase, hasSupabaseEnv } from '../../../services/supabase/supabaseClient';
import {
  getJobById as getJobByIdService,
  getMyJobs as getMyJobsService,
  updateJob as updateJobService,
  deleteJob as deleteJobService,
} from '../../../services/jobs/jobs.service';
import { getErrorMessage } from '../../utils/errors';
import { JobsContext } from './jobsContext';

function upsertJob(list, job, { prependIfNew = false } = {}) {
  const idx = list.findIndex((j) => j.id === job.id);
  if (idx === -1) return prependIfNew ? [job, ...list] : [...list, job];
  const next = [...list];
  next[idx] = job;
  return next;
}

function patchJob(list, jobId, updates) {
  const idx = list.findIndex((j) => j.id === jobId);
  if (idx === -1) return list;
  const next = [...list];
  next[idx] = { ...next[idx], ...updates };
  return next;
}

function removeJob(list, jobId) {
  const idx = list.findIndex((j) => j.id === jobId);
  if (idx === -1) return list;
  return [...list.slice(0, idx), ...list.slice(idx + 1)];
}

export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const jobsRef = useRef(jobs);

  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  const fetchMyJobs = useCallback(async (employerId) => {
    if (jobsRef.current.length > 0) {
      return { data: jobsRef.current, error: null };
    }

    const { data, error } = await getMyJobsService(employerId);
    if (error) return { data: null, error };
    setJobs(Array.isArray(data) ? data : []);
    return { data, error: null };
  }, []);

  const fetchJobById = useCallback(async (jobId) => {
    const { data, error } = await getJobByIdService(jobId);
    if (error) return { data: null, error };
    if (data?.id) setJobs((prev) => upsertJob(prev, data, { prependIfNew: true }));
    return { data, error: null };
  }, []);

  const updateJob = useCallback(async (jobId, updates) => {
    const previousJob = jobsRef.current.find((j) => j.id === jobId) ?? null;

    setJobs((prev) => patchJob(prev, jobId, updates));

    const { data, error } = await updateJobService(jobId, updates);
    if (error) {
      if (previousJob) setJobs((prev) => upsertJob(prev, previousJob));
      toast.error(getErrorMessage(error));
      return { data: null, error };
    }

    if (data?.id) setJobs((prev) => upsertJob(prev, data));
    return { data, error: null };
  }, []);

  const deleteJob = useCallback(async (jobId) => {
    const previousJobs = jobsRef.current;
    setJobs((prev) => removeJob(prev, jobId));

    const { error } = await deleteJobService(jobId);
    if (error) {
      setJobs(previousJobs);
      toast.error(getErrorMessage(error));
      return { error };
    }

    return { error: null };
  }, []);

  useEffect(() => {
    if (!supabase || !hasSupabaseEnv) return;

    const channel = supabase
      .channel('jobs:realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'jobs' },
        (payload) => {
          const row = payload?.new;
          if (!row?.id) return;
          setJobs((prev) => (prev.some((j) => j.id === row.id) ? prev : [row, ...prev]));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'jobs' },
        (payload) => {
          const row = payload?.new;
          if (!row?.id) return;
          setJobs((prev) => upsertJob(prev, row, { prependIfNew: false }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'jobs' },
        (payload) => {
          const oldRow = payload?.old;
          const id = oldRow?.id;
          if (!id) return;
          setJobs((prev) => removeJob(prev, id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const value = useMemo(
    () => ({
      jobs,
      fetchMyJobs,
      fetchJobById,
      updateJob,
      deleteJob,
    }),
    [jobs, fetchMyJobs, fetchJobById, updateJob, deleteJob]
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

