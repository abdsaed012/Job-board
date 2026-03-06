import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/auth/useAuth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, user, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pendingRedirectRef = useRef(null);

  const redirectTo =
    (location.state && location.state.from) || '/';

  useEffect(() => {
    if (!authLoading && user && pendingRedirectRef.current) {
      const to = pendingRedirectRef.current;
      pendingRedirectRef.current = null;
      navigate(to, { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      toast.error(error.message || 'Unable to sign in.');
      return;
    }

    toast.success('Signed in successfully.');
    pendingRedirectRef.current = redirectTo;
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
        <p className="text-sm text-slate-600 mt-1">
          Enter your credentials to access your account
        </p>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={Mail}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={Lock}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={submitting}
            loading={submitting}
          >
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-slate-900 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </Card.Content>
    </Card>
  );
}

export default Login;
