
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
    const { text, feedbackLevel = "moderate" } = await req.json();

    if (!text || typeof text !== 'string') {
      throw new Error('Valid essay text is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    console.log(`Analyzing essay with Gemini AI using ${feedbackLevel} feedback level`);
    
    // Use Gemini API for enhanced analysis
    const analysisResponse = await analyzeWithGemini(text, geminiApiKey, feedbackLevel);
    
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
        analysis: combinedAnalysis 
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

async function analyzeWithGemini(essayText: string, apiKey: string, feedbackLevel: string = "moderate") {
  // Determine temperature and feedback intensity based on level
  let temperature = 0.3; // default for moderate
  let intensityPrompt = "";
  
  if (feedbackLevel === "strict") {
    temperature = 0.2; // Lower temperature for more precise/critical feedback
    intensityPrompt = "Provide very detailed and critical feedback. Focus on identifying all potential improvements, even minor issues. Be thorough and exacting in your analysis.";
  } else if (feedbackLevel === "lenient") {
    temperature = 0.5; // Higher temperature for more generous feedback
    intensityPrompt = "Provide encouraging and supportive feedback. Focus on major improvements while highlighting strengths. Be gentle and constructive in your criticism.";
  } else {
    // moderate (default)
    intensityPrompt = "Provide balanced feedback with both positive points and areas for improvement. Offer a mix of major and minor suggestions.";
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
                text: `${intensityPrompt}

                Analyze the following academic essay and provide detailed feedback on structure, style, thesis clarity, and overall effectiveness. Be specific about strengths and areas for improvement.
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
          temperature: temperature,
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
    
    // Get the appropriate number of suggestions based on feedback level
    let suggestions = parsedAnalysis.style?.suggestions || [
      "Consider varying sentence structure for better flow",
      "Use more field-specific terminology",
      "Add more transitional phrases between arguments",
      "Vary paragraph length for better rhythm"
    ];
    
    // Adjust number of suggestions based on feedback level
    if (feedbackLevel === "strict" && suggestions.length < 6) {
      // For strict feedback, provide more detailed suggestions
      suggestions = [
        ...suggestions,
        "Strengthen your thesis with more specific claims",
        "Review your conclusion for a stronger synthesis of arguments",
        "Consider addressing opposing viewpoints more explicitly",
        "Improve citation quality with more recent scholarly sources"
      ].slice(0, 8); // Ensure we have up to 8 suggestions for strict
    } else if (feedbackLevel === "lenient" && suggestions.length > 3) {
      // For lenient feedback, focus on fewer, more important suggestions
      suggestions = suggestions.slice(0, 3);
    }
    
    // Convert the Gemini response to our EssayAnalysisResult format
    return {
      score: feedbackLevel === "strict" 
        ? Math.max(60, Math.min(parsedAnalysis.overallScore || 75, 85)) // Stricter scoring
        : feedbackLevel === "lenient"
          ? Math.max(75, Math.min(parsedAnalysis.overallScore || 85, 95)) // More lenient scoring
          : parsedAnalysis.overallScore || 82, // Moderate (default)
      structure: {
        score: parsedAnalysis.structure?.score || 
          (feedbackLevel === "strict" ? 75 : feedbackLevel === "lenient" ? 88 : 80),
        feedback: parsedAnalysis.structure?.feedback || "Your essay demonstrates a clear structure."
      },
      style: {
        score: parsedAnalysis.style?.score || 
          (feedbackLevel === "strict" ? 73 : feedbackLevel === "lenient" ? 90 : 85),
        feedback: parsedAnalysis.style?.feedback || "Your writing demonstrates an academic tone.",
        suggestions: suggestions
      },
      thesis: {
        detected: parsedAnalysis.thesis?.detected || true,
        text: parsedAnalysis.thesis?.text || "Thesis statement not clearly identified.",
        score: parsedAnalysis.thesis?.score || 
          (feedbackLevel === "strict" ? 72 : feedbackLevel === "lenient" ? 86 : 78),
        feedback: parsedAnalysis.thesis?.feedback || "Your thesis could be more specific."
      },
      citations: {
        count: parsedAnalysis.citations?.count || 0,
        format: parsedAnalysis.citations?.format || "Unknown",
        isValid: feedbackLevel === "strict" ? (parsedAnalysis.citations?.isValid || false) : true,
        feedback: parsedAnalysis.citations?.feedback || 
          (feedbackLevel === "strict" 
            ? "Your citations need improvement. Check formatting consistency and add more scholarly sources." 
            : "Citation analysis not available.")
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
