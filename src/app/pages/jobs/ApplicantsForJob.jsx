import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Users, Check, X, MessageSquare, Calendar, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import {
  getApplicationsForJob,
  updateApplicationStatus as updateApplicationStatusService,
} from '../../../services/applications/applications.service';
import { getJobById } from '../../../services/jobs/jobs.service';
import { getErrorMessage } from '../../utils/errors';

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

function ApplicantsForJob() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = location.state?.from ?? '/dashboard/employer';
  const [state, setState] = useState({
    loading: true,
    error: null,
    applications: [],
    jobTitle: null,
  });
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    let mounted = true;

    async function load() {
      const [appsRes, jobRes] = await Promise.all([
        getApplicationsForJob(jobId),
        getJobById(jobId),
      ]);

      if (!mounted) return;

      if (appsRes.error) {
        setState({
          loading: false,
          error: appsRes.error,
          applications: [],
          jobTitle: jobRes.data?.title ?? null,
        });
        return;
      }

      setState({
        loading: false,
        error: null,
        applications: Array.isArray(appsRes.data) ? appsRes.data : [],
        jobTitle: jobRes.data?.title ?? null,
      });
    }

    load();
    return () => {
      mounted = false;
    };
  }, [jobId]);

  async function handleUpdateStatus(applicationId, nextStatus) {
    if (!applicationId || !nextStatus) return;

    const previous = state.applications.find((app) => app.id === applicationId) ?? null;
    if (!previous || previous.status === nextStatus) return;

    setUpdatingId(applicationId);

    // Optimistic update
    setState((current) => ({
      ...current,
      applications: current.applications.map((app) =>
        app.id === applicationId ? { ...app, status: nextStatus } : app
      ),
    }));

    const { data, error } = await updateApplicationStatusService(applicationId, nextStatus);

    if (error || !data) {
      // Rollback to previous status
      setState((current) => ({
        ...current,
        applications: current.applications.map((app) =>
          app.id === applicationId && previous
            ? { ...app, status: previous.status }
            : app
        ),
      }));
      toast.error(getErrorMessage(error || 'Unable to update application status.'));
      setUpdatingId(null);
      return;
    }

    // Ensure local state matches server response
    setState((current) => ({
      ...current,
      applications: current.applications.map((app) =>
        app.id === applicationId ? { ...app, ...data } : app
      ),
    }));

    setUpdatingId(null);
  }

  if (!jobId) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <Card>
          <Card.Content>
            <p className="text-slate-600">No job specified.</p>
          </Card.Content>
        </Card>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" className="text-slate-500" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <Card>
          <Card.Content>
            <div className="text-center py-6 space-y-3">
              <p className="font-medium text-slate-900">Unable to load applicants</p>
              <p className="text-sm text-slate-600">{getErrorMessage(state.error)}</p>
              <Link to={backTo}>
                <Button variant="primary" className="mt-2">
                  Back
                </Button>
              </Link>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  const { applications, jobTitle } = state;

  return (
    <div className="space-y-6">
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl flex items-center gap-2">
          <Users className="size-8 text-slate-600" aria-hidden />
          Applicants
        </h1>
        <p className="mt-1 text-slate-600">
          {jobTitle ? `Applications for: ${jobTitle}` : `Job ID: ${jobId}`}
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <Card.Content>
            <EmptyState
              icon={Users}
              title="No applicants yet"
              description="No one has applied to this job yet. Share the listing to attract candidates."
              actionLabel="Back"
              onAction={() => navigate(backTo)}
            />
          </Card.Content>
        </Card>
      ) : (
        <ul className="space-y-4">
          {applications.map((app) => {
            const rawProfile = app.profiles ?? app.profile;
            const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;
            const applicantName = profile?.full_name?.trim() || 'Unknown applicant';
            const appliedDate = formatDate(app.created_at);

            return (
              <li key={app.id}>
                <Card>
                  <Card.Content className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-900">{applicantName}</p>
                          <StatusBadge status={app.status} />
                        </div>
                        {appliedDate && (
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Calendar className="size-4 text-slate-400" aria-hidden />
                            Applied {appliedDate}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={Check}
                          disabled={updatingId === app.id || app.status !== 'pending'}
                          onClick={() => handleUpdateStatus(app.id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={X}
                          disabled={updatingId === app.id || app.status !== 'pending'}
                          onClick={() => handleUpdateStatus(app.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-1.5">
                        <MessageSquare className="size-4 text-slate-500" aria-hidden />
                        Message
                      </p>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 rounded-lg p-3">
                        {app.message?.trim() || 'No message provided'}
                      </p>
                    </div>
                  </Card.Content>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ApplicantsForJob;
