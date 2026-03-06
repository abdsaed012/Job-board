import { createElement, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, CheckCircle2, Clock, XCircle, Calendar, MapPin } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useApplications } from '../../context/applications/useApplications';
import { useAuth } from '../../context/auth/useAuth';

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

function StatCard({ label, value, icon, accentClass }) {
  return (
    <Card>
      <Card.Content className="flex items-center gap-4">
        <div
          className={`rounded-lg p-2.5 ${accentClass || 'bg-slate-100'} flex items-center justify-center`}
        >
          {createElement(icon, { className: 'size-5 text-slate-700', 'aria-hidden': true })}
        </div>
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        </div>
      </Card.Content>
    </Card>
  );
}

function JobSeekerDashboard() {
  const { profile } = useAuth();
  const { applications, loading, refreshApplications } = useApplications();
  const location = useLocation();

  const firstName = useMemo(() => {
    const name = profile?.full_name?.trim() || '';
    const segment = name.split(/\s+/)[0];
    return segment || null;
  }, [profile?.full_name]);

  const greeting = firstName ? `Welcome back, ${firstName}` : 'Welcome back';

  useEffect(() => {
    if (applications.length === 0) {
      void refreshApplications();
    }
  }, [applications.length, refreshApplications]);

  const stats = useMemo(() => {
    const total = applications.length;
    let pending = 0;
    let accepted = 0;
    let rejected = 0;

    for (const app of applications) {
      if (app.status === 'accepted') accepted += 1;
      else if (app.status === 'rejected') rejected += 1;
      else pending += 1;
    }

    return { total, pending, accepted, rejected };
  }, [applications]);

  const recent = useMemo(
    () =>
      [...applications]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5),
    [applications]
  );

  const showEmpty = !loading && applications.length === 0;
  const hydrating = loading && applications.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          {greeting}
        </h1>
        <p className="mt-1 text-slate-600">
          Track your applications and find your next opportunity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total applications"
          value={hydrating ? '—' : stats.total}
          icon={Briefcase}
          accentClass="bg-slate-100"
        />
        <StatCard
          label="Pending"
          value={hydrating ? '—' : stats.pending}
          icon={Clock}
          accentClass="bg-amber-50"
        />
        <StatCard
          label="Accepted"
          value={hydrating ? '—' : stats.accepted}
          icon={CheckCircle2}
          accentClass="bg-emerald-50"
        />
        <StatCard
          label="Rejected"
          value={hydrating ? '—' : stats.rejected}
          icon={XCircle}
          accentClass="bg-red-50"
        />
      </div>

      <Card>
        <Card.Header>
          <h2 className="font-semibold text-slate-900">Quick actions</h2>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/jobs">
              <Button variant="primary">Browse jobs</Button>
            </Link>
            <Link to="/applications/my-applications">
              <Button variant="secondary">My applications</Button>
            </Link>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Recent applications</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Your latest activity across all jobs.
              </p>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          {loading && applications.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <Spinner size="lg" className="text-slate-500" />
            </div>
          ) : showEmpty ? (
            <EmptyState
              icon={Briefcase}
              title="No applications yet"
              description="You haven't applied to any roles. Browse jobs to get started."
              actionLabel="Browse jobs"
              onAction={() => {
                window.location.assign('/jobs');
              }}
            />
          ) : recent.length === 0 ? (
            <p className="text-sm text-slate-600">
              No recent activity to show yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {recent.map((app) => {
                const job = app.jobs;
                const appliedDate = formatDate(app.created_at);

                return (
                  <li key={app.id} className="py-3 first:pt-0 last:pb-0">
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
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          {appliedDate && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="size-3" />
                              Applied {appliedDate}
                            </span>
                          )}
                          {job && job.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3" />
                              {job.location}
                            </span>
                          )}
                        </div>
                      </div>
                      {job && (
                        <div className="shrink-0">
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
          )}
        </Card.Content>
      </Card>
    </div>
  );
}

export default JobSeekerDashboard;

