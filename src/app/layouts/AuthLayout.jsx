import { Outlet } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

function AuthLayout() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <Briefcase className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">JobBoard</span>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
