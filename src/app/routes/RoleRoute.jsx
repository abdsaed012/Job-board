import { Navigate } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/auth/useAuth';

function RoleRoute({ allowedRoles, children }) {
  const { user, profile, authLoading, signOut } = useAuth();

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

  if (!profile) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50 px-4">
        <Card className="max-w-md w-full">
          <Card.Header>
            <h2 className="text-lg font-semibold text-slate-900">
              Profile not found
            </h2>
          </Card.Header>
          <Card.Content>
            <p className="text-sm text-slate-600">
              We couldn&apos;t find a profile for your account. Try signing out and
              signing back in. If the issue persists, contact support.
            </p>
            <Button
              className="mt-4"
              variant="primary"
              onClick={() => {
                void signOut();
              }}
            >
              Sign out
            </Button>
          </Card.Content>
        </Card>
      </div>
    );
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleRoute;

