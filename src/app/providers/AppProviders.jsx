import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/auth/AuthContext.jsx';
import { JobsProvider } from '../context/jobs/JobsProvider';
import { ApplicationsProvider } from '../context/applications/ApplicationsProvider.jsx';

function AppProviders({ children }) {
  return (
    <AuthProvider>
      <JobsProvider>
        <ApplicationsProvider>
          {children}
          <Toaster position="top-right" />
        </ApplicationsProvider>
      </JobsProvider>
    </AuthProvider>
  );
}

export default AppProviders;
