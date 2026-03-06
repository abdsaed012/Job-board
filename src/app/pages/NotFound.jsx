import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50">
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
        actionLabel="Go to dashboard"
        onAction={() => navigate('/dashboard')}
      />
    </div>
  );
}

export default NotFound;
