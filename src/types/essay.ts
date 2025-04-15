
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
  creativity: {
    score: number;
    feedback: string;
    highlights: string[];
    suggestions: string[];
  };
  plagiarism: {
    score: number;
    passages: Array<{
      text: string;
      matchPercentage: number;
      source?: string;
    }>;
  };
  readability: {
    score: number;
    gradeLevel: string;
    feedback: string;
    suggestions: string[];
  };
  aiDetection: {
    score: number;
    isAiGenerated: boolean;
    confidence: number;
    feedback: string;
    markers?: string[]; // Added for enhanced AI detection
  };
  vocabulary: {
    score: number;
    feedback: string;
    advanced: string[];
    suggestions: string[];
    uniqueness?: number; // Added for enhanced vocabulary analysis
    academicLevel?: "basic" | "intermediate" | "advanced" | "expert"; // Added for enhanced vocabulary analysis
    improvementAreas?: string[]; // Added for enhanced vocabulary analysis
    strengths?: string[]; // Added for enhanced vocabulary analysis
    typos?: Array<{ // Added for enhanced typo detection
      word: string;
      suggestions: string[];
      context: string;
    }>;
  };
  targetAudience: {
    suitable: string[];
    unsuitable: string[];
    feedback: string;
  };
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    score: number;
    feedback: string;
    highlights: {
      positive: string[];
      negative: string[];
    };
  };
}

export interface EssayData {
  id?: string;
  title: string;
  content: string;
  analysis?: EssayAnalysisResult;
  created_at?: string;
}
