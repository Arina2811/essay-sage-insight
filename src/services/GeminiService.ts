
import { toast } from "sonner";

// This key would typically be stored in environment variables or Supabase secrets
let geminiApiKey: string | null = "AIzaSyDm1pVklbG1mtweNxYjunJJM9DkgkrHOro";

export interface GeminiRequestOptions {
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export interface GeminiResponse {
  text: string;
  status: 'success' | 'error';
  errorMessage?: string;
}

export class GeminiService {
  static setApiKey(key: string) {
    geminiApiKey = key;
    // Store in localStorage for persistence across page reloads
    localStorage.setItem('gemini_api_key', key);
    return true;
  }

  static getApiKey(): string | null {
    // Try to load from localStorage if not already in memory
    if (!geminiApiKey) {
      geminiApiKey = localStorage.getItem('gemini_api_key');
    }
    return geminiApiKey;
  }

  static clearApiKey() {
    geminiApiKey = null;
    localStorage.removeItem('gemini_api_key');
  }

  static async generateContent(options: GeminiRequestOptions): Promise<GeminiResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      toast.error("Gemini API key is not set. Please add your API key in Settings.");
      return {
        text: "",
        status: 'error',
        errorMessage: "API key not set"
      };
    }

    try {
      console.log("Sending request to Gemini API...");
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: options.prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: options.temperature || 0.7,
              maxOutputTokens: options.maxOutputTokens || 2048,
              topP: options.topP || 0.95,
              topK: options.topK || 40,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error:", errorData);
        throw new Error(errorData.error?.message || "Error generating content");
      }

      const data = await response.json();
      
      // Extract the response text from the Gemini API response
      const generatedText = data.candidates[0]?.content?.parts[0]?.text || "";
      
      return {
        text: generatedText,
        status: 'success'
      };
    } catch (error) {
      console.error("Error with Gemini API:", error);
      toast.error("Failed to generate content with Gemini. Please try again later.");
      return {
        text: "",
        status: 'error',
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  static async analyzeEssay(essayText: string): Promise<GeminiResponse> {
    return this.generateContent({
      prompt: `Analyze the following academic essay and provide detailed feedback on structure, style, thesis clarity, and overall effectiveness. Be specific about strengths and areas for improvement.
      Format your analysis as a JSON object with these fields:
      {
        "overallScore": number from 0-100,
        "structure": {
          "score": number from 0-100,
          "feedback": "detailed feedback on essay structure"
        },
        "style": {
          "score": number from 0-100,
          "feedback": "detailed feedback on writing style",
          "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4"]
        },
        "thesis": {
          "detected": boolean,
          "text": "extracted thesis statement if detected",
          "score": number from 0-100,
          "feedback": "feedback on thesis clarity and effectiveness"
        },
        "citations": {
          "count": number of citations detected,
          "format": "detected citation format (e.g., APA, MLA)",
          "isValid": boolean,
          "feedback": "feedback on citation usage and formatting"
        }
      }

      Here's the essay to analyze:
      
      ${essayText}`,
      temperature: 0.3, // Lower temperature for more structured analysis
    });
  }

  static async detectPlagiarism(text: string): Promise<GeminiResponse> {
    return this.generateContent({
      prompt: `Analyze the following text for potential plagiarism. Identify any common academic phrases, widely used expressions, or potential verbatim copies that might need citation. Do not falsely flag original content.
      
      Format your response as a plain JSON object with these fields - DO NOT include any markdown formatting, code blocks, or extra text:
      {
        "originalityScore": number from 0-100,
        "matches": [
          {
            "text": "matched text excerpt",
            "matchPercentage": percentage of similarity,
            "source": "general description of where this might be common",
            "recommendation": "your recommendation"
          }
        ]
      }
      
      Here's the text to analyze:
      
      ${text}`,
      temperature: 0.2, // Lower temperature for more consistent response format
    });
  }
}
