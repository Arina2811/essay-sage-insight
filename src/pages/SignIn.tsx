
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: uiToast } = useToast();
  const { signIn, bypassAuth, setBypassAuth } = useAuth();
  
  // Get the intended destination from location state, or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      
      toast.success("Sign in successful", {
        description: "Welcome back to WriteRight Essay!"
      });
      
      // Navigate to the page they tried to visit before being redirected to login
      navigate(from, { replace: true });
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsAdmin = () => {
    setEmail("admin@writeright.app");
    setPassword("adminpassword");
    toast.info("Admin credentials filled in", {
      description: "Click Sign In to continue as admin"
    });
  };

  const handleBypassAuth = () => {
    setBypassAuth(!bypassAuth);
    if (!bypassAuth) {
      toast.success("Auth bypass enabled", {
        description: "You can now access all features without authentication."
      });
      navigate(from, { replace: true });
    } else {
      toast.info("Auth bypass disabled", {
        description: "Authentication is now required to access protected features."
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 section-padding">
      <div className="w-full max-w-md">
        <Card className="glass">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 mb-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-800 dark:text-blue-300">Quick Access</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                For testing purposes, you can use the admin account or bypass authentication.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 border-blue-300"
                  onClick={loginAsAdmin}
                >
                  Use Admin Credentials
                </Button>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="bypass-auth" className="font-medium text-blue-700 dark:text-blue-400 text-sm">
                    Bypass Authentication
                  </Label>
                  <Switch
                    id="bypass-auth"
                    checked={bypassAuth}
                    onCheckedChange={handleBypassAuth}
                  />
                </div>
              </div>
            </div>
            
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={bypassAuth}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={bypassAuth}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || bypassAuth}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link to="/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
