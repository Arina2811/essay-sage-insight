
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
  static async analyzeWithGemini(essayText: string, feedbackLevel: string = "moderate"): Promise<EssayAnalysisResult> {
    // Get plagiarism results (this already uses Gemini if available)
    const plagiarismResult = await PlagiarismService.checkPlagiarism(essayText);
    
    // Determine temperature based on feedback level
    let temperature = 0.3; // default for moderate
    let intensityPrompt = "";
    
    if (feedbackLevel === "strict") {
      temperature = 0.2; // Lower temperature for more precise/critical feedback
      intensityPrompt = "Provide very detailed and critical feedback. Focus on identifying all potential improvements, even minor issues. Be thorough and exacting in your analysis.";
    } else if (feedbackLevel === "lenient") {
      temperature = 0.5; // Higher temperature for more generous feedback
      intensityPrompt = "Provide encouraging and supportive feedback. Focus on major improvements while highlighting strengths. Be gentle and constructive in your criticism.";
    } else {
      // moderate (default)
      intensityPrompt = "Provide balanced feedback with both positive points and areas for improvement. Offer a mix of major and minor suggestions.";
    }
    
    // Use Gemini for the main essay analysis with the appropriate intensity
    const geminiResponse = await GeminiService.analyzeEssay(essayText, temperature, intensityPrompt);
    
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
        
        // Get the appropriate number of suggestions based on feedback level
        let suggestions = parsedAnalysis.style?.suggestions || [
          "Consider varying sentence structure for better flow",
          "Use more field-specific terminology",
          "Add more transitional phrases between arguments",
          "Vary paragraph length for better rhythm"
        ];
        
        // Adjust number of suggestions based on feedback level
        if (feedbackLevel === "strict" && suggestions.length < 6) {
          // For strict feedback, provide more detailed suggestions
          suggestions = [
            ...suggestions,
            "Strengthen your thesis with more specific claims",
            "Review your conclusion for a stronger synthesis of arguments",
            "Consider addressing opposing viewpoints more explicitly",
            "Improve citation quality with more recent scholarly sources"
          ].slice(0, 8); // Ensure we have up to 8 suggestions for strict
        } else if (feedbackLevel === "lenient" && suggestions.length > 3) {
          // For lenient feedback, focus on fewer, more important suggestions
          suggestions = suggestions.slice(0, 3);
        }
        
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
            suggestions: suggestions
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
        return EssayStructureService.fallbackBertBartAnalysis(essayText, plagiarismResult, feedbackLevel);
      }
    } else {
      // Fall back to BERT/BART approach if Gemini fails
      console.log("Gemini API call failed, falling back to BERT/BART analysis");
      return EssayStructureService.fallbackBertBartAnalysis(essayText, plagiarismResult, feedbackLevel);
    }
  }
}
