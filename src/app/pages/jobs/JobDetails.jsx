import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Tag,
  DollarSign,
  Calendar,
  FileText,
  Trash2,
  Pencil,
  Send,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/auth/useAuth';
import { getErrorMessage } from '../../utils/errors';
import { EMPLOYER, JOB_SEEKER } from '../../constants/roles';
import { useJobs } from '../../context/jobs/useJobs';
import toast from 'react-hot-toast';
import { useApplications } from '../../context/applications/useApplications';
import { checkApplicationExists } from '../../../services/applications/applications.service';

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function JobDetails() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { jobs, fetchJobById, deleteJob } = useJobs();
  const { applications, applyToJob } = useApplications();
  const [state, setState] = useState({
    loading: true,
    error: null,
  });
  const [applyState, setApplyState] = useState({
    message: '',
    submitting: false,
    hasApplied: false,
    checkingExisting: false,
  });

  const isEmployer = profile?.role === EMPLOYER;
  const isJobSeeker = profile?.role === JOB_SEEKER;
  const previousPath = location.state?.from;
  const backHref = previousPath || (isEmployer ? '/jobs/my-jobs' : '/jobs');

  const job = id ? jobs.find((j) => j.id === id) ?? null : null;

  useEffect(() => {
    if (!id || !user?.id || !isJobSeeker) return;

    const already = applications.some(
      (app) => app.job_id === id && app.seeker_id === user.id
    );
    if (already) {
      setApplyState((prev) => ({ ...prev, hasApplied: true }));
      return;
    }

    let cancelled = false;

    async function checkExisting() {
      setApplyState((prev) => ({ ...prev, checkingExisting: true }));
      const { data: exists, error } = await checkApplicationExists(id, user.id);
      if (cancelled) return;
      setApplyState((prev) => ({
        ...prev,
        hasApplied: Boolean(exists),
        checkingExisting: false,
      }));
      if (error) return;
    }

    checkExisting();

    return () => {
      cancelled = true;
    };
  }, [id, user?.id, isJobSeeker, applications]);

  useEffect(() => {
    if (!id) {
      setState({ loading: false, error: null });
      return;
    }

    let mounted = true;

    async function load() {
      try {
        if (jobsRefetchNotNeeded()) {
          setState({ loading: false, error: null });
          return;
        }

        const { error } = await fetchJobById(id);
        if (!mounted) return;
        if (error) {
          setState({ loading: false, error });
          return;
        }
        setState({ loading: false, error: null });
      } catch (err) {
        if (!mounted) return;
        setState({ loading: false, error: err });
      } finally {
        if (mounted) {
          setState((prev) => (prev.loading ? { ...prev, loading: false } : prev));
        }
      }
    }

    function jobsRefetchNotNeeded() {
      return Boolean(job);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id, fetchJobById, job]);

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
          to={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <Card>
          <Card.Content>
            <div className="text-center py-6">
              <p className="font-medium text-slate-900 mb-2">Something went wrong</p>
              <p className="text-sm text-slate-600 mb-4">
                {getErrorMessage(state.error)}
              </p>
              <Link to={backHref}>
                <Button variant="primary">Back to jobs</Button>
              </Link>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <Link
          to={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <Card>
          <Card.Content>
            <div className="text-center py-6">
              <p className="font-medium text-slate-900 mb-2">Job not found</p>
              <p className="text-sm text-slate-600 mb-4">
                This job may have been removed or the link is incorrect.
              </p>
              <Link to={backHref}>
                <Button variant="primary">Back to jobs</Button>
              </Link>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  const postedDate = formatDate(job.created_at);
  const hasSalary =
    (job.salary_min != null && job.salary_min > 0) ||
    (job.salary_max != null && job.salary_max > 0);

  const handleDelete = async () => {
    const ok = window.confirm('Delete this job? This cannot be undone.');
    if (!ok) return;
    const { error } = await deleteJob(job.id);
    if (error) return;
    toast.success('Job deleted');
    navigate('/jobs/my-jobs', { replace: true });
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!id || !user?.id || applyState.submitting || applyState.hasApplied) return;

    setApplyState((prev) => ({ ...prev, submitting: true }));
    const { error } = await applyToJob(id, applyState.message);
    setApplyState((prev) => ({ ...prev, submitting: false }));

    if (error) {
      toast.error(
        error === 'You already applied to this job.'
          ? 'You already applied to this job.'
          : error
      );
      if (error === 'You already applied to this job.') {
        setApplyState((prev) => ({ ...prev, hasApplied: true }));
      }
      return;
    }

    toast.success('Application submitted');
    setApplyState((prev) => ({ ...prev, hasApplied: true }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to={backHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-4 text-slate-400" />
                  {job.company}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="size-4 text-slate-400" />
                  {job.category}
                </span>
              </div>
            </div>
            {isEmployer && user?.id && job.employer_id === user.id && (
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/jobs/${job.id}/edit`} className="shrink-0">
                  <Button variant="secondary" size="sm" leftIcon={Pencil}>
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={Trash2}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </Card.Header>
        <Card.Content className="space-y-4">
          {job.location && (
            <div className="flex items-start gap-3">
              <MapPin className="size-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="text-sm text-slate-700">{job.location}</span>
            </div>
          )}

          {hasSalary && (
            <div className="flex items-start gap-3">
              <DollarSign className="size-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="text-sm text-slate-700">
                {job.salary_min != null && job.salary_max != null
                  ? `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}`
                  : job.salary_min != null
                    ? `From $${job.salary_min.toLocaleString()}`
                    : job.salary_max != null
                      ? `Up to $${job.salary_max.toLocaleString()}`
                      : null}
              </span>
            </div>
          )}

          {postedDate && (
            <div className="flex items-start gap-3">
              <Calendar className="size-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="text-sm text-slate-600">Posted {postedDate}</span>
            </div>
          )}

          {job.description && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="size-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Description</h2>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          )}
        </Card.Content>
      </Card>
      {isJobSeeker && (
        <Card>
          <Card.Header>
            <h2 className="text-sm font-semibold text-slate-900">
              Apply to this job
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Optional: include a short note to the employer with your application.
            </p>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="w-full">
                <label
                  htmlFor="application-message"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Message to employer (optional)
                </label>
                <textarea
                  id="application-message"
                  name="application-message"
                  rows={4}
                  placeholder="Share a brief note about why you're interested in this role…"
                  value={applyState.message}
                  onChange={(e) =>
                    setApplyState((prev) => ({ ...prev, message: e.target.value }))
                  }
                  className={`
                    w-full rounded-lg border bg-white px-3 py-2.5
                    placeholder:text-slate-400 text-slate-900
                    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 focus:border-transparent
                    transition-shadow duration-150 resize-y min-h-[96px]
                    border-slate-200 hover:border-slate-300
                  `}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  You can&apos;t edit your message after applying.
                </p>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  leftIcon={Send}
                  disabled={
                    applyState.submitting ||
                    applyState.hasApplied ||
                    applyState.checkingExisting
                  }
                  loading={applyState.submitting}
                >
                  {applyState.hasApplied ? 'Applied' : 'Apply now'}
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      )}
    </div>
  );
}

export default JobDetails;
