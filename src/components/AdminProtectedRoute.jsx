import { Navigate, Outlet } from 'react-router-dom';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { adminRoutes } from '@/lib/adminRoutes';

export default function AdminProtectedRoute() {
  if (!isAdminAuthenticated()) {
    return <Navigate to={adminRoutes.login} replace />;
  }
  return <Outlet />;
}
