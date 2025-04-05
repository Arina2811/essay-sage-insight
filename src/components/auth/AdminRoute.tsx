
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading, bypassAuth, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If bypass is enabled and we're in development, allow access regardless
  if (bypassAuth && process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }

  // Regular user is logged in but not an admin
  if (user && !isAdmin) {
    return <Navigate to="/settings" state={{ from: location }} replace />;
  }

  // No user logged in
  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // User is an admin
  return <>{children}</>;
};
