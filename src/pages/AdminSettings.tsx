
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GeminiService } from "@/services/GeminiService";
import { ShieldAlert, ArrowLeft, Info, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ApiKeysCard } from "@/components/admin/ApiKeysCard";
import { AIModelsConfig } from "@/components/admin/AIModelsConfig";
import { toast } from "sonner";

const AdminSettings = () => {
  const { isAdmin, user } = useAuth();

  // During initial load, check for the OpenAI API key
  useEffect(() => {
    const savedOpenAIKey = GeminiService.getOpenAIApiKey();
    if (!savedOpenAIKey) {
      toast("API Key Required", {
        description: "Please set up your OpenAI API key for full functionality",
        action: {
          label: "Understand",
          onClick: () => console.log("Notification acknowledged"),
        },
      });
    }
  }, []);

  if (!isAdmin) {
    return (
      <div className="container mx-auto section-padding">
        <div className="max-w-3xl mx-auto space-y-8">
          <Card className="p-8 glass text-center">
            <ShieldAlert className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
            <p className="mb-6">You do not have permission to view this page.</p>
            <Link to="/settings">
              <Button>Return to Settings</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto section-padding">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center mb-2">
            <Lock className="h-5 w-5 mr-2 text-amber-500" />
            <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Secure configuration for API keys and AI models
          </p>
          <div className="mt-4 flex items-center bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-sm px-3 py-1 rounded-full">
            <ShieldAlert className="h-4 w-4 mr-1" />
            <span>Logged in as admin: {user?.email}</span>
          </div>
          <div className="mt-4">
            <Link to="/settings">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Return to User Settings
              </Button>
            </Link>
          </div>
        </div>

        <Card className="p-6 glass">
          <div className="flex items-start gap-4 p-4 rounded-md bg-blue-50 dark:bg-blue-950/30">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-700 dark:text-blue-300">Admin Setup Instructions</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                To enable AI-powered essay analysis, you need to set up your OpenAI API key below. Your key is stored securely
                and used only within this application. For maximum functionality, we recommend configuring both OpenAI and Gemini
                API keys.
              </p>
            </div>
          </div>
        </Card>

        <ApiKeysCard />
        <AIModelsConfig />
      </div>
    </div>
  );
};

export default AdminSettings;
