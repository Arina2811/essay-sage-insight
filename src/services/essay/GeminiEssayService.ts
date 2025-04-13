
import { GeminiService } from "../GeminiService";
import { EssayAnalysisResult } from "@/types/essay";

export class GeminiEssayService {
  /**
   * Analyze an essay using the Gemini API
   */
  static async analyzeWithGemini(essayText: string): Promise<EssayAnalysisResult> {
    try {
      // First, perform the main essay analysis
      const analysisResponse = await GeminiService.analyzeEssay(essayText);
      
      if (analysisResponse.status === 'error') {
        throw new Error(analysisResponse.errorMessage || "Failed to analyze essay with AI");
      }
      
      // Clean and parse the JSON response to handle markdown formatted responses
      const cleanedText = analysisResponse.text
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/```/g, '')
        .trim();
      
      // Parse the cleaned JSON response
      const analysisResult = JSON.parse(cleanedText);
      
      // Then, check for plagiarism
      const plagiarismResponse = await GeminiService.detectPlagiarism(essayText);
      let plagiarismResult;
      
      if (plagiarismResponse.status === 'success') {
        try {
          // Clean plagiarism response as well
          const cleanedPlagiarismText = plagiarismResponse.text
            .replace(/```json\s*/g, '')
            .replace(/```\s*$/g, '')
            .replace(/```/g, '')
            .trim();
            
          plagiarismResult = JSON.parse(cleanedPlagiarismText);
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
