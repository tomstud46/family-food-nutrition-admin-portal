import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { AdminRole } from '../types/auth';
import { useAuthStore } from '../stores/authStore';

export default function ProtectedRoute({ roles }: { roles?: AdminRole[] }) {
  const { user, token, isLoading } = useAuthStore();
  const location = useLocation();
  if (isLoading) return <div className="grid min-h-screen place-items-center bg-[#f6f7f9]"><div className="text-sm text-slate-500">Loading workspace…</div></div>;
  if (!token || !user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && (!user.role || !roles.includes(user.role))) return <Navigate to="/" replace />;
  return <Outlet />;
}
