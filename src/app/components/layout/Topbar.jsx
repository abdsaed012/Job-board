import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/auth/useAuth';
import { EMPLOYER, JOB_SEEKER } from '../../constants/roles';

function getInitials(profile, user) {
  const fullName = profile?.full_name?.trim();
  if (fullName) {
    const parts = fullName.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    const combined = `${first}${last}`.toUpperCase();
    if (combined) return combined;
  }

  const email = user?.email?.trim() || '';
  if (email) {
    const firstChar = email[0]?.toUpperCase() ?? '';
    if (firstChar) return firstChar;
  }

  return 'U';
}

function getRoleLabel(role) {
  if (role === EMPLOYER) return 'Employer';
  if (role === JOB_SEEKER) return 'Job seeker';
  return '—';
}

function Topbar({ title, onMenuClick }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = getInitials(profile, user);
  const fullName = profile?.full_name?.trim() || 'Account';
  const email = user?.email || '';
  const roleLabel = getRoleLabel(profile?.role);

  const handleToggleMenu = () => {
    setMenuOpen((open) => !open);
  };

  const handleGoToSettings = () => {
    setMenuOpen(false);
    navigate('/settings');
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 md:px-6">
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden -ml-2"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>
      <h1 className="text-lg font-semibold text-slate-900 truncate">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={handleToggleMenu}
            className="flex items-center justify-center size-9 rounded-full bg-slate-200 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            {initials}
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white shadow-lg py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 truncate">{fullName}</p>
                <p className="text-xs text-slate-500 truncate">{email}</p>
                <p className="mt-0.5 text-xs text-slate-500">{roleLabel}</p>
              </div>
              <button
                type="button"
                onClick={handleGoToSettings}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Settings
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
