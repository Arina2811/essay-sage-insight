
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { GeminiService } from "@/services/GeminiService";
import { CheckCircle, Key, Lock, RotateCw, BrainCircuit, Copy, Clipboard } from "lucide-react";
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
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

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

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setApiKey(clipboardText.trim());
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      toast({
        title: "Paste Failed",
        description: "Could not access clipboard. Please paste manually.",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: `Please enter a valid ${isGemini ? "Gemini" : "OpenAI"} API key.`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    setTimeout(() => {
      const success = isGemini 
        ? GeminiService.setApiKey(apiKey)
        : GeminiService.setOpenAIApiKey(apiKey);
      
      setIsSaving(false);
      
      if (success) {
        setKeyStatus(true);
        toast({
          title: "API Key Saved",
          description: `Your ${isGemini ? "Gemini" : "OpenAI"} API key has been saved successfully.`,
        });
      }
    }, 500); // Short delay to show saving state
  };

  const handleRemove = () => {
    isGemini 
      ? GeminiService.clearApiKey()
      : GeminiService.clearOpenAIApiKey();
    
    setApiKey("");
    setKeyStatus(false);
    toast({
      title: "API Key Removed",
      description: `Your ${isGemini ? "Gemini" : "OpenAI"} API key has been removed successfully.`,
    });
  };

  const handleRotate = () => {
    if (!isGemini) return; // Only Gemini has rotate functionality
    
    // In a real implementation, this would generate a new key on the backend
    const newApiKey = `gemini-key-${Math.random().toString(36).substring(2, 10)}`;
    setApiKey(newApiKey);
    GeminiService.setApiKey(newApiKey);
    setKeyStatus(true);
    toast({
      title: "API Key Rotated",
      description: "Your Gemini API key has been rotated successfully.",
    });
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
      <div className="flex flex-col sm:flex-row gap-2">
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
            <Lock className="h-4 w-4" />
          </button>
        </div>
        <Button 
          variant="outline" 
          onClick={handlePaste}
          type="button"
          className="gap-1 shrink-0"
        >
          <Clipboard className="h-4 w-4" />
          <span className="hidden sm:inline">Paste</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {description}
        {linkText && linkUrl && (
          <> Get your API key from the <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{linkText}</a></>
        )}
      </p>
      <div className="flex space-x-2 justify-end mt-2">
        {keyStatus && (
          <>
            <Button variant="outline" onClick={handleRemove} className="gap-1">
              <Lock className="h-4 w-4" /> Remove
            </Button>
            {isGemini && (
              <Button variant="outline" onClick={handleRotate} className="gap-1">
                <RotateCw className="h-4 w-4" /> Rotate
              </Button>
            )}
          </>
        )}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RotateCw className="h-4 w-4 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            "Save API Key"
          )}
        </Button>
      </div>
    </div>
  );
};
