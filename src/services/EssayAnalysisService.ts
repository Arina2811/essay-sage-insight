
import { toast } from "sonner";
import { GeminiService } from "./GeminiService";
import { PlagiarismService } from "./PlagiarismService";
import { EssayAnalysisResult, EssayData } from "@/types/essay";
import { EssayStructureService } from "./essay/EssayStructureService";
import { GeminiEssayService } from "./essay/GeminiEssayService";
import { EssayStorageService } from "./essay/EssayStorageService";

export class EssayAnalysisService {
  static async analyzeEssay(essayText: string): Promise<EssayAnalysisResult> {
    try {
      // Check if Gemini API key is available
      const apiKey = GeminiService.getApiKey();
      
      if (apiKey) {
        console.log("Using Gemini for enhanced essay analysis");
        return await GeminiEssayService.analyzeWithGemini(essayText);
      } else {
        // No Gemini API key, use BERT/BART-based analysis
        console.log("No Gemini API key, using BERT/BART for analysis");
        const plagiarismResult = await PlagiarismService.checkPlagiarism(essayText);
        return await EssayStructureService.fallbackBertBartAnalysis(essayText, plagiarismResult);
      }
    } catch (error) {
      console.error("Error analyzing essay:", error);
      toast.error("Failed to analyze essay. Please try again later.");
      throw error;
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
    return EssayStorageService.saveEssay(essayData);
  }
}
