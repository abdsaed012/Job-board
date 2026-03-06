import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import DashboardRedirect from './DashboardRedirect';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import PlaceholderDashboard from '../pages/dashboard/PlaceholderDashboard';
import JobSeekerDashboard from '../pages/dashboard/JobSeekerDashboard.jsx';
import BrowseJobs from '../pages/jobs/BrowseJobs.jsx';
import CreateJob from '../pages/jobs/CreateJob';
import MyJobs from '../pages/jobs/MyJobs';
import JobDetails from '../pages/jobs/JobDetails';
import EditJob from '../pages/jobs/EditJob';
import ApplicantsForJob from '../pages/jobs/ApplicantsForJob';
import MyApplications from '../pages/applications/MyApplications.jsx';
import NotFound from '../pages/NotFound';
import Settings from '../pages/settings/Settings.jsx';
import { EMPLOYER, JOB_SEEKER } from '../constants/roles';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardRedirect />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRedirect />} />
        <Route
          path="employer"
          element={
            <RoleRoute allowedRoles={[EMPLOYER]}>
              <PlaceholderDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="seeker"
          element={
            <RoleRoute allowedRoles={[JOB_SEEKER]}>
              <JobSeekerDashboard />
            </RoleRoute>
          }
        />
        <Route path="*" element={<PlaceholderDashboard />} />
      </Route>
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<BrowseJobs />} />
        <Route
          path="create"
          element={
            <RoleRoute allowedRoles={[EMPLOYER]}>
              <CreateJob />
            </RoleRoute>
          }
        />
        <Route
          path="my-jobs"
          element={
            <RoleRoute allowedRoles={[EMPLOYER]}>
              <MyJobs />
            </RoleRoute>
          }
        />
        <Route
          path=":id/edit"
          element={
            <RoleRoute allowedRoles={[EMPLOYER]}>
              <EditJob />
            </RoleRoute>
          }
        />
        <Route
          path=":id/applicants"
          element={
            <RoleRoute allowedRoles={[EMPLOYER]}>
              <ApplicantsForJob />
            </RoleRoute>
          }
        />
        <Route path=":id" element={<JobDetails />} />
      </Route>
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="my-applications"
          element={
            <RoleRoute allowedRoles={[JOB_SEEKER]}>
              <MyApplications />
            </RoleRoute>
          }
        />
      </Route>
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
