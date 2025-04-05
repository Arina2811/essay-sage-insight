
import { Card } from "@/components/ui/card";
import { Key, BrainCircuit } from "lucide-react";
import { ApiKeySection } from "./ApiKeySection";

export const ApiKeysCard = () => {
  return (
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
          <ApiKeySection
            title="OpenAI API Key (GPT-4)"
            description="Access enhanced essay analysis with OpenAI's GPT-4."
            keyType="openai"
            icon={<BrainCircuit className="h-4 w-4 mr-1" />}
            linkText="OpenAI Platform"
            linkUrl="https://platform.openai.com/api-keys"
          />
        </div>

        {/* Gemini API Key Section */}
        <ApiKeySection
          title="Google Gemini API Key"
          description="Get your API key from the"
          keyType="gemini"
          linkText="Google AI Studio"
          linkUrl="https://aistudio.google.com/app/apikey"
        />
      </div>
    </Card>
  );
};
