import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      throw new Error('Valid essay text is required');
    }

    // Try to use OpenAI first
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (openAIKey) {
      try {
        console.log("Analyzing essay with OpenAI GPT-4");
        // Use OpenAI API for enhanced analysis
        const analysisResponse = await analyzeWithOpenAI(text, openAIKey);
        
        // Use OpenAI API for plagiarism detection
        const plagiarismResponse = await checkPlagiarismWithOpenAI(text, openAIKey);
        
        // Combine the results
        const combinedAnalysis = {
          ...analysisResponse,
          plagiarism: plagiarismResponse
        };

        return new Response(
          JSON.stringify({ 
            status: 'success',
            analysis: combinedAnalysis,
            provider: 'openai'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (openAIError) {
        console.error("Error with OpenAI, falling back to Gemini:", openAIError);
        // Continue to Gemini if OpenAI fails
      }
    }
    
    // Fall back to Gemini if OpenAI is not available or failed
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('No AI API keys are configured (OPENAI_API_KEY or GEMINI_API_KEY)');
    }

    console.log("Analyzing essay with Gemini AI");
    
    // Use Gemini API for enhanced analysis
    const analysisResponse = await analyzeWithGemini(text, geminiApiKey);
    
    // Use Gemini API for plagiarism detection
    const plagiarismResponse = await checkPlagiarism(text, geminiApiKey);
    
    // Combine the results
    const combinedAnalysis = {
      ...analysisResponse,
      plagiarism: plagiarismResponse
    };

    return new Response(
      JSON.stringify({ 
        status: 'success',
        analysis: combinedAnalysis,
        provider: 'gemini'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in analyze-essay function:", error);
    
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function analyzeWithOpenAI(essayText: string, apiKey: string) {
  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
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
            content: `Analyze the following academic essay and provide detailed feedback on structure, style, thesis clarity, and overall effectiveness. Be specific about strengths and areas for improvement.
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
            
            ${essayText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2048
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Error generating content with OpenAI");
  }

  const data = await response.json();
  const generatedText = data.choices[0]?.message?.content || "";
  
  // Clean and parse the response
  const cleanedText = generatedText
    .replace(/```json\s*/g, '')
    .replace(/```\s*$/g, '')
    .replace(/```/g, '')
    .trim();
    
  try {
    const parsedAnalysis = JSON.parse(cleanedText);
    
    // Convert the OpenAI response to our EssayAnalysisResult format
    return {
      score: parsedAnalysis.overallScore || 82,
      structure: {
        score: parsedAnalysis.structure?.score || 80,
        feedback: parsedAnalysis.structure?.feedback || "Your essay demonstrates a clear structure."
      },
      style: {
        score: parsedAnalysis.style?.score || 85,
        feedback: parsedAnalysis.style?.feedback || "Your writing demonstrates an academic tone.",
        suggestions: parsedAnalysis.style?.suggestions || [
          "Consider varying sentence structure for better flow",
          "Use more field-specific terminology",
          "Add more transitional phrases between arguments",
          "Vary paragraph length for better rhythm"
        ]
      },
      thesis: {
        detected: parsedAnalysis.thesis?.detected || true,
        text: parsedAnalysis.thesis?.text || "Thesis statement not clearly identified.",
        score: parsedAnalysis.thesis?.score || 78,
        feedback: parsedAnalysis.thesis?.feedback || "Your thesis could be more specific."
      },
      citations: {
        count: parsedAnalysis.citations?.count || 0,
        format: parsedAnalysis.citations?.format || "Unknown",
        isValid: parsedAnalysis.citations?.isValid || false,
        feedback: parsedAnalysis.citations?.feedback || "Citation analysis not available."
      }
    };
  } catch (parseError) {
    console.error("Error parsing OpenAI analysis response:", parseError);
    throw new Error("Failed to parse OpenAI analysis response");
  }
}

async function checkPlagiarismWithOpenAI(text: string, apiKey: string) {
  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
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
            content: "You are an expert plagiarism detector that analyzes academic text."
          },
          {
            role: "user",
            content: `Analyze the following text for potential plagiarism. Identify any common academic phrases, widely used expressions, or potential verbatim copies that might need citation. Do not falsely flag original content.
                
            Format your response as a plain JSON object with these fields - DO NOT include any markdown formatting, code blocks, or extra text:
            {
              "originalityScore": number from 0-100,
              "matches": [
                {
                  "text": "matched text excerpt",
                  "matchPercentage": percentage of similarity,
                  "source": "general description of where this might be common"
                }
              ]
            }
            
            Here's the text to analyze:
            
            ${text}`
          }
        ],
        temperature: 0.2,
        max_tokens: 2048
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Error generating content with OpenAI");
  }

  const data = await response.json();
  const generatedText = data.choices[0]?.message?.content || "";
  
  // Clean and parse the response
  const cleanedText = generatedText
    .replace(/```json\s*/g, '')
    .replace(/```\s*$/g, '')
    .replace(/```/g, '')
    .trim();
    
  try {
    const parsedResult = JSON.parse(cleanedText);
    
    return {
      score: parsedResult.originalityScore || 95,
      passages: parsedResult.matches || []
    };
  } catch (parseError) {
    console.error("Error parsing OpenAI plagiarism response:", parseError);
    throw new Error("Failed to parse OpenAI plagiarism response");
  }
}

async function analyzeWithGemini(essayText: string, apiKey: string) {
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
                text: `Analyze the following academic essay and provide detailed feedback on structure, style, thesis clarity, and overall effectiveness. Be specific about strengths and areas for improvement.
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
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          topP: 0.95,
          topK: 40,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Error generating content");
  }

  const data = await response.json();
  const generatedText = data.candidates[0]?.content?.parts[0]?.text || "";
  
  // Clean and parse the response
  const cleanedText = generatedText
    .replace(/```json\s*/g, '')
    .replace(/```\s*$/g, '')
    .replace(/```/g, '')
    .trim();
    
  try {
    const parsedAnalysis = JSON.parse(cleanedText);
    
    // Convert the Gemini response to our EssayAnalysisResult format
    return {
      score: parsedAnalysis.overallScore || 82,
      structure: {
        score: parsedAnalysis.structure?.score || 80,
        feedback: parsedAnalysis.structure?.feedback || "Your essay demonstrates a clear structure."
      },
      style: {
        score: parsedAnalysis.style?.score || 85,
        feedback: parsedAnalysis.style?.feedback || "Your writing demonstrates an academic tone.",
        suggestions: parsedAnalysis.style?.suggestions || [
          "Consider varying sentence structure for better flow",
          "Use more field-specific terminology",
          "Add more transitional phrases between arguments",
          "Vary paragraph length for better rhythm"
        ]
      },
      thesis: {
        detected: parsedAnalysis.thesis?.detected || true,
        text: parsedAnalysis.thesis?.text || "Thesis statement not clearly identified.",
        score: parsedAnalysis.thesis?.score || 78,
        feedback: parsedAnalysis.thesis?.feedback || "Your thesis could be more specific."
      },
      citations: {
        count: parsedAnalysis.citations?.count || 0,
        format: parsedAnalysis.citations?.format || "Unknown",
        isValid: parsedAnalysis.citations?.isValid || false,
        feedback: parsedAnalysis.citations?.feedback || "Citation analysis not available."
      }
    };
  } catch (parseError) {
    console.error("Error parsing Gemini analysis response:", parseError);
    throw new Error("Failed to parse Gemini analysis response");
  }
}

async function checkPlagiarism(text: string, apiKey: string) {
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
                text: `Analyze the following text for potential plagiarism. Identify any common academic phrases, widely used expressions, or potential verbatim copies that might need citation. Do not falsely flag original content.
                
                Format your response as a plain JSON object with these fields - DO NOT include any markdown formatting, code blocks, or extra text:
                {
                  "originalityScore": number from 0-100,
                  "matches": [
                    {
                      "text": "matched text excerpt",
                      "matchPercentage": percentage of similarity,
                      "source": "general description of where this might be common"
                    }
                  ]
                }
                
                Here's the text to analyze:
                
                ${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          topP: 0.95,
          topK: 40,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Error generating content");
  }

  const data = await response.json();
  const generatedText = data.candidates[0]?.content?.parts[0]?.text || "";
  
  // Clean and parse the response
  const cleanedText = generatedText
    .replace(/```json\s*/g, '')
    .replace(/```\s*$/g, '')
    .replace(/```/g, '')
    .trim();
    
  try {
    const parsedResult = JSON.parse(cleanedText);
    
    return {
      score: parsedResult.originalityScore || 95,
      passages: parsedResult.matches || []
    };
  } catch (parseError) {
    console.error("Error parsing Gemini plagiarism response:", parseError);
    throw new Error("Failed to parse Gemini plagiarism response");
  }
}
