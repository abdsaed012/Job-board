import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/auth/useAuth';
import { updateProfile } from '../../../services/profiles.service';
import { getErrorMessage } from '../../utils/errors';

function Settings() {
  const { user, profile, authLoading, setProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [fullNameError, setFullNameError] = useState(null);
  const [saving, setSaving] = useState(false);
  const fullNameRef = useRef(null);

  useEffect(() => {
    queueMicrotask(() => setFullName(profile?.full_name ?? ''));
  }, [profile?.full_name]);

  if (authLoading && !user) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" className="text-slate-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-slate-600">You must be signed in to view settings.</p>
      </div>
    );
  }

  const email = user.email || '';
  const role = profile?.role || '';
  const roleLabel =
    role === 'employer' ? 'Employer' : role === 'job_seeker' ? 'Job seeker' : '—';

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = fullName.trim();

    if (!trimmed) {
      setFullNameError('Full name is required.');
      return;
    }

    setFullNameError(null);
    setSaving(true);

    const { data, error } = await updateProfile(user.id, { full_name: trimmed });

    if (error || !data) {
      toast.error(getErrorMessage(error || 'Unable to update profile.'));
      setSaving(false);
      return;
    }

    setProfile(data);
    toast.success('Profile updated.');
    if (fullNameRef.current) {
      fullNameRef.current.blur();
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Settings</h1>
        <p className="mt-1 text-slate-600">
          Manage your account details. Your email and role are managed by the system.
        </p>
      </div>

      <Card>
        <Card.Header>
          <h2 className="font-semibold text-slate-900">Profile</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Update your basic account information.
          </p>
        </Card.Header>
        <Card.Content>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              error={fullNameError}
              ref={fullNameRef}
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              disabled
              autoComplete="email"
            />
            <Input label="Role" type="text" value={roleLabel} disabled />
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                loading={saving}
              >
                Save changes
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}

export default Settings;

