
import { toast } from "sonner";
import { GeminiService } from "./GeminiService";
import { PlagiarismService } from "./PlagiarismService";
import { EssayAnalysisResult, EssayData } from "@/types/essay";
import { EssayStructureService } from "./essay/EssayStructureService";
import { GeminiEssayService } from "./essay/GeminiEssayService";
import { EssayStorageService } from "./essay/EssayStorageService";
import { SupabaseEssayService } from "./SupabaseEssayService";
import { supabase } from "@/integrations/supabase/client";

export class EssayAnalysisService {
  static async analyzeEssay(essayText: string, language?: string): Promise<EssayAnalysisResult> {
    try {
      // Check if we should use advanced AI with Supabase functions
      const useAdvancedAI = await this.shouldUseAdvancedAI();
      
      if (useAdvancedAI) {
        console.log("Using Supabase Edge Functions for advanced AI analysis");
        try {
          const { data, error } = await supabase.functions.invoke('analyze-essay', {
            body: { 
              text: essayText,
              language: language 
            }
          });
          
          if (error) throw error;
          
          console.log(`Received analysis from Supabase Edge Function (using ${data.provider || 'unknown'} model):`, data);
          return data.analysis;
        } catch (edgeFunctionError) {
          console.error("Edge function error, falling back to client-side AI:", edgeFunctionError);
          // Fall back to client-side AI models if edge function fails
          return await this.fallbackToLocalAI(essayText, language);
        }
      } else {
        return await this.fallbackToLocalAI(essayText, language);
      }
    } catch (error) {
      console.error("Error analyzing essay:", error);
      toast.error("Failed to analyze essay. Please try again later.");
      throw error;
    }
  }

  /**
   * Determine if we should use advanced AI with Supabase
   */
  private static async shouldUseAdvancedAI(): Promise<boolean> {
    // Check if user is authenticated with Supabase
    const { data } = await supabase.auth.getSession();
    const isAuthenticated = !!data.session;
    
    // Check if edge functions are available
    try {
      const { data: healthCheck, error } = await supabase.functions.invoke('health-check', {
        body: { test: true }
      });
      
      // Fix the comparison issue - properly check if status is not 'ok'
      if (error || (healthCheck?.status !== 'ok')) {
        return false;
      }
      
      return isAuthenticated;
    } catch {
      return false;
    }
  }

  /**
   * Fall back to client-side AI analysis
   */
  private static async fallbackToLocalAI(essayText: string, language?: string): Promise<EssayAnalysisResult> {
    // Check if OpenAI API key is available
    const openAIKey = GeminiService.getOpenAIApiKey();
    
    // Check if Gemini API key is available
    const geminiKey = GeminiService.getApiKey();
    
    if (openAIKey) {
      console.log("Using OpenAI for enhanced essay analysis");
      // Placeholder for OpenAI-specific client-side analysis
      // For now, we'll use the same GeminiEssayService which will use OpenAI
      // if the key is available (through the updated GeminiService)
      return await GeminiEssayService.analyzeWithGemini(essayText, language);
    } else if (geminiKey) {
      console.log("Using Gemini for enhanced essay analysis");
      return await GeminiEssayService.analyzeWithGemini(essayText, language);
    } else {
      // No API keys, use BERT/BART-based analysis
      console.log("No AI API keys, using BERT/BART for analysis");
      const plagiarismResult = await PlagiarismService.checkPlagiarism(essayText);
      return await EssayStructureService.fallbackBertBartAnalysis(essayText, plagiarismResult);
    }
  }

  static async checkPlagiarism(essayText: string): Promise<{
    originalityScore: number;
    matches: Array<{
      text: string;
      matchPercentage: number;
      source?: string;
    }>;
  }> {
    try {
      const result = await PlagiarismService.checkPlagiarism(essayText);
      
      return {
        originalityScore: result.originalityScore,
        matches: result.matches.map(match => ({
          text: match.text,
          matchPercentage: match.matchPercentage,
          source: match.source
        }))
      };
    } catch (error) {
      console.error("Error checking plagiarism:", error);
      toast.error("Failed to check plagiarism. Please try again later.");
      throw error;
    }
  }

  static async saveEssay(essayData: EssayData): Promise<{ id: string }> {
    try {
      // Try to save to Supabase first
      return await SupabaseEssayService.saveEssay(essayData);
    } catch (error) {
      console.error("Supabase save failed, falling back to local storage:", error);
      // Fall back to original storage method
      return await EssayStorageService.saveEssay(essayData);
    }
  }
}
