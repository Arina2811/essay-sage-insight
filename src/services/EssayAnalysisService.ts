
import { toast } from "sonner";
import { GeminiService } from "./GeminiService";
import { PlagiarismService } from "./PlagiarismService";
import { EssayAnalysisResult, EssayData } from "@/types/essay";
import { EssayStructureService } from "./essay/EssayStructureService";
import { GeminiEssayService } from "./essay/GeminiEssayService";
import { EssayStorageService } from "./essay/EssayStorageService";
import { SupabaseEssayService } from "./SupabaseEssayService";
import { supabase } from "@/integrations/supabase/client";
import { ImprovedAIDetectionService } from "./essay/ImprovedAIDetectionService";
import { VocabularyAnalysisService } from "./essay/VocabularyAnalysisService";

export class EssayAnalysisService {
  static async analyzeEssay(essayText: string): Promise<EssayAnalysisResult> {
    try {
      // Check if we should use advanced AI with Supabase functions
      const useAdvancedAI = await this.shouldUseAdvancedAI();
      
      if (useAdvancedAI) {
        console.log("Using Supabase Edge Functions for advanced AI analysis");
        try {
          const { data, error } = await supabase.functions.invoke('analyze-essay', {
            body: { 
              text: essayText
            }
          });
          
          if (error) throw error;
          
          console.log(`Received analysis from Supabase Edge Function (using ${data.provider || 'unknown'} model):`, data);
          
          // Enhance the AI detection with our improved service
          const enhancedAIDetection = await ImprovedAIDetectionService.analyzeText(essayText);
          
          // Enhance vocabulary analysis
          const enhancedVocabulary = VocabularyAnalysisService.analyzeVocabulary(essayText);
          
          // Merge the analysis results with our enhanced detection
          const enhancedAnalysis = {
            ...data.analysis,
            aiDetection: {
              score: enhancedAIDetection.isAiGenerated ? 40 : 85,
              isAiGenerated: enhancedAIDetection.isAiGenerated,
              confidence: enhancedAIDetection.confidence,
              feedback: enhancedAIDetection.feedback
            },
            vocabulary: enhancedVocabulary
          };
          
          return enhancedAnalysis;
        } catch (edgeFunctionError) {
          console.error("Edge function error, falling back to client-side AI:", edgeFunctionError);
          // Fall back to client-side AI models if edge function fails
          return await this.fallbackToLocalAI(essayText);
        }
      } else {
        return await this.fallbackToLocalAI(essayText);
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
  private static async fallbackToLocalAI(essayText: string): Promise<EssayAnalysisResult> {
    // Check if OpenAI API key is available
    const openAIKey = GeminiService.getOpenAIApiKey();
    
    // Check if Gemini API key is available
    const geminiKey = GeminiService.getApiKey();
    
    // Apply enhanced AI detection and vocabulary analysis
    const enhancedAIDetection = await ImprovedAIDetectionService.analyzeText(essayText);
    const enhancedVocabulary = VocabularyAnalysisService.analyzeVocabulary(essayText);
    
    if (openAIKey) {
      console.log("Using OpenAI for enhanced essay analysis");
      try {
        const baseAnalysis = await GeminiEssayService.analyzeWithGemini(essayText);
        
        // Merge with enhanced detection and vocabulary
        return {
          ...baseAnalysis,
          aiDetection: {
            score: enhancedAIDetection.isAiGenerated ? 40 : 85,
            isAiGenerated: enhancedAIDetection.isAiGenerated,
            confidence: enhancedAIDetection.confidence,
            feedback: enhancedAIDetection.feedback
          },
          vocabulary: enhancedVocabulary
        };
      } catch (error) {
        console.error("OpenAI analysis failed, trying Gemini:", error);
        if (geminiKey) {
          const baseAnalysis = await GeminiEssayService.analyzeWithGemini(essayText);
          
          // Merge with enhanced detection and vocabulary
          return {
            ...baseAnalysis,
            aiDetection: {
              score: enhancedAIDetection.isAiGenerated ? 40 : 85,
              isAiGenerated: enhancedAIDetection.isAiGenerated,
              confidence: enhancedAIDetection.confidence,
              feedback: enhancedAIDetection.feedback
            },
            vocabulary: enhancedVocabulary
          };
        }
        // If both OpenAI and Gemini fail, use BERT/BART
        throw error;
      }
    } else if (geminiKey) {
      console.log("Using Gemini for enhanced essay analysis");
      try {
        const baseAnalysis = await GeminiEssayService.analyzeWithGemini(essayText);
        
        // Merge with enhanced detection and vocabulary
        return {
          ...baseAnalysis,
          aiDetection: {
            score: enhancedAIDetection.isAiGenerated ? 40 : 85,
            isAiGenerated: enhancedAIDetection.isAiGenerated,
            confidence: enhancedAIDetection.confidence,
            feedback: enhancedAIDetection.feedback
          },
          vocabulary: enhancedVocabulary
        };
      } catch (error) {
        console.error("Gemini analysis failed, using BERT/BART fallback:", error);
        // If Gemini fails, use BERT/BART
        const plagiarismResult = await PlagiarismService.checkPlagiarism(essayText);
        const baseAnalysis = await EssayStructureService.fallbackBertBartAnalysis(essayText, plagiarismResult);
        
        // Merge with enhanced detection and vocabulary
        return {
          ...baseAnalysis,
          aiDetection: {
            score: enhancedAIDetection.isAiGenerated ? 40 : 85,
            isAiGenerated: enhancedAIDetection.isAiGenerated,
            confidence: enhancedAIDetection.confidence,
            feedback: enhancedAIDetection.feedback
          },
          vocabulary: enhancedVocabulary
        };
      }
    } else {
      // No API keys, use BERT/BART-based analysis
      console.log("No AI API keys, using BERT/BART for analysis");
      const plagiarismResult = await PlagiarismService.checkPlagiarism(essayText);
      const baseAnalysis = await EssayStructureService.fallbackBertBartAnalysis(essayText, plagiarismResult);
      
      // Merge with enhanced detection and vocabulary
      return {
        ...baseAnalysis,
        aiDetection: {
          score: enhancedAIDetection.isAiGenerated ? 40 : 85,
          isAiGenerated: enhancedAIDetection.isAiGenerated,
          confidence: enhancedAIDetection.confidence,
          feedback: enhancedAIDetection.feedback
        },
        vocabulary: enhancedVocabulary
      };
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
