
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, bypassAuth } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You can add a loading spinner here if you want
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If bypass is enabled, allow access regardless of authentication status
  if (bypassAuth) {
    return <>{children}</>;
  }

  if (!user) {
    // Redirect to login page but save the current location
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
