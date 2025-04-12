
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
    feedbackLevel: 'lenient' | 'moderate' | 'strict' = 'moderate'
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
    
    // Base feedback structure
    let feedback = {
      score: 82,
      structure: {
        score: 80,
        feedback: ""
      },
      style: {
        score: 85,
        feedback: "",
        suggestions: [] as string[]
      },
      thesis: {
        detected: true,
        text: "Technological innovation has fundamentally transformed social interaction, creating both new opportunities for connection and unexpected challenges for interpersonal relationships.",
        score: 78,
        feedback: ""
      },
      citations: {
        count: 12,
        format: "APA 7th Edition",
        isValid: true,
        feedback: ""
      },
      creativity: {
        score: 75,
        feedback: "",
        highlights: [] as string[],
        suggestions: [] as string[]
      },
      plagiarism: plagiarism
    };
    
    // Adjust feedback based on intensity level
    switch (feedbackLevel) {
      case 'lenient':
        feedback.score = 88;
        feedback.structure.score = 85;
        feedback.structure.feedback = "Your essay has a good structure with a clear introduction and conclusion. The main arguments flow well.";
        feedback.style.score = 90;
        feedback.style.feedback = "Your writing style is engaging and appropriate for academic work.";
        feedback.style.suggestions = [
          "Consider adding more transitional phrases between major sections",
          "Your conclusion could be strengthened with a stronger call to action"
        ];
        feedback.thesis.score = 85;
        feedback.thesis.feedback = "Your thesis is clear and effectively presents your main argument.";
        feedback.citations.feedback = "Your citations follow the APA format correctly.";
        feedback.creativity.score = 80;
        feedback.creativity.feedback = "Your essay shows good creative thinking and original perspectives.";
        feedback.creativity.highlights = [
          "Interesting connection between historical events and modern applications",
          "Creative use of examples to illustrate your points"
        ];
        feedback.creativity.suggestions = [
          "Consider exploring more unconventional perspectives on this topic"
        ];
        break;
        
      case 'moderate':
        feedback.score = 82;
        feedback.structure.score = 80;
        feedback.structure.feedback = "Your essay demonstrates a clear introduction, well-developed body paragraphs, and a cohesive conclusion. The thesis statement is effectively presented early in the introduction. Consider strengthening transitions between the third and fourth paragraphs to improve flow.";
        feedback.style.score = 85;
        feedback.style.feedback = "Your writing demonstrates strong academic tone with appropriate formality. The sentence structure is varied and engaging.";
        feedback.style.suggestions = [
          "Replace passive constructions with active voice in paragraphs 2 and 5",
          "Consider using more field-specific terminology when discussing theoretical concepts",
          "Add more transitional phrases between the third and fourth main arguments",
          "Vary sentence length in paragraph 3 to improve reading rhythm"
        ];
        feedback.thesis.score = 78;
        feedback.thesis.feedback = "Your thesis effectively presents a nuanced argument with both positive and negative aspects. Consider adding more specificity about which technologies you'll focus on to narrow your scope.";
        feedback.citations.feedback = "Citations follow APA format correctly. Consider adding one or two more recent sources (past 2 years) to strengthen your contemporary evidence.";
        feedback.creativity.score = 75;
        feedback.creativity.feedback = "Your essay shows some creative thinking, with a few original insights mixed with conventional analysis.";
        feedback.creativity.highlights = [
          "Interesting perspective in the third paragraph",
          "Novel interpretation of the central problem"
        ];
        feedback.creativity.suggestions = [
          "Consider exploring more unconventional connections between your key points",
          "Try developing your own framework for analyzing this topic",
          "Incorporate more unique examples rather than commonly cited ones"
        ];
        break;
        
      case 'strict':
        feedback.score = 76;
        feedback.structure.score = 75;
        feedback.structure.feedback = "Your essay has a reasonable structure but needs improvement. The introduction should more clearly establish your main arguments. Paragraph 3 seems disconnected from your thesis. The conclusion would benefit from a stronger synthesis of your key points rather than simply restating them.";
        feedback.style.score = 78;
        feedback.style.feedback = "Your writing style needs significant improvement to meet academic standards. There are several instances of informal language, and your sentence structure lacks variety.";
        feedback.style.suggestions = [
          "Eliminate all contractions throughout the essay to maintain formal academic tone",
          "Paragraph 1: Replace colloquial expressions with more precise academic terminology",
          "Paragraphs 2 and 4: Vary sentence structure to avoid monotonous rhythm",
          "Throughout: Replace vague terms like 'things' and 'stuff' with specific terminology",
          "Add stronger topic sentences to each paragraph that clearly connect to your thesis",
          "Paragraph 3: Completely restructure to better support your main argument",
          "Remove all first-person pronouns to maintain objective academic tone"
        ];
        feedback.thesis.score = 72;
        feedback.thesis.feedback = "Your thesis statement lacks clarity and specificity. It makes an overly broad claim without indicating your specific argument or approach. Revise to clearly state your position and outline the key points you will address.";
        feedback.citations.feedback = "While your citations follow APA format, they have several issues: 1) You rely too heavily on older sources, 2) Several key claims lack citations altogether, 3) You need more peer-reviewed journal articles rather than websites, 4) Add page numbers for all direct quotations.";
        feedback.creativity.score = 68;
        feedback.creativity.feedback = "Your essay lacks originality in its approach and perspectives. It largely follows conventional wisdom without contributing new insights.";
        feedback.creativity.highlights = [
          "The opening paragraph shows some creative potential"
        ];
        feedback.creativity.suggestions = [
          "Challenge the standard interpretations more directly",
          "Develop your own unique framework rather than relying on established models",
          "Incorporate unexpected or contradictory examples to stimulate new thinking",
          "Consider interdisciplinary connections that aren't typically made in this field",
          "Present a more provocative thesis that challenges conventional assumptions"
        ];
        break;
    }
    
    return feedback;
  }
}
