
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Settings as SettingsIcon, User, Shield, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { user, isAdmin, bypassAuth, setBypassAuth } = useAuth();
  const [aiSettings, setAiSettings] = useState({
    openAiEnabled: true,
    geminiEnabled: false,
    localModelEnabled: false,
  });

  const handleToggleBypassAuth = () => {
    setBypassAuth(!bypassAuth);
    toast.success(bypassAuth ? "Authentication required" : "Authentication bypassed", {
      description: bypassAuth 
        ? "You now need to authenticate to use protected features" 
        : "You can now access all features without authentication"
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 section-padding">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and application settings
          </p>
        </div>

        {isAdmin && (
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
                <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Admin Settings</h2>
                <p className="text-muted-foreground mt-1">Configure API keys and AI models for the application</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin-settings">
                <Button variant="default" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Go to Admin Settings
                </Button>
              </Link>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Account Settings</h2>
              <p className="text-muted-foreground mt-1">Manage your account details and preferences</p>
            </div>
          </div>
          <div className="mt-6 divide-y">
            <div className="py-4">
              <label className="font-medium mb-1 block">Email</label>
              <div className="text-muted-foreground">
                {bypassAuth ? "Using bypass mode (no email)" : user?.email || "Not logged in"}
              </div>
            </div>
            <div className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium mb-1 block">Authentication Bypass</label>
                  <div className="text-muted-foreground text-sm">
                    {bypassAuth 
                      ? "Currently bypassing authentication" 
                      : "Authentication required for protected features"}
                  </div>
                </div>
                <Button 
                  variant={bypassAuth ? "destructive" : "outline"} 
                  onClick={handleToggleBypassAuth}
                >
                  {bypassAuth ? "Disable Bypass" : "Enable Bypass"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI Settings</h2>
              <p className="text-muted-foreground mt-1">Configure AI preferences for essay analysis</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                For detailed AI configuration and API key management, please visit the Admin Settings page.
              </p>
              {isAdmin ? (
                <Link to="/admin-settings">
                  <Button variant="outline" size="sm">
                    Manage API Keys
                  </Button>
                </Link>
              ) : (
                <p className="text-sm text-amber-600">
                  Only administrators can manage API keys.
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <LockKeyhole className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Security</h2>
              <p className="text-muted-foreground mt-1">Manage your security preferences</p>
            </div>
          </div>
          <div className="mt-6">
            <Button variant="outline">Change Password</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
