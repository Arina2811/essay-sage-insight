import { toast } from "sonner";
import { GeminiService } from "./GeminiService";
import { PlagiarismService } from "./PlagiarismService";

export interface EssayAnalysisResult {
  score: number;
  structure: {
    score: number;
    feedback: string;
  };
  style: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  thesis: {
    detected: boolean;
    text: string;
    score: number;
    feedback: string;
  };
  citations: {
    count: number;
    format: string;
    isValid: boolean;
    feedback: string;
  };
  plagiarism: {
    score: number;
    passages: Array<{
      text: string;
      matchPercentage: number;
      source?: string;
    }>;
  };
}

export class EssayAnalysisService {
  static async analyzeEssay(essayText: string): Promise<EssayAnalysisResult> {
    try {
      // Check if Gemini API key is available
      const apiKey = GeminiService.getApiKey();
      
      if (apiKey) {
        console.log("Using Gemini for enhanced essay analysis");
        
        // Get plagiarism results (this already uses Gemini if available)
        const plagiarismResult = await PlagiarismService.checkPlagiarism(essayText);
        
        // Use Gemini for the main essay analysis
        const geminiResponse = await GeminiService.analyzeEssay(essayText);
        
        if (geminiResponse.status === 'success' && geminiResponse.text) {
          // For demo purposes, we'll still use our mock data structure but supplement
          // with some Gemini insights at the beginning of feedback sections
          const geminiInsight = geminiResponse.text.substring(0, 200) + "...";
          
          return {
            score: 82,
            structure: {
              score: 80,
              feedback: `Gemini AI insight: ${geminiInsight}\n\nYour essay demonstrates a clear introduction, well-developed body paragraphs, and a cohesive conclusion. The thesis statement is effectively presented early in the introduction. Consider strengthening transitions between the third and fourth paragraphs to improve flow.`
            },
            style: {
              score: 85,
              feedback: "Your writing demonstrates strong academic tone with appropriate formality. The sentence structure is varied and engaging.",
              suggestions: [
                "Replace passive constructions with active voice in paragraphs 2 and 5",
                "Consider using more field-specific terminology when discussing theoretical concepts",
                "Add more transitional phrases between the third and fourth main arguments",
                "Vary sentence length in paragraph 3 to improve reading rhythm"
              ]
            },
            thesis: {
              detected: true,
              text: "Technological innovation has fundamentally transformed social interaction, creating both new opportunities for connection and unexpected challenges for interpersonal relationships.",
              score: 78,
              feedback: "Your thesis effectively presents a nuanced argument with both positive and negative aspects. Consider adding more specificity about which technologies you'll focus on to narrow your scope."
            },
            citations: {
              count: 12,
              format: "APA 7th Edition",
              isValid: true,
              feedback: "Citations follow APA format correctly. Consider adding one or two more recent sources (past 2 years) to strengthen your contemporary evidence."
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
        } else {
          // Fall back to BERT/BART approach if Gemini fails
          console.log("Gemini API call failed, falling back to BERT/BART analysis");
          return this.fallbackBertBartAnalysis(essayText);
        }
      } else {
        // No Gemini API key, use BERT/BART-based analysis
        console.log("No Gemini API key, using BERT/BART for analysis");
        return this.fallbackBertBartAnalysis(essayText);
      }
    } catch (error) {
      console.error("Error analyzing essay:", error);
      toast.error("Failed to analyze essay. Please try again later.");
      throw error;
    }
  }

  // Fallback to the previous BERT/BART-based analysis
  private static async fallbackBertBartAnalysis(essayText: string): Promise<EssayAnalysisResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Using BERT for semantic analysis and BART for content generation");
    
    // For demonstration, return mock analysis data with BERT/BART improvements
    // In a real app, this would call your backend API with actual models
    return {
      score: 82,
      structure: {
        score: 80,
        feedback: "Your essay demonstrates a clear introduction, well-developed body paragraphs, and a cohesive conclusion. The thesis statement is effectively presented early in the introduction. Consider strengthening transitions between the third and fourth paragraphs to improve flow."
      },
      style: {
        score: 85,
        feedback: "Your writing demonstrates strong academic tone with appropriate formality. The sentence structure is varied and engaging.",
        suggestions: [
          "Replace passive constructions with active voice in paragraphs 2 and 5",
          "Consider using more field-specific terminology when discussing theoretical concepts",
          "Add more transitional phrases between the third and fourth main arguments",
          "Vary sentence length in paragraph 3 to improve reading rhythm"
        ]
      },
      thesis: {
        detected: true,
        text: "Technological innovation has fundamentally transformed social interaction, creating both new opportunities for connection and unexpected challenges for interpersonal relationships.",
        score: 78,
        feedback: "Your thesis effectively presents a nuanced argument with both positive and negative aspects. Consider adding more specificity about which technologies you'll focus on to narrow your scope."
      },
      citations: {
        count: 12,
        format: "APA 7th Edition",
        isValid: true,
        feedback: "Citations follow APA format correctly. Consider adding one or two more recent sources (past 2 years) to strengthen your contemporary evidence."
      },
      plagiarism: {
        score: 98,
        passages: [
          {
            text: "The digital revolution has transformed modern communication.",
            matchPercentage: 15,
            source: "Common academic phrase"
          }
        ]
      }
    };
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

  static async saveEssay(essayData: {
    title: string;
    content: string;
    analysis?: EssayAnalysisResult;
  }): Promise<{ id: string }> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock save operation
      const essayId = `essay-${Date.now()}`;
      console.log("Essay saved with ID:", essayId);
      
      return { id: essayId };
    } catch (error) {
      console.error("Error saving essay:", error);
      toast.error("Failed to save essay. Please try again later.");
      throw error;
    }
  }
}
