
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { GeminiService } from "@/services/GeminiService";
import { CheckCircle, Key, Lock, ShieldAlert, RotateCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const AdminSettings = () => {
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [geminiKeyStatus, setGeminiKeyStatus] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const savedKey = GeminiService.getApiKey();
    if (savedKey) {
      setGeminiApiKey(savedKey);
      setGeminiKeyStatus(true);
    }
  }, []);

  const handleGeminiApiKeySave = () => {
    if (geminiApiKey) {
      const success = GeminiService.setApiKey(geminiApiKey);
      if (success) {
        setGeminiKeyStatus(true);
        toast({
          title: "API Key Saved",
          description: "Your Gemini API key has been saved successfully.",
        });
      }
    } else {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Gemini API key.",
        variant: "destructive",
      });
    }
  };

  const handleGeminiApiKeyRemove = () => {
    GeminiService.clearApiKey();
    setGeminiApiKey("");
    setGeminiKeyStatus(false);
    toast({
      title: "API Key Removed",
      description: "Your Gemini API key has been removed successfully.",
    });
  };

  const handleRotateApiKey = () => {
    // In a real implementation, this would generate a new key on the backend
    const newApiKey = `gemini-key-${Math.random().toString(36).substring(2, 10)}`;
    setGeminiApiKey(newApiKey);
    GeminiService.setApiKey(newApiKey);
    setGeminiKeyStatus(true);
    toast({
      title: "API Key Rotated",
      description: "Your Gemini API key has been rotated successfully.",
    });
  };

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

        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Key className="h-5 w-5 mr-2" /> 
              AI API Keys
            </h3>
            <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              Admin Only
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="gemini-api-key" className="font-medium">Google Gemini API Key</label>
                {geminiKeyStatus && (
                  <span className="text-sm text-green-500 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Connected
                  </span>
                )}
              </div>
              <div className="flex">
                <div className="relative flex-1">
                  <Input 
                    id="gemini-api-key" 
                    type={showApiKey ? "text" : "password"} 
                    value={geminiApiKey} 
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className="pr-10"
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    <Lock className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Get your API key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
              </p>
            </div>
            <div className="flex space-x-2 justify-end">
              {geminiKeyStatus && (
                <>
                  <Button variant="outline" onClick={handleGeminiApiKeyRemove} className="gap-1">
                    <Lock className="h-4 w-4" /> Remove
                  </Button>
                  <Button variant="outline" onClick={handleRotateApiKey} className="gap-1">
                    <RotateCw className="h-4 w-4" /> Rotate
                  </Button>
                </>
              )}
              <Button onClick={handleGeminiApiKeySave}>Save API Key</Button>
            </div>
          </div>
        </Card>
            
        <Card className="p-6 glass">
          <h3 className="text-lg font-semibold mb-4">AI Models Configuration</h3>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Google Gemini Pro</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Google's most capable model for text analysis and generation. Used for high-quality essay analysis, plagiarism detection, and personalized feedback.
              </p>
              <div className="flex items-start space-x-2">
                <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                  Active
                </div>
                <div className="bg-muted-foreground/20 text-muted-foreground text-xs px-2 py-1 rounded">
                  {geminiKeyStatus ? "Key Configured" : "Key Required"}
                </div>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">BERT Model</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Used for semantic understanding and academic text analysis. Provides fallback capabilities when Gemini API key is not configured.
              </p>
              <div className="flex items-start space-x-2">
                <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                  Active
                </div>
                <div className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded">
                  No API Key Required
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">BART Model</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Used for content generation and text summarization. Provides fallback capabilities when Gemini API key is not configured.
              </p>
              <div className="flex items-start space-x-2">
                <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                  Active
                </div>
                <div className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded">
                  No API Key Required
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
