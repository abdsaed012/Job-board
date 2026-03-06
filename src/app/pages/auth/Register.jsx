import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/auth/useAuth';
import { EMPLOYER, JOB_SEEKER } from '../../constants/roles';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(JOB_SEEKER);
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    setSubmitting(true);
    const result = await signUp({ fullName, email, password, role });
    setSubmitting(false);

    if (result.error) {
      const message =
        result.error.message || 'Unable to create your account.';
      toast.error(message);
      return;
    }

    const hasImmediateSession = Boolean(result.data?.session);

    if (hasImmediateSession) {
      toast.success('Account created. Redirecting to your dashboard…');
      navigate('/', { replace: true });
    } else {
      toast.success('Account created. Check your email to confirm your account.');
    }
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold text-slate-900">Create account</h2>
        <p className="text-sm text-slate-600 mt-1">
          Join JobBoard to find opportunities or hire talent
        </p>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            type="text"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={User}
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              I am a
            </label>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center gap-2 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50 has-[:checked]:ring-2 has-[:checked]:ring-slate-900 has-[:checked]:ring-offset-2">
                <input
                  type="radio"
                  name="role"
                  value={JOB_SEEKER}
                  checked={role === JOB_SEEKER}
                  onChange={(e) => setRole(e.target.value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">Job seeker</span>
              </label>
              <label className="flex-1 flex items-center gap-2 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50 has-[:checked]:ring-2 has-[:checked]:ring-slate-900 has-[:checked]:ring-offset-2">
                <input
                  type="radio"
                  name="role"
                  value={EMPLOYER}
                  checked={role === EMPLOYER}
                  onChange={(e) => setRole(e.target.value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">Employer</span>
              </label>
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={submitting}
            loading={submitting}
          >
            Create account
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-slate-900 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Card.Content>
    </Card>
  );
}

export default Register;
