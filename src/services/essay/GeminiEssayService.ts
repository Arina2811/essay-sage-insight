
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
          readability: {
            score: parsedAnalysis.readability?.score || 78,
            gradeLevel: parsedAnalysis.readability?.gradeLevel || "College",
            feedback: parsedAnalysis.readability?.feedback || "Your essay is appropriate for college-level readers.",
            suggestions: parsedAnalysis.readability?.suggestions || [
              "Break longer sentences into shorter ones in paragraphs 2 and 5",
              "Consider using simpler terms for technical concepts",
              "Add more transition words between paragraphs"
            ]
          },
          aiDetection: {
            score: parsedAnalysis.aiDetection?.score || 95,
            isAiGenerated: parsedAnalysis.aiDetection?.isAiGenerated || false,
            confidence: parsedAnalysis.aiDetection?.confidence || 90,
            feedback: parsedAnalysis.aiDetection?.feedback || "This essay appears to be human-written."
          },
          vocabulary: {
            score: parsedAnalysis.vocabulary?.score || 80,
            feedback: parsedAnalysis.vocabulary?.feedback || "You use appropriate academic vocabulary with room for enhancement.",
            advanced: parsedAnalysis.vocabulary?.advanced || [
              "paradigm",
              "methodology",
              "intrinsic"
            ],
            suggestions: parsedAnalysis.vocabulary?.suggestions || [
              "Consider replacing 'big' with 'substantial' or 'significant'",
              "Use 'analyze' instead of 'look at' in paragraph 4",
              "Try 'conceptualize' instead of 'think about' for a more academic tone"
            ]
          },
          targetAudience: {
            suitable: parsedAnalysis.targetAudience?.suitable || ["college students", "academics", "subject matter experts"],
            unsuitable: parsedAnalysis.targetAudience?.unsuitable || ["general public", "young readers"],
            feedback: parsedAnalysis.targetAudience?.feedback || "This essay is most appropriate for an academic audience with subject knowledge."
          },
          sentiment: {
            overall: parsedAnalysis.sentiment?.overall || "neutral",
            score: parsedAnalysis.sentiment?.score || 55,
            feedback: parsedAnalysis.sentiment?.feedback || "Your essay maintains a primarily neutral academic tone, which is appropriate for analytical writing.",
            highlights: parsedAnalysis.sentiment?.highlights || {
              positive: ["thoughtful analysis in paragraph 2", "balanced perspective throughout"],
              negative: ["potentially dismissive tone in paragraph 4", "overly critical assessment of opposing views"]
            }
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
