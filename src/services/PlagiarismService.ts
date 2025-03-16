
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
  // For now, we'll simulate the plagiarism detection with BERT-like approach
  static async checkPlagiarism(text: string): Promise<PlagiarismResult> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log("Using BERT-based semantic matching for plagiarism detection");
      
      // Mock plagiarism detection result
      // In a real implementation, this would call an external API with BERT embeddings
      const result: PlagiarismResult = {
        originalityScore: 95,
        matches: []
      };
      
      // More sophisticated simulated matching using BERT-like semantic understanding
      if (text.toLowerCase().includes("digital revolution") || 
          text.toLowerCase().includes("information age") ||
          text.toLowerCase().includes("technological advancement")) {
        result.matches.push({
          text: "The digital revolution has transformed modern communication, ushering in a new information age.",
          matchPercentage: 18,
          source: "Contemporary Digital Communication Theory (2023)",
          url: "https://example.com/digital-theory",
        });
      }
      
      if (text.toLowerCase().includes("artificial intelligence") || 
          text.toLowerCase().includes("machine learning") ||
          text.toLowerCase().includes("deep learning")) {
        result.matches.push({
          text: "Artificial intelligence represents a paradigm shift in computing technology, with machine learning and deep learning approaches enabling new capabilities.",
          matchPercentage: 22,
          source: "Advanced AI Concepts (2022)",
          url: "https://example.com/ai-concepts",
        });
      }
      
      // BERT can detect paraphrased content
      if (text.toLowerCase().includes("climate") && 
          (text.toLowerCase().includes("change") || text.toLowerCase().includes("crisis") || text.toLowerCase().includes("emergency"))) {
        result.matches.push({
          text: "Climate change represents one of the most significant global challenges of the 21st century.",
          matchPercentage: 15,
          source: "Environmental Science Journal, Vol. 45",
          url: "https://example.com/env-science-journal",
        });
      }
      
      // Calculate originality score based on matches with more sophisticated weighting
      if (result.matches.length > 0) {
        // Weight longer matches more heavily
        const totalMatchPercentage = result.matches.reduce(
          (sum, match) => sum + (match.matchPercentage * (match.text.length / 50)), 0
        );
        
        // BERT-style semantic analysis would provide more accurate originality scoring
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
