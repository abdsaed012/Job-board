import { createElement } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Settings, PlusCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/auth/useAuth';
import { EMPLOYER, JOB_SEEKER } from '../../constants/roles';

function Sidebar({ onNavigate, className }) {
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
    // Fallback: generic navigation while role is loading/unknown.
    navItems = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/jobs', icon: Briefcase, label: 'Jobs' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ];
  }
  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col w-72 border-r border-slate-200 bg-white shrink-0',
        className
      )}
    >
      <div className="flex h-14 items-center gap-2 px-4 border-b border-slate-200">
        <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center">
          <Briefcase className="size-4 text-white" />
        </div>
        <span className="font-semibold text-slate-900">JobBoard</span>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
            end={to === '/dashboard'}
          >
            {createElement(icon, { className: 'size-4 shrink-0', 'aria-hidden': true })}
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
