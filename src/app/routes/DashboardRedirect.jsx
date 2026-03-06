import { Navigate } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/auth/useAuth';
import { EMPLOYER, JOB_SEEKER } from '../constants/roles';

function DashboardRedirect() {
  const { user, profile, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <Spinner size="lg" className="text-slate-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role === EMPLOYER) {
    return <Navigate to="/dashboard/employer" replace />;
  }

  if (profile?.role === JOB_SEEKER) {
    return <Navigate to="/dashboard/seeker" replace />;
  }

  // Fallback if role missing or unexpected: send to generic dashboard
  return <Navigate to="/dashboard" replace />;
}

export default DashboardRedirect;

