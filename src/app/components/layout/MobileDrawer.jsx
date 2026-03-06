import { createElement, useEffect } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Settings } from 'lucide-react';
import { useAuth } from '../../context/auth/useAuth';
import { EMPLOYER, JOB_SEEKER } from '../../constants/roles';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';

function MobileDrawer({ open, onClose }) {
  const { profile } = useAuth();
  const role = profile?.role;
  const isEmployer = role === EMPLOYER;
  const isJobSeeker = role === JOB_SEEKER;

  let navItems;

  if (isEmployer) {
    navItems = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/jobs/create', icon: PlusCircle, label: 'Post a job' },
      { to: '/jobs/my-jobs', icon: Briefcase, label: 'My jobs' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ];
  } else if (isJobSeeker) {
    navItems = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/jobs', icon: Briefcase, label: 'Jobs' },
      {
        to: '/applications/my-applications',
        icon: Briefcase,
        label: 'My applications',
      },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ];
  } else {
    navItems = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/jobs', icon: Briefcase, label: 'Jobs' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ];
  }
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden',
          'transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:hidden',
          'transform transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Briefcase className="size-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">JobBoard</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </Button>
        </div>
        <nav className="p-3 space-y-0.5">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                )
              }
              end={to === '/dashboard'}
            >
              {createElement(icon, { className: 'size-4 shrink-0', 'aria-hidden': true })}
              {label}
            </NavLink>
          ))}
          {isEmployer && (
            <NavLink
              to="/jobs/create"
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                )
              }
            >
              <PlusCircle className="size-4 shrink-0" aria-hidden />
              Post a job
            </NavLink>
          )}
        </nav>
      </div>
    </>
  );
}

export default MobileDrawer;
