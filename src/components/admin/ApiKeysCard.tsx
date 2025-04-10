
import { Card } from "@/components/ui/card";
import { Key, BrainCircuit, ShieldCheck, Info } from "lucide-react";
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
      
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">How to Get API Keys</h4>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              To use AI-powered features, you need to add at least one API key. OpenAI offers a free tier with API credits for new accounts. Sign up at OpenAI or Google AI Studio to get your keys.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* OpenAI API Key Section - Highlighted as Primary */}
        <div className="space-y-2 pb-4 border-b bg-green-50/10 p-3 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
              <ShieldCheck className="h-3 w-3 mr-1" /> Primary AI Service
            </span>
          </div>
          <ApiKeySection
            title="OpenAI API Key (GPT-4o)"
            description="Set up OpenAI's GPT-4o for primary essay analysis and AI functions."
            keyType="openai"
            icon={<BrainCircuit className="h-4 w-4 mr-1" />}
            linkText="OpenAI Platform"
            linkUrl="https://platform.openai.com/api-keys"
          />
        </div>

        {/* Gemini API Key Section */}
        <div className="space-y-2 p-3 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
              <ShieldCheck className="h-3 w-3 mr-1" /> Fallback AI Service
            </span>
          </div>
          <ApiKeySection
            title="Google Gemini API Key"
            description="Configure Google Gemini as a fallback AI service for essay analysis."
            keyType="gemini"
            icon={<BrainCircuit className="h-4 w-4 mr-1" />}
            linkText="Google AI Studio"
            linkUrl="https://aistudio.google.com/app/apikey"
          />
        </div>
      </div>
    </Card>
  );
};
