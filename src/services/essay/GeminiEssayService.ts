
import { GeminiService } from "../GeminiService";
import { EssayAnalysisResult } from "@/types/essay";
import { PlagiarismService } from "../PlagiarismService";
import { EssayStructureService } from "./EssayStructureService";

/**
 * Responsible for Gemini-based essay analysis
 */
export class GeminiEssayService {
  /**
   * Analyze essay using Gemini API
   */
  static async analyzeWithGemini(essayText: string): Promise<EssayAnalysisResult> {
    // Get plagiarism results (this already uses Gemini if available)
    const plagiarismResult = await PlagiarismService.checkPlagiarism(essayText);
    
    // Use Gemini for the main essay analysis
    const geminiResponse = await GeminiService.analyzeEssay(essayText);
    
    if (geminiResponse.status === 'success' && geminiResponse.text) {
      try {
        // Clean the response text to handle potential markdown or code blocks
        const cleanedText = geminiResponse.text
          .replace(/```json\s*/g, '')
          .replace(/```\s*$/g, '')
          .replace(/```/g, '')
          .trim();
          
        // Parse the JSON response from Gemini
        const parsedAnalysis = JSON.parse(cleanedText);
        
        // Convert the Gemini response to our EssayAnalysisResult format
        return {
          score: parsedAnalysis.overallScore || 82,
          structure: {
            score: parsedAnalysis.structure?.score || 80,
            feedback: parsedAnalysis.structure?.feedback || "Your essay demonstrates a clear structure with room for improvement."
          },
          style: {
            score: parsedAnalysis.style?.score || 85,
            feedback: parsedAnalysis.style?.feedback || "Your writing demonstrates an academic tone with appropriate formality.",
            suggestions: parsedAnalysis.style?.suggestions || [
              "Consider varying sentence structure for better flow",
              "Use more field-specific terminology",
              "Add more transitional phrases between major arguments",
              "Vary paragraph length for better rhythm"
            ]
          },
          thesis: {
            detected: parsedAnalysis.thesis?.detected || true,
            text: parsedAnalysis.thesis?.text || "Thesis statement not clearly identified.",
            score: parsedAnalysis.thesis?.score || 78,
            feedback: parsedAnalysis.thesis?.feedback || "Your thesis could be more specific."
          },
          citations: {
            count: parsedAnalysis.citations?.count || 0,
            format: parsedAnalysis.citations?.format || "Unknown",
            isValid: parsedAnalysis.citations?.isValid || false,
            feedback: parsedAnalysis.citations?.feedback || "Citation analysis not available."
          },
          creativity: {
            score: parsedAnalysis.creativity?.score || 75,
            feedback: parsedAnalysis.creativity?.feedback || "Your essay demonstrates some creative elements in your approach to the topic.",
            highlights: parsedAnalysis.creativity?.highlights || [
              "Interesting perspective on the main argument",
              "Good use of metaphors in paragraph 3"
            ],
            suggestions: parsedAnalysis.creativity?.suggestions || [
              "Consider incorporating more unique examples",
              "Try using more varied vocabulary to express key concepts",
              "Develop your own framework for analyzing this topic"
            ]
          },
          plagiarism: {
            score: plagiarismResult.originalityScore,
            passages: plagiarismResult.matches.map(match => ({
              text: match.text,
              matchPercentage: match.matchPercentage,
              source: match.source
            }))
          }
        };
      } catch (parseError) {
        console.error("Error parsing Gemini analysis response:", parseError, geminiResponse.text);
        // Fall back to BERT/BART approach if parsing fails
        return EssayStructureService.fallbackBertBartAnalysis(essayText, plagiarismResult);
      }
    } else {
      // Fall back to BERT/BART approach if Gemini fails
      console.log("Gemini API call failed, falling back to BERT/BART analysis");
      return EssayStructureService.fallbackBertBartAnalysis(essayText, plagiarismResult);
    }
  }
}
