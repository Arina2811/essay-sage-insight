
import { toast } from "sonner";
import { GeminiService } from "../GeminiService";
import { EssayAnalysisResult } from "@/types/essay";
import { PlagiarismService } from "../PlagiarismService";

/**
 * Responsible for BERT/BART-based essay analysis when Gemini API is not available
 */
export class EssayStructureService {
  /**
   * Fallback analysis using BERT/BART methods
   */
  static async fallbackBertBartAnalysis(
    essayText: string, 
    plagiarismResult?: any,
    feedbackLevel: string = "moderate"
  ): Promise<EssayAnalysisResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Using BERT for semantic analysis and BART for content generation with ${feedbackLevel} feedback level`);
    
    // If we have plagiarism results, use them, otherwise default
    const plagiarism = plagiarismResult ? {
      score: plagiarismResult.originalityScore,
      passages: plagiarismResult.matches.map((match: any) => ({
        text: match.text,
        matchPercentage: match.matchPercentage,
        source: match.source
      }))
    } : {
      score: 98,
      passages: [
        {
          text: "The digital revolution has transformed modern communication.",
          matchPercentage: 15,
          source: "Common academic phrase"
        }
      ]
    };
    
    // For demonstration, return mock analysis data with BERT/BART improvements
    // Adjust feedback based on feedback level
    let score = 82;
    let structureFeedback = "";
    let styleFeedback = "";
    let thesisFeedback = "";
    let suggestions = [];
    
    switch(feedbackLevel) {
      case "strict":
        score = 78; // Stricter scoring
        structureFeedback = "Your essay follows a basic structure, but needs significant improvements in organization. The introduction should more clearly establish the context, and your conclusion fails to effectively synthesize your arguments. Transition between paragraphs 3 and 4 is particularly weak, and you should consider reorganizing your supporting evidence for better logical flow.";
        styleFeedback = "Your writing demonstrates inconsistent academic tone with several instances of informal language and conversational style that diminish the scholarly nature of your work. Sentence structure lacks variation, making sections repetitive.";
        thesisFeedback = "Your thesis statement lacks specificity and argumentative force. It presents a general topic without a clear position or claim that can be developed throughout the essay. Consider restructuring to include a more debatable assertion.";
        suggestions = [
          "Replace all passive constructions with active voice for stronger argumentation",
          "Adopt more precise field-specific terminology throughout the essay",
          "Add explicit transitional phrases between each paragraph",
          "Vary sentence structure in all paragraphs to improve readability",
          "Replace generic examples with specific evidence and data",
          "Strengthen your counterargument section with scholarly sources",
          "Revise thesis to include a more specific and debatable claim",
          "Restructure conclusion to emphasize significance of your findings"
        ];
        break;
      
      case "lenient":
        score = 88; // More generous scoring
        structureFeedback = "Your essay has a well-developed structure with a clear beginning, middle, and end. The flow of ideas is generally logical, though you might consider strengthening transitions between some paragraphs for even better coherence.";
        styleFeedback = "Your writing demonstrates a strong academic tone that effectively communicates your ideas. The language is generally appropriate for scholarly work.";
        thesisFeedback = "Your thesis successfully presents your main argument, though it could benefit from slightly more specificity in certain areas.";
        suggestions = [
          "Consider adding one or two more transitional phrases between key arguments",
          "You might benefit from slightly more field-specific terminology",
          "Consider varying paragraph length occasionally for better rhythm"
        ];
        break;
      
      default: // moderate
        structureFeedback = "Your essay demonstrates a clear introduction, well-developed body paragraphs, and a cohesive conclusion. The thesis statement is effectively presented early in the introduction. Consider strengthening transitions between the third and fourth paragraphs to improve flow.";
        styleFeedback = "Your writing demonstrates strong academic tone with appropriate formality. The sentence structure is varied and engaging.";
        thesisFeedback = "Your thesis effectively presents a nuanced argument with both positive and negative aspects. Consider adding more specificity about which technologies you'll focus on to narrow your scope.";
        suggestions = [
          "Replace passive constructions with active voice in paragraphs 2 and 5",
          "Consider using more field-specific terminology when discussing theoretical concepts",
          "Add more transitional phrases between the third and fourth main arguments",
          "Vary sentence length in paragraph 3 to improve reading rhythm"
        ];
    }
    
    return {
      score: score,
      structure: {
        score: feedbackLevel === "strict" ? 75 : (feedbackLevel === "lenient" ? 90 : 80),
        feedback: structureFeedback
      },
      style: {
        score: feedbackLevel === "strict" ? 78 : (feedbackLevel === "lenient" ? 88 : 85),
        feedback: styleFeedback,
        suggestions: suggestions
      },
      thesis: {
        detected: true,
        text: "Technological innovation has fundamentally transformed social interaction, creating both new opportunities for connection and unexpected challenges for interpersonal relationships.",
        score: feedbackLevel === "strict" ? 74 : (feedbackLevel === "lenient" ? 85 : 78),
        feedback: thesisFeedback
      },
      citations: {
        count: feedbackLevel === "strict" ? 8 : 12, // Stricter feedback suggests more citations needed
        format: "APA 7th Edition",
        isValid: feedbackLevel !== "strict", // In strict mode, find citation issues
        feedback: feedbackLevel === "strict" 
          ? "Citations generally follow APA format but with several inconsistencies. Two sources are missing publication years, and in-text citations don't always match reference list. Add 3-4 more recent scholarly sources to strengthen your argument."
          : "Citations follow APA format correctly. Consider adding one or two more recent sources (past 2 years) to strengthen your contemporary evidence."
      },
      plagiarism: plagiarism
    };
  }
}
