
import { GeminiService } from "../GeminiService";
import { EssayAnalysisResult } from "@/types/essay";

export class GeminiEssayService {
  /**
   * Analyze an essay using the Gemini API
   */
  static async analyzeWithGemini(essayText: string, language?: string): Promise<EssayAnalysisResult> {
    try {
      // First, perform the main essay analysis
      const analysisResponse = await GeminiService.analyzeEssay(essayText, language);
      
      if (analysisResponse.status === 'error') {
        throw new Error(analysisResponse.errorMessage || "Failed to analyze essay with AI");
      }
      
      // Parse the JSON response
      const analysisResult = JSON.parse(analysisResponse.text);
      
      // Then, check for plagiarism
      const plagiarismResponse = await GeminiService.detectPlagiarism(essayText, language);
      let plagiarismResult;
      
      if (plagiarismResponse.status === 'success') {
        try {
          plagiarismResult = JSON.parse(plagiarismResponse.text);
        } catch (error) {
          console.error("Error parsing plagiarism result:", error);
          // Default values if parsing fails
          plagiarismResult = {
            originalityScore: 95,
            matches: []
          };
        }
      } else {
        // Default values if API call fails
        plagiarismResult = {
          originalityScore: 95,
          matches: []
        };
      }
      
      // Combine the analysis and plagiarism results
      return {
        ...analysisResult,
        score: analysisResult.overallScore,
        plagiarism: {
          score: plagiarismResult.originalityScore,
          passages: plagiarismResult.matches.map((match: any) => ({
            text: match.text,
            matchPercentage: match.matchPercentage,
            source: match.source
          }))
        }
      };
    } catch (error) {
      console.error("Error in GeminiEssayService:", error);
      throw error;
    }
  }
}
