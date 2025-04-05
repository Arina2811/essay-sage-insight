
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, bypassAuth, setBypassAuth } = useAuth();
  
  // Get the intended destination from location state, or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      
      toast({
        title: "Sign in successful",
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

  const handleBypassAuth = () => {
    setBypassAuth(!bypassAuth);
    if (!bypassAuth) {
      toast({
        title: "Auth bypass enabled",
        description: "You can now access all features without authentication.",
      });
      navigate(from, { replace: true });
    } else {
      toast({
        title: "Auth bypass disabled",
        description: "Authentication is now required to access protected features.",
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
            <div className="p-4 mb-4 bg-yellow-100 border border-yellow-400 rounded-md">
              <div className="flex items-center justify-between">
                <Label htmlFor="bypass-auth" className="font-medium text-yellow-800">Bypass Authentication</Label>
                <Switch
                  id="bypass-auth"
                  checked={bypassAuth}
                  onCheckedChange={handleBypassAuth}
                />
              </div>
              <p className="mt-1 text-sm text-yellow-700">
                {bypassAuth 
                  ? "Auth bypass is enabled. Click the switch to disable it." 
                  : "Enable this to access the app without authentication."}
              </p>
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
