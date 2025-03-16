
import { toast } from "sonner";

export interface PlagiarismResult {
  originalityScore: number;
  matches: Array<{
    text: string;
    matchPercentage: number;
    source?: string;
    url?: string;
  }>;
}

export class PlagiarismService {
  // This would normally connect to a real API/database
  // For now, we'll simulate the plagiarism detection
  static async checkPlagiarism(text: string): Promise<PlagiarismResult> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock plagiarism detection result
      // In a real implementation, this would call an external API
      const result: PlagiarismResult = {
        originalityScore: 97,
        matches: []
      };
      
      // Simulate finding some matching content
      if (text.toLowerCase().includes("digital revolution")) {
        result.matches.push({
          text: "The digital revolution has transformed modern communication.",
          matchPercentage: 15,
          source: "Common Academic Phrase Database",
        });
      }
      
      if (text.toLowerCase().includes("artificial intelligence")) {
        result.matches.push({
          text: "Artificial intelligence represents a paradigm shift in computing technology.",
          matchPercentage: 20,
          source: "Introduction to AI (2022)",
          url: "https://example.com/ai-textbook",
        });
      }
      
      // Calculate originality score based on matches
      if (result.matches.length > 0) {
        const totalMatchPercentage = result.matches.reduce(
          (sum, match) => sum + match.matchPercentage, 0
        ) / result.matches.length;
        
        result.originalityScore = Math.max(100 - Math.round(totalMatchPercentage), 0);
      }
      
      return result;
    } catch (error) {
      console.error("Error checking plagiarism:", error);
      toast.error("Failed to check plagiarism. Please try again later.");
      throw error;
    }
  }
}
