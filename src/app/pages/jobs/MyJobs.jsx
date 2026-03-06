import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Trash2, Pencil, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/auth/useAuth';
import { useJobs } from '../../context/jobs/useJobs';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/errors';

function MyJobs() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { jobs, fetchMyJobs, deleteJob } = useJobs();
  const myJobs = user?.id ? jobs.filter((j) => j.employer_id === user.id) : [];
  const [loading, setLoading] = useState(() => (user?.id ? myJobs.length === 0 : false));

  useEffect(() => {
    let cancelled = false;

    async function fetchJobs() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      if (jobs.length > 0) {
        setLoading(false);
        return;
      }

      const { error } = await fetchMyJobs(user.id);
      if (cancelled) return;
      setLoading(false);
      if (error) toast.error(getErrorMessage(error));
    }

    fetchJobs();
    return () => { cancelled = true; };
  }, [user?.id, jobs.length, fetchMyJobs]);

  const isEmployer = profile?.role === 'employer';

  const handleDelete = async (jobId) => {
    const ok = window.confirm('Delete this job? This cannot be undone.');
    if (!ok) return;
    await deleteJob(jobId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            My jobs
          </h1>
          <p className="mt-1 text-slate-600">
            View and manage your job listings
          </p>
        </div>
        {isEmployer && (
          <Link to="/jobs/create" className="shrink-0">
            <Button variant="primary" leftIcon={Plus}>
              Post a job
            </Button>
          </Link>
        )}
      </div>

      <Card>
        {loading ? (
          <Card.Content className="flex items-center justify-center py-12">
            <Spinner size="lg" className="text-slate-500" />
          </Card.Content>
        ) : myJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="You haven&apos;t posted any jobs. Create your first listing to get started."
            actionLabel="Post a job"
            onAction={() => navigate('/jobs/create')}
          />
        ) : (
          <Card.Content>
            <ul className="divide-y divide-slate-200">
              {myJobs.map((job) => (
                <li key={job.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{job.title}</p>
                      <p className="text-sm text-slate-600">
                        {job.company} · {job.location}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {job.category}
                      </span>
                      <Link
                        to={`/jobs/${job.id}`}
                        state={{ from: location.pathname }}
                        className="shrink-0"
                      >
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                      {isEmployer && (
                        <Link
                          to={`/jobs/${job.id}/applicants`}
                          state={{ from: location.pathname }}
                          className="shrink-0"
                        >
                          <Button variant="secondary" size="sm" leftIcon={Users}>
                            Applicants
                          </Button>
                        </Link>
                      )}
                      <Link to={`/jobs/${job.id}/edit`} className="shrink-0">
                        <Button variant="secondary" size="sm" leftIcon={Pencil}>
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={Trash2}
                        onClick={() => handleDelete(job.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card.Content>
        )}
      </Card>
    </div>
  );
}

export default MyJobs;
