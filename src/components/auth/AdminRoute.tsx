
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import { toast } from "sonner";
import { useEffect } from 'react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading, bypassAuth, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !bypassAuth && !isAdmin && user) {
      toast.error("Admin Access Required", {
        description: "You don't have admin privileges to access this page."
      });
    }
  }, [isLoading, bypassAuth, isAdmin, user]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-muted-foreground">Loading admin settings...</span>
      </div>
    );
  }

  // If bypass is enabled and we're in development, allow access regardless
  if (bypassAuth) {
    console.log("Auth bypassed for access to admin settings");
    return <>{children}</>;
  }

  // Regular user is logged in but not an admin
  if (user && !isAdmin) {
    console.log("User is not an admin, redirecting to settings");
    return <Navigate to="/settings" state={{ from: location }} replace />;
  }

  // No user logged in
  if (!user) {
    console.log("No user logged in, redirecting to sign-in");
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // User is an admin
  console.log("User is an admin, rendering admin content");
  return <>{children}</>;
};
