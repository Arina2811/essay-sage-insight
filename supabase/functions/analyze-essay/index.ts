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
        // Use OpenAI API for enhanced analysis with improved prompts
        const analysisResponse = await analyzeWithOpenAI(text, openAIKey);
        
        // Use OpenAI API for improved plagiarism detection
        const plagiarismResponse = await checkPlagiarismWithOpenAI(text, openAIKey);
        
        // Run enhanced AI detection and vocabulary analysis
        const aiDetectionResponse = await analyzeAIDetectionWithOpenAI(text, openAIKey);
        const vocabularyResponse = await analyzeVocabularyWithOpenAI(text, openAIKey);
        
        // Combine the results for a comprehensive analysis
        const combinedAnalysis = {
          ...analysisResponse,
          plagiarism: plagiarismResponse,
          aiDetection: aiDetectionResponse,
          vocabulary: vocabularyResponse
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
    
    // Use Gemini API for enhanced analysis with improved prompts
    const analysisResponse = await analyzeWithGemini(text, geminiApiKey);
    
    // Use Gemini API for plagiarism detection
    const plagiarismResponse = await checkPlagiarism(text, geminiApiKey);
    
    // Run enhanced AI detection and vocabulary analysis with Gemini
    const aiDetectionResponse = await analyzeAIDetectionWithGemini(text, geminiApiKey);
    const vocabularyResponse = await analyzeVocabularyWithGemini(text, geminiApiKey);
    
    // Combine the results
    const combinedAnalysis = {
      ...analysisResponse,
      plagiarism: plagiarismResponse,
      aiDetection: aiDetectionResponse,
      vocabulary: vocabularyResponse
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
            content: `Analyze the following academic essay and provide detailed feedback on structure, style, thesis clarity, creativity, and overall effectiveness. Also include advanced analysis on readability, AI detection probability, vocabulary assessment, target audience, and sentiment analysis.
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
      },
      creativity: {
        score: parsedAnalysis.creativity?.score || 75,
        feedback: parsedAnalysis.creativity?.feedback || "Your essay shows some creative thinking, with a few original insights.",
        highlights: parsedAnalysis.creativity?.highlights || [
          "Interesting perspective on the main topic",
          "Novel approach to a common issue"
        ],
        suggestions: parsedAnalysis.creativity?.suggestions || [
          "Consider exploring more unconventional connections",
          "Try developing your own framework for analysis",
          "Incorporate more unique examples"
        ]
      },
      readability: {
        score: parsedAnalysis.readability?.score || 78,
        gradeLevel: parsedAnalysis.readability?.gradeLevel || "College",
        feedback: parsedAnalysis.readability?.feedback || "Your essay is appropriate for college-level readers.",
        suggestions: parsedAnalysis.readability?.suggestions || [
          "Break longer sentences into shorter ones in paragraphs 2 and 5",
          "Consider using simpler terms for technical concepts",
          "Add more transition words between paragraphs"
        ]
      },
      aiDetection: {
        score: parsedAnalysis.aiDetection?.score || 95,
        isAiGenerated: parsedAnalysis.aiDetection?.isAiGenerated || false,
        confidence: parsedAnalysis.aiDetection?.confidence || 90,
        feedback: parsedAnalysis.aiDetection?.feedback || "This essay appears to be human-written."
      },
      vocabulary: {
        score: parsedAnalysis.vocabulary?.score || 80,
        feedback: parsedAnalysis.vocabulary?.feedback || "You use appropriate academic vocabulary with room for enhancement.",
        advanced: parsedAnalysis.vocabulary?.advanced || [
          "paradigm",
          "methodology",
          "intrinsic"
        ],
        suggestions: parsedAnalysis.vocabulary?.suggestions || [
          "Consider replacing 'big' with 'substantial' or 'significant'",
          "Use 'analyze' instead of 'look at' in paragraph 4",
          "Try 'conceptualize' instead of 'think about' for a more academic tone"
        ]
      },
      targetAudience: {
        suitable: parsedAnalysis.targetAudience?.suitable || ["college students", "academics", "subject matter experts"],
        unsuitable: parsedAnalysis.targetAudience?.unsuitable || ["general public", "young readers"],
        feedback: parsedAnalysis.targetAudience?.feedback || "This essay is most appropriate for an academic audience with subject knowledge."
      },
      sentiment: {
        overall: parsedAnalysis.sentiment?.overall || "neutral",
        score: parsedAnalysis.sentiment?.score || 55,
        feedback: parsedAnalysis.sentiment?.feedback || "Your essay maintains a primarily neutral academic tone, which is appropriate for analytical writing.",
        highlights: parsedAnalysis.sentiment?.highlights || {
          positive: ["thoughtful analysis in paragraph 2", "balanced perspective throughout"],
          negative: ["potentially dismissive tone in paragraph 4", "overly critical assessment of opposing views"]
        }
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

/**
 * Enhanced AI detection analysis using OpenAI
 */
async function analyzeAIDetectionWithOpenAI(text: string, apiKey: string) {
  console.log("Running enhanced AI detection analysis with OpenAI");
  
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
            content: "You are an AI detection expert with advanced capabilities in linguistic analysis and pattern recognition. Your task is to determine whether the provided text was written by a human or generated by an AI system like ChatGPT, Gemini, or similar LLMs."
          },
          {
            role: "user",
            content: `Analyze this text for signs of AI generation. Look for the following patterns:
            1. Stylistic consistency vs. natural variation in human writing
            2. Sentence structure patterns and diversity
            3. Lexical diversity and vocabulary distribution
            4. Presence of personal anecdotes or unique perspectives
            5. Subtle grammatical irregularities common in human writing
            6. Presence of typos or spelling variations (more common in human text)
            7. Contextual understanding and topical coherence
            8. Creative language use and metaphors
            9. Use of idioms and colloquial expressions
            10. Emotional tone and authenticity markers
            
            Return your analysis as a JSON object with these fields:
            {
              "isAiGenerated": boolean (true if AI-generated, false if likely human),
              "confidence": number from 0-100 representing confidence in your assessment,
              "markers": [array of specific textual patterns or indicators that influenced your decision],
              "feedback": "detailed explanation of your assessment with specific examples from the text"
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
    throw new Error(errorData.error?.message || "Error with OpenAI AI detection analysis");
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
      score: parsedResult.isAiGenerated ? 40 : 85,
      isAiGenerated: parsedResult.isAiGenerated,
      confidence: parsedResult.confidence,
      feedback: parsedResult.feedback,
      markers: parsedResult.markers
    };
  } catch (parseError) {
    console.error("Error parsing OpenAI AI detection response:", parseError);
    throw new Error("Failed to parse OpenAI AI detection response");
  }
}

/**
 * Enhanced vocabulary analysis using OpenAI
 */
async function analyzeVocabularyWithOpenAI(text: string, apiKey: string) {
  console.log("Running enhanced vocabulary analysis with OpenAI");
  
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
            content: "You are an expert in vocabulary analysis, linguistic patterns, and academic writing. Your task is to provide a detailed assessment of vocabulary usage in a text, including identifying academic terms, potential typos, and vocabulary improvement suggestions."
          },
          {
            role: "user",
            content: `Perform a comprehensive vocabulary analysis on the following text. Focus on:
            1. Overall vocabulary quality, sophistication, and variety
            2. Academic level assessment (basic, intermediate, advanced, expert)
            3. Advanced or specialized terms used
            4. Potential spelling errors or typos
            5. Areas for vocabulary improvement
            6. Word choice strengths
            7. Transition word usage and variety
            
            Return your analysis as a JSON object with these fields:
            {
              "score": number from 0-100 representing vocabulary quality,
              "feedback": "overall assessment of vocabulary usage",
              "advanced": ["array of advanced or specialized terms used"],
              "suggestions": ["specific vocabulary improvement suggestions"],
              "uniqueness": number from 0-100 representing lexical diversity,
              "academicLevel": "basic", "intermediate", "advanced", or "expert",
              "improvementAreas": ["specific areas needing vocabulary improvement"],
              "strengths": ["specific vocabulary strengths"],
              "typos": [
                {
                  "word": "misspelled word",
                  "suggestions": ["correction suggestions"],
                  "context": "surrounding text for context"
                }
              ]
            }
            
            Here's the text to analyze:
            
            ${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2048
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Error with OpenAI vocabulary analysis");
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
    return parsedResult;
  } catch (parseError) {
    console.error("Error parsing OpenAI vocabulary analysis response:", parseError);
    throw new Error("Failed to parse OpenAI vocabulary analysis response");
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
                text: `Analyze the following academic essay and provide detailed feedback on structure, style, thesis clarity, creativity, and overall effectiveness. Also include advanced analysis on readability, AI detection probability, vocabulary assessment, target audience, and sentiment analysis.
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
    
    // Convert the Gemini response to our EssayAnalysisResult format with new features
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
      },
      creativity: {
        score: parsedAnalysis.creativity?.score || 75,
        feedback: parsedAnalysis.creativity?.feedback || "Your essay shows some creative thinking, with a few original insights.",
        highlights: parsedAnalysis.creativity?.highlights || [
          "Interesting perspective on the main topic",
          "Novel approach to a common issue"
        ],
        suggestions: parsedAnalysis.creativity?.suggestions || [
          "Consider exploring more unconventional connections",
          "Try developing your own framework for analysis",
          "Incorporate more unique examples"
        ]
      },
      readability: {
        score: parsedAnalysis.readability?.score || 78,
        gradeLevel: parsedAnalysis.readability?.gradeLevel || "College",
        feedback: parsedAnalysis.readability?.feedback || "Your essay is appropriate for college-level readers.",
        suggestions: parsedAnalysis.readability?.suggestions || [
          "Break longer sentences into shorter ones in paragraphs 2 and 5",
          "Consider using simpler terms for technical concepts",
          "Add more transition words between paragraphs"
        ]
      },
      aiDetection: {
        score: parsedAnalysis.aiDetection?.score || 95,
        isAiGenerated: parsedAnalysis.aiDetection?.isAiGenerated || false,
        confidence: parsedAnalysis.aiDetection?.confidence || 90,
        feedback: parsedAnalysis.aiDetection?.feedback || "This essay appears to be human-written."
      },
      vocabulary: {
        score: parsedAnalysis.vocabulary?.score || 80,
        feedback: parsedAnalysis.vocabulary?.feedback || "You use appropriate academic vocabulary with room for enhancement.",
        advanced: parsedAnalysis.vocabulary?.advanced || [
          "paradigm",
          "methodology",
          "intrinsic"
        ],
        suggestions: parsedAnalysis.vocabulary?.suggestions || [
          "Consider replacing 'big' with 'substantial' or 'significant'",
          "Use 'analyze' instead of 'look at' in paragraph 4",
          "Try 'conceptualize' instead of 'think about' for a more academic tone"
        ]
      },
      targetAudience: {
        suitable: parsedAnalysis.targetAudience?.suitable || ["college students", "academics", "subject matter experts"],
        unsuitable: parsedAnalysis.targetAudience?.unsuitable || ["general public", "young readers"],
        feedback: parsedAnalysis.targetAudience?.feedback || "This essay is most appropriate for an academic audience with subject knowledge."
      },
      sentiment: {
        overall: parsedAnalysis.sentiment?.overall || "neutral",
        score: parsedAnalysis.sentiment?.score || 55,
        feedback: parsedAnalysis.sentiment?.feedback || "Your essay maintains a primarily neutral academic tone, which is appropriate for analytical writing.",
        highlights: parsedAnalysis.sentiment?.highlights || {
          positive: ["thoughtful analysis in paragraph 2", "balanced perspective throughout"],
          negative: ["potentially dismissive tone in paragraph 4", "overly critical assessment of opposing views"]
        }
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

/**
 * Enhanced AI detection analysis using Gemini
 */
async function analyzeAIDetectionWithGemini(text: string, apiKey: string) {
  console.log("Running enhanced AI detection analysis with Gemini");
  
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
                text: `You're an AI detection expert with advanced capabilities in linguistic analysis and pattern recognition. Analyze this text for signs of AI generation by examining:

                1. Stylistic consistency vs. natural variation in human writing
                2. Sentence structure patterns and diversity
                3. Lexical diversity and vocabulary distribution
                4. Presence of personal anecdotes or unique perspectives
                5. Subtle grammatical irregularities common in human writing
                6. Presence of typos or spelling variations (more common in human text)
                7. Contextual understanding and topical coherence
                8. Creative language use and metaphors
                9. Use of idioms and colloquial expressions
                10. Emotional tone and authenticity markers
                
                Return your analysis as a JSON object with these fields:
                {
                  "isAiGenerated": boolean (true if AI-generated, false if likely human),
                  "confidence": number from 0-100 representing confidence in your assessment,
                  "markers": [array of specific textual patterns or indicators that influenced your decision],
                  "feedback": "detailed explanation of your assessment with specific examples from the text"
                }
                
                Here's the text to analyze:
                
                ${text}`
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          topP: 0.8,
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
      score: parsedResult.isAiGenerated ? 40 : 85,
      isAiGenerated: parsedResult.isAiGenerated,
      confidence: parsedResult.confidence,
      feedback: parsedResult.feedback,
      markers: parsedResult.markers
    };
  } catch (parseError) {
    console.error("Error parsing Gemini AI detection response:", parseError);
    throw new Error("Failed to parse Gemini AI detection response");
  }
}

/**
 * Enhanced vocabulary analysis using Gemini
 */
async function analyzeVocabularyWithGemini(text: string, apiKey: string) {
  console.log("Running enhanced vocabulary analysis with Gemini");
  
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
                text: `As an expert in vocabulary analysis, linguistic patterns, and academic writing, perform a comprehensive vocabulary analysis on the following text. Focus on:
                1. Overall vocabulary quality, sophistication, and variety
                2. Academic level assessment (basic, intermediate, advanced, expert)
                3. Advanced or specialized terms used
                4. Potential spelling errors or typos
                5. Areas for vocabulary improvement
                6. Word choice strengths
                7. Transition word usage and variety
                
                Return your analysis as a JSON object with these fields:
                {
                  "score": number from 0-100 representing vocabulary quality,
                  "feedback": "overall assessment of vocabulary usage",
                  "advanced": ["array of advanced or specialized terms used"],
                  "suggestions": ["specific vocabulary improvement suggestions"],
                  "uniqueness": number from 0-100 representing lexical diversity,
                  "academicLevel": "basic", "intermediate", "advanced", or "expert",
                  "improvementAreas": ["specific areas needing vocabulary improvement"],
                  "strengths": ["specific vocabulary strengths"],
                  "typos": [
                    {
                      "word": "misspelled word",
                      "suggestions": ["correction suggestions"],
                      "context": "surrounding text for context"
                    }
                  ]
                }
                
                Here's the text to analyze:
                
                ${text}`
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          topP: 0.9,
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
    return parsedResult;
  } catch (parseError) {
    console.error("Error parsing Gemini vocabulary analysis response:", parseError);
    throw new Error("Failed to parse Gemini vocabulary analysis response");
  }
}
