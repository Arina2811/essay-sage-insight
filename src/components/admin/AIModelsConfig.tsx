
import { Card } from "@/components/ui/card";
import { ModelInfoCard } from "./ModelInfoCard";
import { GeminiService } from "@/services/GeminiService";
import { useState, useEffect } from "react";

export const AIModelsConfig = () => {
  const [openAIKeyStatus, setOpenAIKeyStatus] = useState(false);
  const [geminiKeyStatus, setGeminiKeyStatus] = useState(false);

  useEffect(() => {
    // Load key statuses
    setOpenAIKeyStatus(!!GeminiService.getOpenAIApiKey());
    setGeminiKeyStatus(!!GeminiService.getApiKey());
  }, []);

  return (
    <Card className="p-6 glass">
      <h3 className="text-lg font-semibold mb-4">AI Models Configuration</h3>
      <div className="space-y-4">
        <ModelInfoCard
          title="OpenAI GPT-4"
          description="OpenAI's most advanced model for text analysis and content generation. Provides highly accurate essay analysis, plagiarism detection, and personalized feedback."
          isActive={openAIKeyStatus}
          isPrimary={openAIKeyStatus}
          keyRequired={true}
          keyConfigured={openAIKeyStatus}
        />
        
        <ModelInfoCard
          title="Google Gemini Pro"
          description="Google's capable model for text analysis and generation. Used for high-quality essay analysis, plagiarism detection, and personalized feedback."
          isActive={geminiKeyStatus || openAIKeyStatus}
          isFallback={openAIKeyStatus && geminiKeyStatus}
          isPrimary={!openAIKeyStatus && geminiKeyStatus}
          keyRequired={true}
          keyConfigured={geminiKeyStatus}
        />
        
        <ModelInfoCard
          title="BERT Model"
          description="Used for semantic understanding and academic text analysis. Provides fallback capabilities when API keys are not configured."
          isActive={true}
          keyRequired={false}
          keyConfigured={true}
        />

        <ModelInfoCard
          title="BART Model"
          description="Used for content generation and text summarization. Provides fallback capabilities when API keys are not configured."
          isActive={true}
          keyRequired={false}
          keyConfigured={true}
        />
      </div>
    </Card>
  );
};
