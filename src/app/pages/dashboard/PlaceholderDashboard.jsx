import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Users, PlusCircle, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/auth/useAuth';
import { useJobs } from '../../context/jobs/useJobs';
import { getApplicationsCountForEmployer } from '../../../services/applications/applications.service';
import { EMPLOYER } from '../../constants/roles';
import { getErrorMessage } from '../../utils/errors';
import toast from 'react-hot-toast';

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function PlaceholderDashboard() {
  const { user, profile } = useAuth();
  const { jobs, fetchMyJobs } = useJobs();
  const location = useLocation();

  const isEmployer = profile?.role === EMPLOYER;

  const myJobs = useMemo(
    () => (user?.id ? jobs.filter((j) => j.employer_id === user.id) : []),
    [jobs, user]
  );

  const [loading, setLoading] = useState(() => (user?.id && isEmployer ? myJobs.length === 0 : false));
  const [applicantsCount, setApplicantsCount] = useState(null);

  useEffect(() => {
    if (!user?.id || !isEmployer) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    let cancelled = false;

    async function load() {
      const [jobsResult, applicantsResult] = await Promise.all([
        fetchMyJobs(user.id),
        getApplicationsCountForEmployer(user.id),
      ]);

      if (cancelled) return;

      setLoading(false);

      if (jobsResult.error) {
        toast.error(getErrorMessage(jobsResult.error));
      }
      if (applicantsResult.error) {
        toast.error(getErrorMessage(applicantsResult.error));
        setApplicantsCount(0);
      } else {
        setApplicantsCount(applicantsResult.data ?? 0);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user?.id, isEmployer, fetchMyJobs]);

  if (!isEmployer) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Dashboard</h1>
        <p className="text-sm text-slate-600">
          This dashboard is available for employers. Use the navigation to access your
          pages.
        </p>
      </div>
    );
  }

  const totalJobs = myJobs.length;
  const recentJobs = [...myJobs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const hasJobs = totalJobs > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Welcome back
          </h1>
          <p className="mt-1 text-slate-600">
            Get an overview of your jobs and recent activity.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/jobs/create">
            <Button variant="primary" leftIcon={PlusCircle}>
              Post a job
            </Button>
          </Link>
          <Link to="/jobs/my-jobs">
            <Button variant="secondary">My jobs</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <Card.Content className="flex items-center gap-4">
            <div className="rounded-lg bg-slate-100 p-2.5 flex items-center justify-center">
              <Briefcase className="size-5 text-slate-700" aria-hidden />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total jobs posted</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {loading ? '—' : totalJobs}
              </p>
            </div>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="flex items-center gap-4">
            <div className="rounded-lg bg-slate-100 p-2.5 flex items-center justify-center">
              <Users className="size-5 text-slate-700" aria-hidden />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total applicants</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {loading ? '—' : applicantsCount ?? 0}
              </p>
            </div>
          </Card.Content>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Recent jobs</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Your latest job postings, newest first.
              </p>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner size="lg" className="text-slate-500" />
            </div>
          ) : !hasJobs ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs yet"
              description="You haven't posted any jobs. Create your first listing to get started."
              actionLabel="Post a job"
              onAction={() => (window.location.href = '/jobs/create')}
            />
          ) : recentJobs.length === 0 ? (
            <p className="text-sm text-slate-600">No recent jobs to show yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {recentJobs.map((job) => {
                const createdDate = formatDate(job.created_at);
                return (
                  <li key={job.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium text-slate-900 truncate">
                          {job.title}
                        </p>
                        <p className="text-sm text-slate-600 truncate">
                          {job.company}
                          {job.location ? ` · ${job.location}` : ''}
                        </p>
                        {createdDate && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="size-3" aria-hidden />
                            Posted {createdDate}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-wrap gap-2">
                        <Link
                          to={`/jobs/${job.id}`}
                          state={{ from: location.pathname }}
                        >
                          <Button variant="ghost" size="sm">
                            View job
                          </Button>
                        </Link>
                        <Link
                          to={`/jobs/${job.id}/applicants`}
                          state={{ from: location.pathname }}
                        >
                          <Button variant="secondary" size="sm">
                            Applicants
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}

export default PlaceholderDashboard;
