import { toast } from "sonner";

// This key would typically be stored in environment variables or Supabase secrets
let geminiApiKey: string | null = null;
let openAIApiKey: string | null = null;

export interface GeminiRequestOptions {
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  feedbackLevel?: 'lenient' | 'moderate' | 'strict';
  language?: string;
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

  static setOpenAIApiKey(key: string) {
    openAIApiKey = key;
    // Store in localStorage for persistence across page reloads
    localStorage.setItem('openai_api_key', key);
    return true;
  }

  static getOpenAIApiKey(): string | null {
    // Try to load from localStorage if not already in memory
    if (!openAIApiKey) {
      openAIApiKey = localStorage.getItem('openai_api_key');
    }
    return openAIApiKey;
  }

  static clearOpenAIApiKey() {
    openAIApiKey = null;
    localStorage.removeItem('openai_api_key');
  }

  static getFeedbackLevel(): 'lenient' | 'moderate' | 'strict' {
    const savedLevel = localStorage.getItem('feedbackLevel');
    if (savedLevel && ['lenient', 'moderate', 'strict'].includes(savedLevel)) {
      return savedLevel as 'lenient' | 'moderate' | 'strict';
    }
    return 'moderate'; // Default
  }

  static async generateContent(options: GeminiRequestOptions): Promise<GeminiResponse> {
    // First try OpenAI if available
    const openAIKey = this.getOpenAIApiKey();
    if (openAIKey) {
      try {
        console.log("Using OpenAI API for content generation");
        return await this.generateWithOpenAI(options, openAIKey);
      } catch (error) {
        console.error("Error with OpenAI API, falling back to Gemini:", error);
        // Fall back to Gemini if OpenAI fails
      }
    }
    
    // Use Gemini as fallback or if OpenAI is not available
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      toast.error("No AI API keys are set. Using fallback analysis method instead.");
      return {
        text: "",
        status: 'error',
        errorMessage: "API key not set"
      };
    }

    try {
      console.log("Sending request to Gemini API...");
      
      // Apply feedback level to prompt if it's not provided
      const feedbackLevel = options.feedbackLevel || this.getFeedbackLevel();
      let prompt = options.prompt;
      
      // Add feedback level instructions and language instructions
      if (prompt.includes("academic essay") || prompt.includes("analyze")) {
        const levelInstructions = {
          'lenient': "Provide gentle, positive feedback focusing only on major improvements. Highlight strengths and offer constructive suggestions for the most important issues.",
          'moderate': "Provide balanced feedback with both strengths and areas for improvement. Include suggestions for both major and minor issues.",
          'strict': "Provide detailed, thorough feedback with comprehensive critique. Focus on all aspects that could be improved, with specific recommendations for each issue."
        };
        
        prompt = `${prompt}\n\nFeedback level: ${feedbackLevel}. ${levelInstructions[feedbackLevel]}`;
        
        // Add language instruction if provided
        if (options.language && options.language !== 'en') {
          prompt += `\n\nPlease provide your analysis in ${options.language} language.`;
        }
      }
      
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
                    text: prompt,
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
      toast.error("Failed to generate content with Gemini. Using fallback analysis method instead.");
      return {
        text: "",
        status: 'error',
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  private static async generateWithOpenAI(options: GeminiRequestOptions, apiKey: string): Promise<GeminiResponse> {
    console.log("Generating content with OpenAI...");
    
    // Apply feedback level to prompt if it's not provided
    const feedbackLevel = options.feedbackLevel || this.getFeedbackLevel();
    let prompt = options.prompt;
    
    // Add feedback level instructions for essay analysis
    if (prompt.includes("academic essay") || prompt.includes("analyze")) {
      const levelInstructions = {
        'lenient': "Provide gentle, positive feedback focusing only on major improvements. Highlight strengths and offer constructive suggestions for the most important issues.",
        'moderate': "Provide balanced feedback with both strengths and areas for improvement. Include suggestions for both major and minor issues.",
        'strict': "Provide detailed, thorough feedback with comprehensive critique. Focus on all aspects that could be improved, with specific recommendations for each issue."
      };
      
      prompt = `${prompt}\n\nFeedback level: ${feedbackLevel}. ${levelInstructions[feedbackLevel]}`;
      
      // Add language instruction if provided
      if (options.language && options.language !== 'en') {
        prompt += `\n\nPlease provide your analysis in ${options.language} language.`;
      }
    }
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert essay analyst providing detailed feedback on academic essays."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxOutputTokens || 2048,
        top_p: options.topP || 0.95,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(errorData.error?.message || "Error generating content with OpenAI");
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content || "";
    
    return {
      text: generatedText,
      status: 'success'
    };
  }

  static async analyzeEssay(essayText: string, language?: string): Promise<GeminiResponse> {
    const feedbackLevel = this.getFeedbackLevel();
    
    return this.generateContent({
      prompt: `Analyze the following academic essay and provide detailed feedback on structure, style, thesis clarity, creativity, and overall effectiveness. Also include advanced analysis on readability, AI detection probability, vocabulary assessment, target audience, and sentiment analysis.
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
        },
        "creativity": {
          "score": number from 0-100,
          "feedback": "detailed feedback on originality and creative thinking",
          "highlights": ["creative element 1", "creative element 2"],
          "suggestions": ["suggestion to improve creativity 1", "suggestion 2", "suggestion 3"]
        },
        "readability": {
          "score": number from 0-100,
          "gradeLevel": "appropriate reading level (e.g., High School, College, Graduate)",
          "feedback": "feedback on how accessible the writing is",
          "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
        },
        "aiDetection": {
          "score": number from 0-100 (higher means more likely human-written),
          "isAiGenerated": boolean based on your assessment,
          "confidence": number from 0-100 representing your confidence in the assessment,
          "feedback": "explanation of AI detection assessment"
        },
        "vocabulary": {
          "score": number from 0-100,
          "feedback": "assessment of vocabulary usage",
          "advanced": ["list", "of", "advanced", "terms", "used"],
          "suggestions": ["vocabulary improvement suggestion 1", "suggestion 2", "suggestion 3"]
        },
        "targetAudience": {
          "suitable": ["audience type 1", "audience type 2"],
          "unsuitable": ["audience type not well suited for this content"],
          "feedback": "explanation of audience assessment"
        },
        "sentiment": {
          "overall": "positive", "neutral", or "negative",
          "score": number from 0-100 (50 being neutral),
          "feedback": "assessment of essay tone and sentiment",
          "highlights": {
            "positive": ["positive element 1", "positive element 2"],
            "negative": ["negative element 1", "negative element 2"]
          }
        }
      }

      For the creativity assessment, evaluate:
      1. Originality of ideas and perspectives
      2. Novel connections between concepts
      3. Innovative examples or case studies
      4. Unique frameworks or approaches to the topic
      5. Challenging conventional wisdom or assumptions

      For the readability assessment, consider:
      1. Sentence length and complexity
      2. Paragraph structure
      3. Use of technical jargon
      4. Flow and transitions
      5. Overall accessibility to the intended audience

      For the AI detection assessment, look for:
      1. Unnatural patterns or repetitions
      2. Lack of personal voice
      3. Generic examples or ideas
      4. Perfect grammar but lacking depth
      5. Inconsistencies in argument or style

      For the vocabulary assessment, evaluate:
      1. Variety of word choice
      2. Appropriateness of terminology
      3. Academic vs. conversational language
      4. Subject-specific vocabulary
      5. Precision and specificity of terms

      Here's the essay to analyze:
      
      ${essayText}`,
      temperature: 0.3, // Lower temperature for more structured analysis
      feedbackLevel: feedbackLevel,
      language: language
    });
  }

  static async detectPlagiarism(text: string, language?: string): Promise<GeminiResponse> {
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
      language: language
    });
  }

  static async generateResearchConclusion(topic: string, mainFindings: string[]): Promise<GeminiResponse> {
    const prompt = `Generate a detailed and comprehensive 150-200 word conclusion for a research paper that:

1. Effectively summarizes the key findings
2. Addresses the research significance
3. Discusses broader implications
4. Suggests future research directions
5. Ends with a strong closing statement

Use academic language and maintain a formal tone. Make the conclusion impactful and memorable while staying within 150-200 words.

Main findings to incorporate:
${mainFindings.map((finding, index) => `${index + 1}. ${finding}`).join('\n')}

Topic: ${topic}`;

    return this.generateContent({
      prompt,
      temperature: 0.7,
      maxOutputTokens: 500,
      feedbackLevel: 'strict'
    });
  }
}
