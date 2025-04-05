
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GeminiService } from "@/services/GeminiService";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ApiKeysCard } from "@/components/admin/ApiKeysCard";
import { AIModelsConfig } from "@/components/admin/AIModelsConfig";

const AdminSettings = () => {
  const { isAdmin } = useAuth();

  // During initial load, set the OpenAI API key if provided via URL or directly
  useEffect(() => {
    // Check if this is the first load and we need to set the API key
    const savedOpenAIKey = GeminiService.getOpenAIApiKey();
    const initialOpenAIKey = savedOpenAIKey || "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";
    
    if (initialOpenAIKey && initialOpenAIKey.startsWith("sk-") && !savedOpenAIKey) {
      GeminiService.setOpenAIApiKey(initialOpenAIKey);
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
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage application API keys and configurations
          </p>
          <div className="mt-4">
            <Link to="/settings">
              <Button variant="outline">Return to User Settings</Button>
            </Link>
          </div>
        </div>

        <ApiKeysCard />
        <AIModelsConfig />
      </div>
    </div>
  );
};

export default AdminSettings;
