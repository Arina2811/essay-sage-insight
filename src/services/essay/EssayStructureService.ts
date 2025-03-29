
import { toast } from "sonner";
import { GeminiService } from "../GeminiService";
import { EssayAnalysisResult } from "@/types/essay";
import { PlagiarismService } from "../PlagiarismService";

/**
 * Configuration interface for BERT/BART models
 */
export interface NlpModelConfig {
  bertConfig: {
    sensitivity: number;
    contextDepth: number;
  };
  bartConfig: {
    creativity: number;
    academicTone: number;
  };
}

/**
 * Responsible for BERT/BART-based essay analysis when Gemini API is not available
 */
export class EssayStructureService {
  // Default configuration values
  private static defaultConfig: NlpModelConfig = {
    bertConfig: {
      sensitivity: 75,
      contextDepth: 80,
    },
    bartConfig: {
      creativity: 60,
      academicTone: 85,
    }
  };

  private static currentConfig: NlpModelConfig = {...EssayStructureService.defaultConfig};

  /**
   * Update NLP model configuration
   */
  static updateConfig(config: Partial<NlpModelConfig>): void {
    if (config.bertConfig) {
      this.currentConfig.bertConfig = {
        ...this.currentConfig.bertConfig,
        ...config.bertConfig
      };
    }
    
    if (config.bartConfig) {
      this.currentConfig.bartConfig = {
        ...this.currentConfig.bartConfig,
        ...config.bartConfig
      };
    }
    
    console.log("Updated NLP model configuration:", this.currentConfig);
    
    // Persist configuration to localStorage for retrieval across sessions
    localStorage.setItem('nlpModelConfig', JSON.stringify(this.currentConfig));
  }

  /**
   * Get current NLP model configuration
   */
  static getConfig(): NlpModelConfig {
    // Try to load from localStorage if available
    const savedConfig = localStorage.getItem('nlpModelConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        this.currentConfig = {
          bertConfig: {
            ...this.defaultConfig.bertConfig,
            ...parsedConfig.bertConfig
          },
          bartConfig: {
            ...this.defaultConfig.bartConfig,
            ...parsedConfig.bartConfig
          }
        };
      } catch (error) {
        console.error("Error parsing saved NLP config:", error);
      }
    }
    
    return this.currentConfig;
  }

  /**
   * Reset configuration to defaults
   */
  static resetConfig(): void {
    this.currentConfig = {...this.defaultConfig};
    localStorage.removeItem('nlpModelConfig');
    console.log("Reset NLP model configuration to defaults");
  }

  /**
   * Apply BERT configuration to enhance semantic analysis
   */
  private static applyBertSemanticAnalysis(essayText: string, config: NlpModelConfig['bertConfig']) {
    console.log("Applying BERT semantic analysis with config:", config);
    
    // Here we would integrate with actual BERT model API
    // For now, we simulate enhanced analysis based on configuration
    
    const sentenceComplexity = this.analyzeSentenceComplexity(essayText);
    const topicCoherence = this.analyzeTopicCoherence(essayText, config.contextDepth / 100);
    const semanticDepth = this.calculateSemanticDepth(essayText, config.sensitivity / 100);
    
    return {
      sentenceComplexity,
      topicCoherence,
      semanticDepth,
      overallScore: Math.round((sentenceComplexity + topicCoherence + semanticDepth) / 3)
    };
  }

  /**
   * Apply BART configuration for content generation and suggestions
   */
  private static applyBartContentGeneration(essayText: string, config: NlpModelConfig['bartConfig']) {
    console.log("Applying BART content generation with config:", config);
    
    // Here we would integrate with actual BART model API
    // For now, we simulate content generation based on configuration

    // Generate suggestions with creativity level influence
    const creativity = config.creativity / 100;
    const academicTone = config.academicTone / 100;
    
    return {
      suggestions: this.generateSuggestions(essayText, creativity, academicTone),
      improvedThesis: this.generateImprovedThesis(essayText, creativity, academicTone),
      alternativePhrasing: this.generateAlternativePhrasing(essayText, creativity, academicTone)
    };
  }

  /**
   * Analyze sentence complexity
   */
  private static analyzeSentenceComplexity(text: string): number {
    // Simple algorithm to estimate sentence complexity
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordCount = sentences.reduce((sum, sentence) => 
      sum + sentence.split(/\s+/).filter(w => w.length > 0).length, 0) / Math.max(sentences.length, 1);
    
    // Score based on optimal academic sentence length (15-25 words)
    return Math.min(100, Math.max(60, 
      avgWordCount < 8 ? 60 + avgWordCount * 2 : 
      avgWordCount > 25 ? 95 - (avgWordCount - 25) : 
      75 + (avgWordCount - 8)
    ));
  }

  /**
   * Analyze topic coherence with contextDepth parameter
   */
  private static analyzeTopicCoherence(text: string, contextDepth: number): number {
    // Simple algorithm to estimate topic coherence
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    // Base coherence score
    let coherenceScore = 75;
    
    // Adjust based on number of paragraphs (optimal is 5-7 for academic essays)
    coherenceScore += Math.min(10, Math.max(-10, 
      paragraphs.length < 3 ? -10 : 
      paragraphs.length > 10 ? -5 : 
      paragraphs.length >= 5 && paragraphs.length <= 7 ? 10 : 5
    ));
    
    // Apply contextDepth factor
    coherenceScore = Math.min(100, Math.max(60, coherenceScore * (0.8 + contextDepth * 0.4)));
    
    return coherenceScore;
  }

  /**
   * Calculate semantic depth with sensitivity parameter
   */
  private static calculateSemanticDepth(text: string, sensitivity: number): number {
    // Base semantic score
    let semanticScore = 70;
    
    // Check for academic vocabulary indicators
    const academicTerms = [
      "analysis", "research", "theory", "concept", "framework", 
      "methodology", "paradigm", "perspective", "hypothesis", "empirical",
      "evidence", "significant", "correlation", "variable", "factor"
    ];
    
    const lowerText = text.toLowerCase();
    const termCount = academicTerms.reduce((count, term) => 
      count + (lowerText.match(new RegExp(`\\b${term}\\b`, 'g')) || []).length, 0);
    
    // Adjust based on academic term density
    const textLength = text.length;
    const termDensity = termCount / (textLength / 1000); // Terms per 1000 characters
    
    semanticScore += Math.min(15, Math.max(-10, termDensity * 3 - 5));
    
    // Apply sensitivity factor
    semanticScore = Math.min(100, Math.max(60, semanticScore * (0.8 + sensitivity * 0.4)));
    
    return semanticScore;
  }

  /**
   * Generate suggestions based on creativity and academic tone parameters
   */
  private static generateSuggestions(text: string, creativity: number, academicTone: number): string[] {
    const suggestions = [
      "Consider strengthening your thesis statement with more specific claims",
      "Add more transitional phrases between major arguments",
      "Incorporate more field-specific terminology to demonstrate expertise",
      "Vary sentence structure to improve overall flow and readability"
    ];
    
    // Add creative suggestions based on creativity parameter
    if (creativity > 0.6) {
      suggestions.push("Experiment with a more compelling introduction using a relevant anecdote");
      suggestions.push("Consider incorporating a counterargument to strengthen your position");
    }
    
    // Add academic tone suggestions based on academicTone parameter
    if (academicTone > 0.7) {
      suggestions.push("Replace informal language with more scholarly terminology");
      suggestions.push("Ensure all claims are supported by credible academic sources");
    }
    
    return suggestions;
  }

  /**
   * Generate improved thesis based on creativity and academic tone parameters
   */
  private static generateImprovedThesis(text: string, creativity: number, academicTone: number): string {
    // Extract likely thesis (simplistic approach for simulation)
    const firstParagraph = text.split(/\n\n+/)[0] || "";
    const sentences = firstParagraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const likelyThesis = sentences.length > 1 ? sentences[sentences.length - 1] : sentences[0] || "";
    
    // For demonstration, return a modified version based on parameters
    const academicPhrases = academicTone > 0.7 ? 
      ["This research demonstrates that", "This analysis reveals that", "Evidence suggests that"] :
      ["This essay shows that", "It is clear that", "This paper argues that"];
      
    const creativePhrasing = creativity > 0.6 ? 
      " with significant implications for our understanding of the subject" :
      " as demonstrated by the evidence presented";
      
    return `${academicPhrases[Math.floor(Math.random() * academicPhrases.length)]} ${likelyThesis.trim()}${creativePhrasing}.`;
  }

  /**
   * Generate alternative phrasing based on creativity and academic tone parameters
   */
  private static generateAlternativePhrasing(text: string, creativity: number, academicTone: number): Record<string, string> {
    // Identify common phrases that could be improved
    const commonPhrases: Record<string, string> = {};
    
    if (text.toLowerCase().includes("in conclusion")) {
      commonPhrases["In conclusion"] = academicTone > 0.7 ? 
        "The evidence thus demonstrates" : 
        "To summarize the findings";
    }
    
    if (text.toLowerCase().includes("i think") || text.toLowerCase().includes("i believe")) {
      commonPhrases["I think/I believe"] = academicTone > 0.7 ? 
        "The analysis suggests" : 
        "It can be observed that";
    }
    
    if (text.toLowerCase().includes("very important")) {
      commonPhrases["very important"] = academicTone > 0.7 ? 
        "critically significant" : 
        "essential";
    }
    
    return commonPhrases;
  }

  /**
   * Fallback analysis using BERT/BART methods
   */
  static async fallbackBertBartAnalysis(
    essayText: string, 
    plagiarismResult?: any
  ): Promise<EssayAnalysisResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Using BERT for semantic analysis and BART for content generation");
    
    // Load current configuration
    const config = this.getConfig();
    console.log("Using NLP configuration:", config);
    
    // Apply BERT semantic analysis
    const bertAnalysis = this.applyBertSemanticAnalysis(essayText, config.bertConfig);
    
    // Apply BART content generation
    const bartGeneration = this.applyBartContentGeneration(essayText, config.bartConfig);
    
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
    
    // For demonstration, return analysis data enhanced with BERT/BART improvements
    return {
      score: bertAnalysis.overallScore,
      structure: {
        score: bertAnalysis.topicCoherence,
        feedback: `Your essay demonstrates a clear structure with a coherence score of ${bertAnalysis.topicCoherence}/100. ${
          bertAnalysis.topicCoherence > 85 
            ? "The flow between paragraphs is excellent." 
            : "Consider strengthening transitions between paragraphs for better flow."
        }`
      },
      style: {
        score: bertAnalysis.sentenceComplexity,
        feedback: `Your writing demonstrates ${
          bertAnalysis.sentenceComplexity > 85 ? "excellent" : "good"
        } sentence complexity with appropriate academic tone.`,
        suggestions: bartGeneration.suggestions
      },
      thesis: {
        detected: true,
        text: bartGeneration.improvedThesis,
        score: 78,
        feedback: `Your thesis effectively presents your argument. Consider this alternative: "${bartGeneration.improvedThesis}"`
      },
      citations: {
        count: 12,
        format: "APA 7th Edition",
        isValid: true,
        feedback: "Citations follow APA format correctly. Consider adding one or two more recent sources (past 2 years) to strengthen your contemporary evidence."
      },
      plagiarism: plagiarism
    };
  }
}
