import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/auth/useAuth';

function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <Spinner size="lg" className="text-slate-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname || '/dashboard' }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;
