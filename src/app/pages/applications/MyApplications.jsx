import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useApplications } from '../../context/applications/useApplications';

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

function StatusBadge({ status }) {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border';

  if (status === 'accepted') {
    return (
      <span className={`${base} border-emerald-200 text-emerald-700 bg-emerald-50`}>
        Accepted
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span className={`${base} border-red-200 text-red-700 bg-red-50`}>Rejected</span>
    );
  }

  return (
    <span className={`${base} border-slate-200 text-slate-700 bg-slate-50`}>Pending</span>
  );
}

function MyApplications() {
  const { applications, loading, refreshApplications } = useApplications();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (applications.length === 0) {
      void refreshApplications();
    }
  }, [applications.length, refreshApplications]);

  if (loading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" className="text-slate-500" />
      </div>
    );
  }

  if (!loading && applications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="You haven't applied to any jobs. Browse open roles to get started."
          actionLabel="Browse jobs"
          onAction={() => navigate('/dashboard/seeker')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            My applications
          </h1>
          <p className="mt-1 text-slate-600">
            Track the jobs you&apos;ve applied to and their status.
          </p>
        </div>
        <Link to="/dashboard/seeker" className="shrink-0">
          <Button variant="secondary" size="sm">
            Back to dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <Card.Content>
          <ul className="divide-y divide-slate-200">
            {applications.map((app) => {
              const job = app.jobs;
              const appliedDate = formatDate(app.created_at);

              return (
                <li key={app.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {job?.title || 'Job no longer available'}
                        </p>
                        <StatusBadge status={app.status} />
                      </div>
                      {job && (
                        <p className="text-sm text-slate-600">
                          {job.company}
                          {job.location ? ` · ${job.location}` : ''}
                        </p>
                      )}
                      {app.message && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {app.message}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {appliedDate && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="size-3" />
                            Applied {appliedDate}
                          </span>
                        )}
                        {job && job.category && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" />
                            {job.category}
                          </span>
                        )}
                      </div>
                    </div>
                    {job && (
                      <div className="shrink-0 flex items-center gap-2">
                        <Link
                          to={`/jobs/${job.id}`}
                          state={{ from: location.pathname }}
                        >
                          <Button variant="ghost" size="sm">
                            View job
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card.Content>
      </Card>
    </div>
  );
}

export default MyApplications;

