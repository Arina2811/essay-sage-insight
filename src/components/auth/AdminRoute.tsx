
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading, bypassAuth, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading admin settings...</span>
      </div>
    );
  }

  // If bypass is enabled and we're in development, show a secure confirmation
  if (bypassAuth && process.env.NODE_ENV === 'development') {
    return (
      <div className="container mx-auto section-padding">
        <div className="max-w-3xl mx-auto space-y-8">
          <Card className="p-8 glass text-center">
            <ShieldAlert className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Admin Security Check</h1>
            <p className="mb-6">
              You are accessing an admin area with auth bypass enabled. 
              This area contains sensitive API configurations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/settings">
                <Button variant="outline">Return to Settings</Button>
              </Link>
              <Button onClick={() => window.history.replaceState(null, '', location.pathname)}>
                Continue to Admin Panel
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
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
