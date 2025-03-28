
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

export interface EssayData {
  title: string;
  content: string;
  analysis?: EssayAnalysisResult;
}
