import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Tag } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { getAllJobs } from '../../../services/jobs/jobs.service';
import { getErrorMessage } from '../../utils/errors';

function BrowseJobs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState({
    loading: true,
    error: null,
    jobs: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await getAllJobs();
        if (cancelled) return;
        if (error) {
          setState({ loading: false, error, jobs: [] });
          return;
        }
        setState({ loading: false, error: null, jobs: data || [] });
      } catch (err) {
        if (!cancelled) {
          setState({ loading: false, error: err, jobs: [] });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
        <Card>
          <Card.Content>
            <div className="text-center py-6 space-y-3">
              <p className="font-medium text-slate-900">Unable to load jobs</p>
              <p className="text-sm text-slate-600">
                {getErrorMessage(state.error)}
              </p>
              <Button
                variant="secondary"
                onClick={() => navigate(0)}
                className="mt-1"
              >
                Try again
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  if (!state.jobs.length) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Jobs
          </h1>
          <p className="mt-1 text-slate-600">
            Browse open roles and find your next opportunity.
          </p>
        </div>
        <EmptyState
          icon={Briefcase}
          title="No jobs available"
          description="There are no open roles yet. Check back again soon."
          actionLabel="Back to dashboard"
          onAction={() => navigate('/dashboard')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Jobs
          </h1>
          <p className="mt-1 text-slate-600">
            Browse open roles and click through for full details.
          </p>
        </div>
      </div>

      <Card>
        <Card.Content>
          <ul className="divide-y divide-slate-200">
            {state.jobs.map((job) => (
              <li key={job.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-slate-900">{job.title}</p>
                    <p className="text-sm text-slate-600">
                      {job.company}
                      {job.location ? ` · ${job.location}` : ''}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {job.category && (
                        <span className="inline-flex items-center gap-1">
                          <Tag className="size-3" />
                          {job.category}
                        </span>
                      )}
                      {job.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" />
                          {job.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Link to={`/jobs/${job.id}`} state={{ from: location.pathname }}>
                      <Button variant="ghost" size="sm">
                        View details
                      </Button>
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card.Content>
      </Card>
    </div>
  );
}

export default BrowseJobs;

