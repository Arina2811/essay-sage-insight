
import { toast } from "sonner";

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
  // This would normally connect to a real API/backend
  // For now, we'll simulate the analysis process
  static async analyzeEssay(essayText: string): Promise<EssayAnalysisResult> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demonstration, return mock analysis data
      // In a real app, this would call your backend API
      return {
        score: 78,
        structure: {
          score: 75,
          feedback: "Your essay has a clear introduction, body, and conclusion. The thesis is well-stated, but could be more specific."
        },
        style: {
          score: 82,
          feedback: "Your writing demonstrates good academic tone. Consider reducing use of passive voice.",
          suggestions: [
            "Replace passive constructions with active voice",
            "Use more field-specific terminology",
            "Add more transitional phrases between paragraphs"
          ]
        },
        thesis: {
          detected: true,
          text: "Technology has dramatically altered how we interact with information.",
          score: 68,
          feedback: "Your thesis is clear but somewhat broad. Consider narrowing your focus."
        },
        citations: {
          count: 8,
          format: "APA 7th Edition",
          isValid: true,
          feedback: "All citations follow APA format correctly. Two sources appear dated."
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Mock plagiarism check result
      return {
        originalityScore: 98,
        matches: [
          {
            text: "The digital revolution has transformed modern communication.",
            matchPercentage: 15,
            source: "Common academic phrase"
          }
        ]
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
