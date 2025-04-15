
/**
 * Enhanced AI Detection Service
 * This service uses multiple methods to detect AI-generated text with higher accuracy
 */

interface AIDetectionResult {
  isAiGenerated: boolean;
  confidence: number;
  markers: string[];
  feedback: string;
}

export class ImprovedAIDetectionService {
  /**
   * Analyze text for AI generation patterns using multiple methods
   * @param text The text to analyze
   * @returns Detection result with confidence score
   */
  static async analyzeText(text: string): Promise<AIDetectionResult> {
    // Run multiple detection algorithms in parallel
    const [styleAnalysis, patternAnalysis, vocabularyAnalysis] = await Promise.all([
      this.analyzeWritingStyle(text),
      this.analyzePatterns(text),
      this.analyzeVocabularyDistribution(text)
    ]);
    
    // Combine results from multiple detection methods with weighted scoring
    const combinedScore = 
      (styleAnalysis.score * 0.3) +
      (patternAnalysis.score * 0.4) +
      (vocabularyAnalysis.score * 0.3);
    
    // Collect markers from all analyses
    const allMarkers = [
      ...styleAnalysis.markers,
      ...patternAnalysis.markers,
      ...vocabularyAnalysis.markers
    ];
    
    // Determine final verdict with confidence threshold
    const isAiGenerated = combinedScore < 65;
    
    // Calculate confidence level based on agreement between methods
    const methodAgreement = this.calculateMethodAgreement(
      styleAnalysis.isLikelyAI,
      patternAnalysis.isLikelyAI,
      vocabularyAnalysis.isLikelyAI
    );
    
    // Generate detailed feedback based on findings
    const feedback = this.generateDetectionFeedback(
      isAiGenerated, 
      combinedScore,
      allMarkers
    );
    
    return {
      isAiGenerated,
      confidence: methodAgreement, 
      markers: allMarkers.slice(0, 5), // Top 5 most significant markers
      feedback
    };
  }
  
  /**
   * Analyze writing style characteristics
   */
  private static async analyzeWritingStyle(text: string) {
    // Signs of human writing include:
    // - Varied sentence structures
    // - Inconsistent paragraph lengths
    // - Personal voice/style markers
    
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const paragraphs = text.split(/\n\s*\n/);
    
    // Calculate sentence length variation (higher in human writing)
    const sentenceLengths = sentences.map(s => s.trim().length);
    const sentenceLengthVariation = this.calculateStandardDeviation(sentenceLengths);
    
    // Calculate paragraph length variation
    const paragraphLengths = paragraphs.map(p => p.length);
    const paragraphLengthVariation = this.calculateStandardDeviation(paragraphLengths);
    
    // Check for overuse of certain transition phrases (common in AI)
    const commonTransitions = [
      "however", "therefore", "furthermore", "in addition", 
      "moreover", "consequently", "as a result"
    ];
    
    const transitionMatches = commonTransitions.map(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, "gi");
      return (text.match(regex) || []).length;
    });
    
    const transitionDensity = transitionMatches.reduce((sum, count) => sum + count, 0) / 
      (text.length / 1000); // per 1000 characters
    
    // Look for personal voice indicators (first person references, opinions)
    const personalVoiceIndicators = [
      /\bI\s+(think|believe|feel|argue|contend)\b/gi,
      /\bin\s+my\s+(opinion|view|experience)\b/gi,
      /\bfrom\s+my\s+perspective\b/gi
    ];
    
    const personalVoiceCount = personalVoiceIndicators.reduce((sum, regex) => 
      sum + (text.match(regex) || []).length, 0);
    
    // Calculate style score - higher means more likely human
    // Weight these factors based on their reliability
    const styleScore = 
      Math.min(sentenceLengthVariation * 5, 40) + // Cap at 40 points
      Math.min(paragraphLengthVariation / 10, 20) + // Cap at 20 points
      Math.max(0, 20 - (transitionDensity * 10)) + // Penalize high transition density
      Math.min(personalVoiceCount * 5, 20); // Cap at 20 points
      
    const normalizedScore = Math.min(Math.max(styleScore, 0), 100);
    
    const markers = [];
    if (sentenceLengthVariation < 15) markers.push("Low sentence length variation");
    if (paragraphLengthVariation < 50) markers.push("Uniform paragraph structure");
    if (transitionDensity > 2) markers.push("Overuse of transition phrases");
    if (personalVoiceCount === 0) markers.push("Absence of personal voice");
    
    return {
      score: normalizedScore,
      isLikelyAI: normalizedScore < 60,
      markers
    };
  }
  
  /**
   * Analyze linguistic patterns that differentiate human from AI writing
   */
  private static async analyzePatterns(text: string) {
    // AI text typically shows:
    // - Higher lexical density (more unique words)
    // - Perfect grammar and punctuation
    // - Lack of regional idioms or colloquialisms
    // - Less language creativity (metaphors, analogies)
    
    // Tokenize and count unique words
    const words = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
    const uniqueWords = new Set(words);
    const lexicalDensity = uniqueWords.size / words.length;
    
    // Count grammar/punctuation perfection indicators
    const grammarPerfection = this.analyzePunctuationConsistency(text);
    
    // Check for creative language elements
    const creativeLanguagePatterns = [
      /like\s+a\s+|as\s+a\s+/, // Similes
      /metaphor|analogy|symbolize/, // Explicit references to figurative language
      /\brepresen(t|ts|ting)\b|\bportra(y|ys|ying)\b|\bembod(y|ies|ying)\b/, // Representational language
      /\bimagine\b|\bpicture\b|\benvision\b/ // Imagination language
    ];
    
    const creativityScore = creativeLanguagePatterns.reduce(
      (sum, pattern) => sum + ((text.match(pattern) || []).length * 5), 0
    );
    
    // Idioms and colloquialisms check (simplified)
    const colloquialPatterns = [
      /\bcut\s+corners\b|\bball\s+park\b|\bbreak\s+a\s+leg\b|\bcut\s+to\s+the\s+chase\b/,
      /\bat\s+the\s+end\s+of\s+the\s+day\b|\bjust\s+saying\b|\bfor\s+what\s+it's\s+worth\b/,
      /\bneedless\s+to\s+say\b|\bthe\s+other\s+day\b|\blong\s+story\s+short\b/
    ];
    
    const colloquialismCount = colloquialPatterns.reduce(
      (sum, pattern) => sum + ((text.match(pattern) || []).length * 10), 0
    );
    
    // Calculate pattern score - higher means more likely human
    const patternScore = 
      Math.max(0, 50 - (lexicalDensity * 100)) + // Penalize high lexical density
      Math.max(0, 20 - (grammarPerfection * 20)) + // Penalize perfect grammar/punctuation
      Math.min(creativityScore, 20) + // Reward creative language
      Math.min(colloquialismCount, 10); // Reward colloquialisms
    
    const normalizedScore = Math.min(Math.max(patternScore, 0), 100);
    
    const markers = [];
    if (lexicalDensity > 0.6) markers.push("Unusually high vocabulary diversity");
    if (grammarPerfection > 0.9) markers.push("Nearly perfect grammar and punctuation");
    if (creativityScore < 5) markers.push("Limited use of creative language");
    if (colloquialismCount === 0) markers.push("No colloquialisms or idioms");
    
    return {
      score: normalizedScore,
      isLikelyAI: normalizedScore < 60,
      markers
    };
  }
  
  /**
   * Analyze vocabulary distribution and sophistication
   */
  private static async analyzeVocabularyDistribution(text: string) {
    // Extract words for analysis
    const words = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
    if (words.length === 0) return { score: 50, isLikelyAI: false, markers: [] };
    
    // Count word frequencies
    const wordFrequency: Record<string, number> = {};
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    // Look for repetition patterns (AI tends to reuse exact phrases)
    const threeGrams = this.generateNgrams(words, 3);
    const fourGrams = this.generateNgrams(words, 4);
    
    // Check for repeated phrases (more common in AI text)
    const repeatedThreeGrams = Object.values(threeGrams).filter(count => count > 1).length;
    const repeatedFourGrams = Object.values(fourGrams).filter(count => count > 1).length;
    
    const repetitionRatio = 
      (repeatedThreeGrams + repeatedFourGrams * 2) / (words.length / 20);
    
    // Analyze typos and spelling variations (human writing has more)
    const typoCount = this.estimateTypoCount(words);
    
    // Check vocabulary consistency (AI tends to be more consistent)
    const vocabularyConsistency = this.analyzeVocabularyConsistency(text);
    
    // Calculate vocabulary score - higher means more likely human
    const vocabularyScore = 
      Math.max(0, 40 - (repetitionRatio * 10)) + // Penalize repetition
      Math.min(typoCount * 5, 30) + // Reward some typos (but not too many)
      Math.max(0, 30 - (vocabularyConsistency * 30)); // Penalize high consistency
    
    const normalizedScore = Math.min(Math.max(vocabularyScore, 0), 100);
    
    const markers = [];
    if (repetitionRatio > 2) markers.push("Unusual phrase repetition");
    if (typoCount === 0) markers.push("No spelling variations or typos");
    if (vocabularyConsistency > 0.8) markers.push("Unusually consistent vocabulary sophistication");
    
    return {
      score: normalizedScore,
      isLikelyAI: normalizedScore < 60,
      markers
    };
  }
  
  /**
   * Generate n-grams from word array
   */
  private static generateNgrams(words: string[], n: number): Record<string, number> {
    const ngrams: Record<string, number> = {};
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(" ");
      ngrams[ngram] = (ngrams[ngram] || 0) + 1;
    }
    return ngrams;
  }
  
  /**
   * Estimate typo count based on common dictionary words
   * This is a simplified version - a real implementation would use a dictionary
   */
  private static estimateTypoCount(words: string[]): number {
    // Common typos and spelling variations
    const commonMisspellings = [
      "teh", "alot", "seperate", "recieve", "wierd", "accomodate", 
      "wich", "truely", "beleive", "occured", "definately", "untill",
      "accross", "neccessary", "similiar", "enviroment", "existance"
    ];
    
    let typoCount = 0;
    
    // Count words that look like common typos
    words.forEach(word => {
      if (commonMisspellings.includes(word)) {
        typoCount++;
      }
    });
    
    // Simplified algorithm to detect other likely typos:
    // Look for words with unusual letter combinations
    words.forEach(word => {
      if (word.length > 4) {
        if (word.includes("xz") || word.includes("qp") || 
            word.includes("vf") || word.includes("jx")) {
          typoCount++;
        }
      }
    });
    
    return typoCount;
  }
  
  /**
   * Analyze punctuation consistency
   * Returns a score 0-1, where 1 is perfectly consistent
   */
  private static analyzePunctuationConsistency(text: string): number {
    // Count terminal punctuation consistency
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length < 3) return 0.5;
    
    const endPunctuation = sentences.map(s => s.trim().slice(-1));
    const periodCount = endPunctuation.filter(p => p === '.').length;
    const exclamationCount = endPunctuation.filter(p => p === '!').length;
    const questionCount = endPunctuation.filter(p => p === '?').length;
    
    // Calculate consistency as how dominant the most common punctuation is
    const mostCommonCount = Math.max(periodCount, exclamationCount, questionCount);
    const punctuationConsistency = mostCommonCount / sentences.length;
    
    // Check comma usage consistency
    const sentencesWithCommas = sentences.filter(s => s.includes(',')).length;
    const commaConsistency = Math.abs(0.5 - (sentencesWithCommas / sentences.length)) * 2;
    
    return (punctuationConsistency * 0.6) + (commaConsistency * 0.4);
  }
  
  /**
   * Analyze vocabulary consistency throughout the text
   * Returns a score 0-1, where 1 is perfectly consistent
   */
  private static analyzeVocabularyConsistency(text: string): number {
    // Split text into sections
    const paragraphs = text.split(/\n\s*\n/);
    if (paragraphs.length < 2) return 0.5;
    
    // Common function words to exclude
    const functionWords = new Set([
      "the", "a", "an", "and", "or", "but", "if", "while", "because",
      "to", "of", "in", "on", "at", "with", "from", "for", "by", "about"
    ]);
    
    // Analyze each paragraph's vocabulary sophistication
    const sophisticationScores = paragraphs.map(paragraph => {
      const words = paragraph.toLowerCase().match(/\b[a-z']+\b/g) || [];
      const contentWords = words.filter(word => !functionWords.has(word) && word.length > 3);
      
      // Calculate average word length of content words
      const avgWordLength = contentWords.reduce((sum, word) => sum + word.length, 0) / 
        (contentWords.length || 1);
      
      // Count words with 3+ syllables
      const complexWordCount = contentWords.filter(word => this.estimateSyllables(word) >= 3).length;
      const complexWordRatio = complexWordCount / (contentWords.length || 1);
      
      // Combined sophistication score
      return (avgWordLength / 10) + (complexWordRatio * 2);
    });
    
    // Calculate the standard deviation as a measure of consistency
    const stdDev = this.calculateStandardDeviation(sophisticationScores);
    
    // Convert to a 0-1 scale where 1 means perfectly consistent
    // A standard deviation of 0.5 or higher is considered highly inconsistent
    return Math.max(0, 1 - (stdDev * 2));
  }
  
  /**
   * Simple syllable estimation function
   */
  private static estimateSyllables(word: string): number {
    // Very simplified syllable counting
    const vowels = "aeiouy";
    let count = 0;
    let prevIsVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !prevIsVowel) {
        count++;
      }
      prevIsVowel = isVowel;
    }
    
    // Handle silent e at end
    if (word.length > 2 && word.endsWith('e') && !vowels.includes(word[word.length - 2])) {
      count--;
    }
    
    return Math.max(count, 1);
  }
  
  /**
   * Calculate standard deviation of an array of numbers
   */
  private static calculateStandardDeviation(values: number[]): number {
    if (values.length <= 1) return 0;
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(value => (value - avg) * (value - avg));
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
    
    return Math.sqrt(avgSquareDiff);
  }
  
  /**
   * Calculate agreement between detection methods
   */
  private static calculateMethodAgreement(...methods: boolean[]): number {
    const trueCount = methods.filter(m => m).length;
    const falseCount = methods.filter(m => !m).length;
    
    // Perfect agreement = 100% confidence
    if (trueCount === methods.length || falseCount === methods.length) {
      return 95;
    }
    
    // Strong majority = high confidence  
    if (trueCount >= methods.length * 0.75 || falseCount >= methods.length * 0.75) {
      return 85;
    }
    
    // Simple majority = moderate confidence
    if (trueCount > falseCount || falseCount > trueCount) {
      return 70;
    }
    
    // Split decision = low confidence
    return 50;
  }
  
  /**
   * Generate human-readable feedback based on detection results
   */
  private static generateDetectionFeedback(
    isAiGenerated: boolean, 
    score: number,
    markers: string[]
  ): string {
    if (isAiGenerated) {
      if (score < 40) {
        return `This text shows strong indicators of AI generation (${markers.slice(0, 3).join(", ")}). Consider adding more personal voice and stylistic variation to make it feel more authentic.`;
      } else {
        return `This text contains some patterns commonly found in AI-generated content (${markers.slice(0, 2).join(", ")}). Try incorporating more personal examples and variable sentence structures to improve authenticity.`;
      }
    } else {
      if (score > 80) {
        return "This text appears to be human-written with high confidence. It contains natural language patterns, appropriate variation in structure, and authentic voice.";
      } else {
        return "This text most likely contains human-written content, though some sections show patterns occasionally present in AI writing. Overall, it demonstrates sufficient natural language characteristics.";
      }
    }
  }
}
