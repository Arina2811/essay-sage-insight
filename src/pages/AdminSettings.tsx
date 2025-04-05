
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { GeminiService } from "@/services/GeminiService";
import { CheckCircle, Key, Lock, ShieldAlert, RotateCw, BrainCircuit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const AdminSettings = () => {
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [geminiKeyStatus, setGeminiKeyStatus] = useState(false);
  const [openAIApiKey, setOpenAIApiKey] = useState("");
  const [openAIKeyStatus, setOpenAIKeyStatus] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    // Load saved Gemini API key
    const savedGeminiKey = GeminiService.getApiKey();
    if (savedGeminiKey) {
      setGeminiApiKey(savedGeminiKey);
      setGeminiKeyStatus(true);
    }
    
    // Load saved OpenAI API key
    const savedOpenAIKey = GeminiService.getOpenAIApiKey();
    if (savedOpenAIKey) {
      setOpenAIApiKey(savedOpenAIKey);
      setOpenAIKeyStatus(true);
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

  const handleOpenAIApiKeySave = () => {
    if (openAIApiKey) {
      const success = GeminiService.setOpenAIApiKey(openAIApiKey);
      if (success) {
        setOpenAIKeyStatus(true);
        toast({
          title: "API Key Saved",
          description: "Your OpenAI API key has been saved successfully.",
        });
      }
    } else {
      toast({
        title: "API Key Required",
        description: "Please enter a valid OpenAI API key.",
        variant: "destructive",
      });
    }
  };

  const handleOpenAIApiKeyRemove = () => {
    GeminiService.clearOpenAIApiKey();
    setOpenAIApiKey("");
    setOpenAIKeyStatus(false);
    toast({
      title: "API Key Removed",
      description: "Your OpenAI API key has been removed successfully.",
    });
  };

  const handleGeminiKeyRotate = () => {
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

  // During initial load, set the OpenAI API key if provided via URL or directly
  useEffect(() => {
    // Check if this is the first load and we need to set the API key
    const initialOpenAIKey = openAIApiKey || "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";
    
    if (initialOpenAIKey && initialOpenAIKey.startsWith("sk-") && !openAIKeyStatus) {
      GeminiService.setOpenAIApiKey(initialOpenAIKey);
      setOpenAIApiKey(initialOpenAIKey);
      setOpenAIKeyStatus(true);
      toast({
        title: "OpenAI API Key Added",
        description: "Your OpenAI API key has been configured for enhanced essay analysis.",
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
            {/* OpenAI API Key Section */}
            <div className="space-y-2 pb-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="openai-api-key" className="font-medium flex items-center">
                  <BrainCircuit className="h-4 w-4 mr-1" /> OpenAI API Key (GPT-4)
                </label>
                {openAIKeyStatus && (
                  <span className="text-sm text-green-500 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Connected
                  </span>
                )}
              </div>
              <div className="flex">
                <div className="relative flex-1">
                  <Input 
                    id="openai-api-key" 
                    type={showOpenAIKey ? "text" : "password"} 
                    value={openAIApiKey} 
                    onChange={(e) => setOpenAIApiKey(e.target.value)}
                    placeholder="Enter your OpenAI API key"
                    className="pr-10"
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  >
                    <Lock className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Access enhanced essay analysis with OpenAI's GPT-4. Get your API key from the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI Platform</a>
              </p>
              <div className="flex space-x-2 justify-end mt-2">
                {openAIKeyStatus && (
                  <Button variant="outline" onClick={handleOpenAIApiKeyRemove} className="gap-1">
                    <Lock className="h-4 w-4" /> Remove
                  </Button>
                )}
                <Button onClick={handleOpenAIApiKeySave}>Save API Key</Button>
              </div>
            </div>

            {/* Gemini API Key Section */}
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
                    type={showGeminiKey ? "text" : "password"} 
                    value={geminiApiKey} 
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className="pr-10"
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                  >
                    <Lock className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Get your API key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
              </p>
              <div className="flex space-x-2 justify-end mt-2">
                {geminiKeyStatus && (
                  <>
                    <Button variant="outline" onClick={handleGeminiApiKeyRemove} className="gap-1">
                      <Lock className="h-4 w-4" /> Remove
                    </Button>
                    <Button variant="outline" onClick={handleGeminiKeyRotate} className="gap-1">
                      <RotateCw className="h-4 w-4" /> Rotate
                    </Button>
                  </>
                )}
                <Button onClick={handleGeminiApiKeySave}>Save API Key</Button>
              </div>
            </div>
          </div>
        </Card>
            
        <Card className="p-6 glass">
          <h3 className="text-lg font-semibold mb-4">AI Models Configuration</h3>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">OpenAI GPT-4</h4>
              <p className="text-sm text-muted-foreground mb-4">
                OpenAI's most advanced model for text analysis and content generation. Provides highly accurate essay analysis, plagiarism detection, and personalized feedback.
              </p>
              <div className="flex items-start space-x-2">
                <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                  {openAIKeyStatus ? "Active - Primary" : "Inactive"}
                </div>
                <div className={`${openAIKeyStatus ? "bg-green-500/20 text-green-500" : "bg-muted-foreground/20 text-muted-foreground"} text-xs px-2 py-1 rounded`}>
                  {openAIKeyStatus ? "Key Configured" : "Key Required"}
                </div>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Google Gemini Pro</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Google's capable model for text analysis and generation. Used for high-quality essay analysis, plagiarism detection, and personalized feedback.
              </p>
              <div className="flex items-start space-x-2">
                <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                  {geminiKeyStatus ? (openAIKeyStatus ? "Active - Fallback" : "Active - Primary") : "Inactive"}
                </div>
                <div className={`${geminiKeyStatus ? "bg-green-500/20 text-green-500" : "bg-muted-foreground/20 text-muted-foreground"} text-xs px-2 py-1 rounded`}>
                  {geminiKeyStatus ? "Key Configured" : "Key Required"}
                </div>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">BERT Model</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Used for semantic understanding and academic text analysis. Provides fallback capabilities when API keys are not configured.
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
                Used for content generation and text summarization. Provides fallback capabilities when API keys are not configured.
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
