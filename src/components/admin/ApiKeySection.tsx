
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { GeminiService } from "@/services/GeminiService";
import { CheckCircle, Key, Lock, RotateCw, BrainCircuit, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ApiKeySectionProps {
  title: string;
  description: string;
  keyType: "gemini" | "openai";
  icon?: React.ReactNode;
  linkText?: string;
  linkUrl?: string;
}

export const ApiKeySection = ({
  title,
  description,
  keyType,
  icon = <Key className="h-4 w-4 mr-1" />,
  linkText,
  linkUrl,
}: ApiKeySectionProps) => {
  const isGemini = keyType === "gemini";
  const [apiKey, setApiKey] = useState("");
  const [keyStatus, setKeyStatus] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast: uiToast } = useToast();

  // Initialize state based on stored keys
  useEffect(() => {
    const savedKey = isGemini 
      ? GeminiService.getApiKey() 
      : GeminiService.getOpenAIApiKey();
    
    if (savedKey) {
      setApiKey(savedKey);
      setKeyStatus(true);
    }
  }, [isGemini]);

  const handleSave = () => {
    if (!apiKey) {
      toast.error("API Key Required", {
        description: `Please enter a valid ${isGemini ? "Gemini" : "OpenAI"} API key.`,
      });
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const success = isGemini 
        ? GeminiService.setApiKey(apiKey)
        : GeminiService.setOpenAIApiKey(apiKey);
      
      setIsLoading(false);
      
      if (success) {
        setKeyStatus(true);
        toast.success("API Key Saved", {
          description: `Your ${isGemini ? "Gemini" : "OpenAI"} API key has been saved successfully.`,
        });
      }
    }, 500); // Simulate brief API verification
  };

  const handleRemove = () => {
    isGemini 
      ? GeminiService.clearApiKey()
      : GeminiService.clearOpenAIApiKey();
    
    setApiKey("");
    setKeyStatus(false);
    toast.info("API Key Removed", {
      description: `Your ${isGemini ? "Gemini" : "OpenAI"} API key has been removed successfully.`,
    });
  };

  const handleRotate = () => {
    if (!isGemini) return; // Only Gemini has rotate functionality
    
    setIsLoading(true);
    
    // In a real implementation, this would generate a new key on the backend
    setTimeout(() => {
      const newApiKey = `gemini-key-${Math.random().toString(36).substring(2, 10)}`;
      setApiKey(newApiKey);
      GeminiService.setApiKey(newApiKey);
      setKeyStatus(true);
      setIsLoading(false);
      
      toast.success("API Key Rotated", {
        description: "Your Gemini API key has been rotated successfully.",
      });
    }, 800);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setApiKey(clipboardText.trim());
      toast.info("API Key Pasted", {
        description: "API key pasted from clipboard. Click Save to confirm."
      });
    } catch (err) {
      toast.error("Clipboard Access Denied", {
        description: "Please grant clipboard permission or paste manually."
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={`${keyType}-api-key`} className="font-medium flex items-center">
          {icon} {title}
        </label>
        {keyStatus && (
          <span className="text-sm text-green-500 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Connected
          </span>
        )}
      </div>
      <div className="flex">
        <div className="relative flex-1">
          <Input 
            id={`${keyType}-api-key`} 
            type={showKey ? "text" : "password"} 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter your ${isGemini ? "Gemini" : "OpenAI"} API key`}
            className="pr-10"
          />
          <button 
            type="button" 
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
            onClick={() => setShowKey(!showKey)}
            aria-label={showKey ? "Hide API key" : "Show API key"}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
        {linkText && linkUrl && (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center"
          >
            {linkText} <ExternalLink className="ml-0.5 h-3 w-3" />
          </a>
        )}
      </div>
      <div className="flex flex-wrap gap-2 justify-end mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePasteFromClipboard}
          className="text-xs"
        >
          Paste from Clipboard
        </Button>
        
        {keyStatus && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRemove} 
              className="gap-1 text-xs"
            >
              <Lock className="h-3 w-3" /> Remove
            </Button>
            {isGemini && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRotate} 
                className="gap-1 text-xs"
                disabled={isLoading}
              >
                <RotateCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} /> Rotate
              </Button>
            )}
          </>
        )}
        <Button 
          onClick={handleSave} 
          size="sm" 
          disabled={isLoading}
          className={isLoading ? "animate-pulse" : ""}
        >
          {isLoading ? "Saving..." : "Save API Key"}
        </Button>
      </div>
    </div>
  );
};
