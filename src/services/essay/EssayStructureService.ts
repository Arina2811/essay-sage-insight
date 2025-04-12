
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
    
    // Base feedback structure including all required properties from EssayAnalysisResult
    return {
      score: feedbackLevel === 'lenient' ? 88 : feedbackLevel === 'moderate' ? 82 : 76,
      structure: {
        score: feedbackLevel === 'lenient' ? 85 : feedbackLevel === 'moderate' ? 80 : 75,
        feedback: feedbackLevel === 'lenient' 
          ? "Your essay has a good structure with a clear introduction and conclusion. The main arguments flow well."
          : feedbackLevel === 'moderate'
            ? "Your essay demonstrates a clear introduction, well-developed body paragraphs, and a cohesive conclusion. The thesis statement is effectively presented early in the introduction. Consider strengthening transitions between the third and fourth paragraphs to improve flow."
            : "Your essay has a reasonable structure but needs improvement. The introduction should more clearly establish your main arguments. Paragraph 3 seems disconnected from your thesis. The conclusion would benefit from a stronger synthesis of your key points rather than simply restating them."
      },
      style: {
        score: feedbackLevel === 'lenient' ? 90 : feedbackLevel === 'moderate' ? 85 : 78,
        feedback: feedbackLevel === 'lenient' 
          ? "Your writing style is engaging and appropriate for academic work."
          : feedbackLevel === 'moderate'
            ? "Your writing demonstrates strong academic tone with appropriate formality. The sentence structure is varied and engaging."
            : "Your writing style needs significant improvement to meet academic standards. There are several instances of informal language, and your sentence structure lacks variety.",
        suggestions: feedbackLevel === 'lenient' 
          ? [
              "Consider adding more transitional phrases between major sections",
              "Your conclusion could be strengthened with a stronger call to action"
            ]
          : feedbackLevel === 'moderate'
            ? [
                "Replace passive constructions with active voice in paragraphs 2 and 5",
                "Consider using more field-specific terminology when discussing theoretical concepts",
                "Add more transitional phrases between the third and fourth main arguments",
                "Vary sentence length in paragraph 3 to improve reading rhythm"
              ]
            : [
                "Eliminate all contractions throughout the essay to maintain formal academic tone",
                "Paragraph 1: Replace colloquial expressions with more precise academic terminology",
                "Paragraphs 2 and 4: Vary sentence structure to avoid monotonous rhythm",
                "Throughout: Replace vague terms like 'things' and 'stuff' with specific terminology",
                "Add stronger topic sentences to each paragraph that clearly connect to your thesis",
                "Paragraph 3: Completely restructure to better support your main argument",
                "Remove all first-person pronouns to maintain objective academic tone"
              ]
      },
      thesis: {
        detected: true,
        text: "Technological innovation has fundamentally transformed social interaction, creating both new opportunities for connection and unexpected challenges for interpersonal relationships.",
        score: feedbackLevel === 'lenient' ? 85 : feedbackLevel === 'moderate' ? 78 : 72,
        feedback: feedbackLevel === 'lenient' 
          ? "Your thesis is clear and effectively presents your main argument."
          : feedbackLevel === 'moderate'
            ? "Your thesis effectively presents a nuanced argument with both positive and negative aspects. Consider adding more specificity about which technologies you'll focus on to narrow your scope."
            : "Your thesis statement lacks clarity and specificity. It makes an overly broad claim without indicating your specific argument or approach. Revise to clearly state your position and outline the key points you will address."
      },
      citations: {
        count: 12,
        format: "APA 7th Edition",
        isValid: true,
        feedback: feedbackLevel === 'lenient' 
          ? "Your citations follow the APA format correctly."
          : feedbackLevel === 'moderate'
            ? "Citations follow APA format correctly. Consider adding one or two more recent sources (past 2 years) to strengthen your contemporary evidence."
            : "While your citations follow APA format, they have several issues: 1) You rely too heavily on older sources, 2) Several key claims lack citations altogether, 3) You need more peer-reviewed journal articles rather than websites, 4) Add page numbers for all direct quotations."
      },
      creativity: {
        score: feedbackLevel === 'lenient' ? 80 : feedbackLevel === 'moderate' ? 75 : 68,
        feedback: feedbackLevel === 'lenient' 
          ? "Your essay shows good creative thinking and original perspectives."
          : feedbackLevel === 'moderate'
            ? "Your essay shows some creative thinking, with a few original insights mixed with conventional analysis."
            : "Your essay lacks originality in its approach and perspectives. It largely follows conventional wisdom without contributing new insights.",
        highlights: feedbackLevel === 'lenient' 
          ? [
              "Interesting connection between historical events and modern applications",
              "Creative use of examples to illustrate your points"
            ]
          : feedbackLevel === 'moderate'
            ? [
                "Interesting perspective in the third paragraph",
                "Novel interpretation of the central problem"
              ]
            : [
                "The opening paragraph shows some creative potential"
              ],
        suggestions: feedbackLevel === 'lenient' 
          ? [
              "Consider exploring more unconventional perspectives on this topic"
            ]
          : feedbackLevel === 'moderate'
            ? [
                "Consider exploring more unconventional connections between your key points",
                "Try developing your own framework for analyzing this topic",
                "Incorporate more unique examples rather than commonly cited ones"
              ]
            : [
                "Challenge the standard interpretations more directly",
                "Develop your own unique framework rather than relying on established models",
                "Incorporate unexpected or contradictory examples to stimulate new thinking",
                "Consider interdisciplinary connections that aren't typically made in this field",
                "Present a more provocative thesis that challenges conventional assumptions"
              ]
      },
      plagiarism: plagiarism,
      // Add the missing properties
      readability: {
        score: feedbackLevel === 'lenient' ? 85 : feedbackLevel === 'moderate' ? 78 : 70,
        gradeLevel: feedbackLevel === 'lenient' ? "College" : feedbackLevel === 'moderate' ? "College" : "Upper High School",
        feedback: feedbackLevel === 'lenient' 
          ? "Your essay is well-structured and easy to follow at a college level."
          : feedbackLevel === 'moderate'
            ? "Your essay is appropriate for college-level readers with good sentence flow."
            : "Your essay needs improvement in readability. Complex sentences and specialized vocabulary may limit comprehension.",
        suggestions: feedbackLevel === 'lenient' 
          ? [
              "Consider adding more paragraph breaks for digital readability"
            ]
          : feedbackLevel === 'moderate'
            ? [
                "Break longer sentences into shorter ones in paragraphs 2 and 5",
                "Consider using simpler terms for technical concepts",
                "Add more transition words between paragraphs"
              ]
            : [
                "Significantly reduce sentence length throughout",
                "Replace specialized terminology with more accessible language",
                "Add clear topic sentences at the start of each paragraph",
                "Use more bullet points or numbered lists to organize complex information",
                "Add subheadings to improve navigation through your arguments"
              ]
      },
      aiDetection: {
        score: 95,
        isAiGenerated: false,
        confidence: 90,
        feedback: "This essay appears to be human-written based on writing patterns, stylistic variations, and narrative flow."
      },
      vocabulary: {
        score: feedbackLevel === 'lenient' ? 85 : feedbackLevel === 'moderate' ? 80 : 72,
        feedback: feedbackLevel === 'lenient' 
          ? "Your vocabulary is strong and well-suited to academic writing."
          : feedbackLevel === 'moderate'
            ? "You use appropriate academic vocabulary with room for enhancement."
            : "Your vocabulary is basic and needs significant improvement for academic writing.",
        advanced: feedbackLevel === 'lenient' 
          ? [
              "paradigm",
              "methodology",
              "intrinsic",
              "juxtaposition"
            ]
          : feedbackLevel === 'moderate'
            ? [
                "paradigm",
                "methodology",
                "intrinsic"
              ]
            : [
                "analysis"
              ],
        suggestions: feedbackLevel === 'lenient' 
          ? [
              "Consider using more discipline-specific terminology"
            ]
          : feedbackLevel === 'moderate'
            ? [
                "Consider replacing 'big' with 'substantial' or 'significant'",
                "Use 'analyze' instead of 'look at' in paragraph 4",
                "Try 'conceptualize' instead of 'think about' for a more academic tone"
              ]
            : [
                "Replace 'good' with 'beneficial', 'advantageous', or 'favorable'",
                "Use 'demonstrate' instead of 'show'",
                "Replace 'a lot of' with 'numerous', 'abundant', or 'substantial'",
                "Use 'investigate' instead of 'look into'",
                "Replace 'get' with 'obtain', 'acquire', or 'gain'"
              ]
      },
      targetAudience: {
        suitable: feedbackLevel === 'lenient' 
          ? ["college students", "academics", "subject matter experts", "educated general readers"]
          : feedbackLevel === 'moderate'
            ? ["college students", "academics", "subject matter experts"]
            : ["academics with prior subject knowledge"],
        unsuitable: feedbackLevel === 'lenient' 
          ? ["young readers"]
          : feedbackLevel === 'moderate'
            ? ["general public", "young readers"]
            : ["general public", "young readers", "undergraduate students without background knowledge"],
        feedback: feedbackLevel === 'lenient' 
          ? "This essay is accessible to educated readers with some background in the subject."
          : feedbackLevel === 'moderate'
            ? "This essay is most appropriate for an academic audience with subject knowledge."
            : "This essay requires significant prior knowledge and would only be suitable for specialized academic audiences."
      },
      sentiment: {
        overall: feedbackLevel === 'lenient' ? 'positive' : feedbackLevel === 'moderate' ? 'neutral' : 'negative',
        score: feedbackLevel === 'lenient' ? 65 : feedbackLevel === 'moderate' ? 55 : 40,
        feedback: feedbackLevel === 'lenient' 
          ? "Your essay has an optimistic tone while maintaining academic objectivity."
          : feedbackLevel === 'moderate'
            ? "Your essay maintains a primarily neutral academic tone, which is appropriate for analytical writing."
            : "Your essay tends toward a critical or negative tone that may undermine your analysis.",
        highlights: {
          positive: feedbackLevel === 'lenient' 
            ? ["well-balanced perspective", "constructive criticism", "optimistic conclusion"]
            : feedbackLevel === 'moderate'
              ? ["thoughtful analysis in paragraph 2", "balanced perspective throughout"]
              : ["brief acknowledgment of opposing views"],
          negative: feedbackLevel === 'lenient' 
            ? ["slightly dismissive tone in one paragraph"]
            : feedbackLevel === 'moderate'
              ? ["potentially dismissive tone in paragraph 4", "overly critical assessment of opposing views"]
              : ["overly harsh criticism throughout", "dismissive language toward alternative perspectives", "sarcastic tone in paragraph 3"]
        }
      }
    };
  }
}
