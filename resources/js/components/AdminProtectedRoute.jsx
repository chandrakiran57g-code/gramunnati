import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { ensureAdminDbAccess } from '@/lib/adminDb';
import { adminRoutes } from '@/lib/adminRoutes';

export default function AdminProtectedRoute() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState('');

  useEffect(() => {
    if (!isAdminAuthenticated()) return;
    ensureAdminDbAccess()
      .then(() => setDbReady(true))
      .catch((err) => setDbError(err.message || 'Database connection failed'));
  }, []);

  if (!isAdminAuthenticated()) {
    return <Navigate to={adminRoutes.login} replace />;
  }

  if (dbError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f4] p-6">
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="mb-2 text-lg font-semibold text-red-700">Admin database not connected</h1>
          <p className="mb-4 text-sm text-muted-foreground">{dbError}</p>
          <a href={adminRoutes.login} className="text-sm font-medium text-primary underline">
            Back to admin login
          </a>
        </div>
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f4]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Outlet />;
}
