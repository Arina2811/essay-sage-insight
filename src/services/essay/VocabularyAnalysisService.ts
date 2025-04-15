
/**
 * Enhanced Vocabulary Analysis Service
 * Provides in-depth analysis of vocabulary usage and typos
 */

export interface VocabularyAnalysisResult {
  score: number;
  feedback: string;
  advanced: string[];
  suggestions: string[];
  uniqueness: number;
  academicLevel: "basic" | "intermediate" | "advanced" | "expert";
  improvementAreas: string[];
  strengths: string[];
  typos: Array<{
    word: string;
    suggestions: string[];
    context: string;
  }>;
}

export class VocabularyAnalysisService {
  // Common academic verbs for substitution suggestions
  private static academicVerbs = [
    { basic: "show", advanced: ["demonstrate", "illustrate", "exhibit", "reveal", "indicate"] },
    { basic: "say", advanced: ["assert", "contend", "posit", "articulate", "convey"] },
    { basic: "think", advanced: ["hypothesize", "theorize", "postulate", "surmise", "contemplate"] },
    { basic: "look at", advanced: ["examine", "analyze", "investigate", "scrutinize", "evaluate"] },
    { basic: "use", advanced: ["utilize", "employ", "implement", "apply", "leverage"] },
    { basic: "get", advanced: ["obtain", "acquire", "procure", "attain", "derive"] },
    { basic: "change", advanced: ["modify", "transform", "alter", "adjust", "adapt"] },
    { basic: "make", advanced: ["produce", "generate", "construct", "formulate", "develop"] }
  ];
  
  // Common vague academic nouns with more precise alternatives
  private static academicNouns = [
    { basic: "thing", advanced: ["element", "component", "phenomenon", "aspect", "factor"] },
    { basic: "area", advanced: ["domain", "field", "sphere", "realm", "discipline"] },
    { basic: "idea", advanced: ["concept", "notion", "hypothesis", "proposition", "theory"] },
    { basic: "amount", advanced: ["proportion", "quantity", "magnitude", "extent", "degree"] },
    { basic: "issue", advanced: ["challenge", "dilemma", "problem", "predicament", "quandary"] },
    { basic: "point", advanced: ["argument", "assertion", "contention", "premise", "thesis"] }
  ];
  
  // List of common academic transition phrases for variety
  private static transitionPhrases = [
    { type: "addition", phrases: ["additionally", "furthermore", "moreover", "in addition", "also", "besides"] },
    { type: "contrast", phrases: ["however", "nevertheless", "nonetheless", "conversely", "in contrast", "on the other hand"] },
    { type: "cause", phrases: ["therefore", "thus", "consequently", "as a result", "hence", "for this reason"] },
    { type: "example", phrases: ["for example", "for instance", "specifically", "to illustrate", "as an illustration", "namely"] },
    { type: "emphasis", phrases: ["indeed", "notably", "particularly", "especially", "significantly", "markedly"] }
  ];
  
  /**
   * Perform comprehensive vocabulary analysis on text
   */
  static analyzeVocabulary(text: string): VocabularyAnalysisResult {
    // Extract all words for analysis
    const words = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
    if (words.length === 0) {
      return this.getEmptyResult();
    }
    
    // Find unique words and calculate lexical density
    const uniqueWords = new Set(words);
    const lexicalDensity = uniqueWords.size / words.length;
    
    // Analyze vocabulary sophistication
    const sophisticationResult = this.analyzeVocabularySophistication(words);
    
    // Detect potential typos and suggest corrections
    const typosResult = this.detectTypos(text);
    
    // Analyze transition usage and variety
    const transitionsResult = this.analyzeTransitions(text);
    
    // Find overused words
    const wordFrequency: Record<string, number> = {};
    words.forEach(word => {
      if (word.length > 3) { // Skip short function words
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
    
    // Sort by frequency
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .filter(([word]) => !this.isCommonFunctionWord(word));
    
    // Find overused words (used more than 0.5% of total words and at least 3 times)
    const overusedThreshold = Math.max(3, words.length * 0.005);
    const overusedWords = sortedWords
      .filter(([_, count]) => count >= overusedThreshold)
      .map(([word]) => word);
    
    // Find advanced vocabulary used in the text
    const advancedWords = sophisticationResult.advancedWords.slice(0, 10);
    
    // Generate vocabulary improvement suggestions
    const suggestions = this.generateVocabularyImprovementSuggestions(
      text, 
      overusedWords,
      sophisticationResult.academicLevel,
      transitionsResult
    );
    
    // Calculate overall vocabulary score
    const score = this.calculateVocabularyScore(
      lexicalDensity,
      sophisticationResult.sophisticationScore,
      typosResult.length > 0 ? 0 : 10, // Small penalty for typos
      transitionsResult.variety
    );
    
    // Generate feedback based on the analysis
    const feedback = this.generateVocabularyFeedback(
      score,
      sophisticationResult.academicLevel,
      lexicalDensity,
      overusedWords,
      typosResult
    );
    
    // Identify strengths and improvement areas
    const strengths = this.identifyVocabularyStrengths(
      lexicalDensity,
      sophisticationResult,
      transitionsResult
    );
    
    const improvementAreas = this.identifyImprovementAreas(
      overusedWords,
      sophisticationResult,
      typosResult,
      transitionsResult
    );
    
    return {
      score,
      feedback,
      advanced: advancedWords,
      suggestions,
      uniqueness: lexicalDensity * 100,
      academicLevel: sophisticationResult.academicLevel,
      improvementAreas,
      strengths,
      typos: typosResult
    };
  }
  
  /**
   * Analyze vocabulary sophistication level
   */
  private static analyzeVocabularySophistication(words: string[]) {
    // Common function words to exclude from analysis
    const functionWords = new Set([
      "the", "a", "an", "and", "or", "but", "if", "while", "because",
      "to", "of", "in", "on", "at", "with", "from", "for", "by", "about"
    ]);
    
    // Filter to content words only
    const contentWords = words.filter(word => !functionWords.has(word) && word.length > 3);
    
    // Calculate average word length
    const avgWordLength = contentWords.reduce((sum, word) => sum + word.length, 0) / 
      (contentWords.length || 1);
    
    // Count words with estimated 3+ syllables
    const complexWords = contentWords.filter(word => this.estimateSyllables(word) >= 3);
    const complexWordRatio = complexWords.length / (contentWords.length || 1);
    
    // Get academic/sophisticated words
    const advancedWords = contentWords.filter(word => 
      word.length >= 8 || 
      this.estimateSyllables(word) >= 4 ||
      this.isAcademicTerm(word)
    );
    
    const advancedWordsRatio = advancedWords.length / (contentWords.length || 1);
    
    // Calculate sophistication score (0-100)
    const sophisticationScore = 
      (avgWordLength * 6) + 
      (complexWordRatio * 40) + 
      (advancedWordsRatio * 40);
    
    // Determine academic level based on sophistication score
    let academicLevel: "basic" | "intermediate" | "advanced" | "expert";
    
    if (sophisticationScore < 45) {
      academicLevel = "basic";
    } else if (sophisticationScore < 60) {
      academicLevel = "intermediate";
    } else if (sophisticationScore < 75) {
      academicLevel = "advanced";
    } else {
      academicLevel = "expert";
    }
    
    return {
      sophisticationScore: Math.min(sophisticationScore, 100),
      academicLevel,
      complexWordRatio,
      advancedWords: [...new Set(advancedWords)], // Unique advanced words
      advancedWordsRatio
    };
  }
  
  /**
   * Check if a word is likely an academic term
   * In a real implementation this would use a dictionary of academic terms
   */
  private static isAcademicTerm(word: string): boolean {
    const academicTerms = [
      "analysis", "theoretical", "framework", "methodology", "hypothesis",
      "paradigm", "empirical", "qualitative", "quantitative", "discourse",
      "contextualize", "pedagogical", "implementation", "comprehensive", "synthesis",
      "epistemological", "ontological", "conceptualize", "interdisciplinary", "correlation",
      "juxtaposition", "substantiate", "phenomenon", "implications", "fundamentally"
    ];
    
    return academicTerms.includes(word) || 
      word.endsWith("ology") || 
      word.endsWith("ism") ||
      word.endsWith("ization") ||
      word.endsWith("istic");
  }
  
  /**
   * Detect potential typos in text
   * This is a simplified implementation - a real version would use a proper spell checker
   */
  private static detectTypos(text: string): Array<{word: string, suggestions: string[], context: string}> {
    // Common misspellings and their corrections
    const commonTypos: Record<string, string[]> = {
      "teh": ["the"],
      "alot": ["a lot", "allot"],
      "recieve": ["receive"],
      "seperate": ["separate"],
      "wierd": ["weird"],
      "thier": ["their", "there"],
      "accomodate": ["accommodate"],
      "occured": ["occurred"],
      "definately": ["definitely"],
      "wich": ["which"],
      "refering": ["referring"],
      "beleive": ["believe"],
      "concious": ["conscious"],
      "neccessary": ["necessary"],
      "occassion": ["occasion"],
      "arguement": ["argument"],
      "truely": ["truly"],
      "existance": ["existence"],
      "untill": ["until"],
      "priviledge": ["privilege"],
      "similiar": ["similar"]
    };
    
    const typos: Array<{word: string, suggestions: string[], context: string}> = [];
    
    // Extract words with surrounding context
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    sentences.forEach(sentence => {
      const words = sentence.match(/\b[a-zA-Z']+\b/g) || [];
      
      words.forEach(originalWord => {
        const word = originalWord.toLowerCase();
        
        // Check if it's a known typo
        if (commonTypos[word]) {
          // Get some context around the word
          const wordIndex = sentence.toLowerCase().indexOf(word);
          const start = Math.max(0, wordIndex - 20);
          const end = Math.min(sentence.length, wordIndex + word.length + 20);
          const context = sentence.substring(start, end);
          
          typos.push({
            word: originalWord,
            suggestions: commonTypos[word],
            context
          });
        }
      });
    });
    
    return typos;
  }
  
  /**
   * Analyze transition usage in text
   */
  private static analyzeTransitions(text: string) {
    const lowerText = text.toLowerCase();
    let totalTransitions = 0;
    const transitionCounts: Record<string, number> = {};
    const transitionsByType: Record<string, number> = {};
    
    // Count transition usage by type and phrase
    this.transitionPhrases.forEach(group => {
      let typeCount = 0;
      
      group.phrases.forEach(phrase => {
        const regex = new RegExp(`\\b${phrase}\\b`, "gi");
        const matches = (lowerText.match(regex) || []).length;
        
        if (matches > 0) {
          transitionCounts[phrase] = matches;
          typeCount += matches;
          totalTransitions += matches;
        }
      });
      
      if (typeCount > 0) {
        transitionsByType[group.type] = typeCount;
      }
    });
    
    // Calculate transition variety (0-1 scale)
    const variety = Object.keys(transitionCounts).length / 
      (this.transitionPhrases.reduce((sum, group) => sum + group.phrases.length, 0) * 0.3);
    
    // Calculate transition density (per 1000 words)
    const wordCount = (lowerText.match(/\b[a-z']+\b/g) || []).length;
    const transitionDensity = totalTransitions / (wordCount / 1000);
    
    // Identify most used transition type
    let dominantType = "";
    let maxTypeCount = 0;
    
    Object.entries(transitionsByType).forEach(([type, count]) => {
      if (count > maxTypeCount) {
        dominantType = type;
        maxTypeCount = count;
      }
    });
    
    // Identify overused transitions (used 3+ times)
    const overusedTransitions = Object.entries(transitionCounts)
      .filter(([_, count]) => count >= 3)
      .map(([phrase]) => phrase);
    
    // Identify missing transition types
    const missingTypes = this.transitionPhrases
      .filter(group => !transitionsByType[group.type])
      .map(group => group.type);
    
    return {
      totalCount: totalTransitions,
      variety: Math.min(variety, 1),
      density: transitionDensity,
      dominantType,
      overusedTransitions,
      missingTypes,
      transitionsByType
    };
  }
  
  /**
   * Generate vocabulary improvement suggestions
   */
  private static generateVocabularyImprovementSuggestions(
    text: string,
    overusedWords: string[],
    academicLevel: "basic" | "intermediate" | "advanced" | "expert",
    transitionsResult: any
  ): string[] {
    const suggestions: string[] = [];
    
    // Suggest alternatives for overused words
    if (overusedWords.length > 0) {
      overusedWords.slice(0, 3).forEach(word => {
        const alternatives = this.findAlternatives(word);
        if (alternatives.length > 0) {
          suggestions.push(`Consider replacing "${word}" with alternatives like ${alternatives.slice(0, 3).join(', ')}`);
        }
      });
    }
    
    // Suggest using more advanced terminology for basic/intermediate writing
    if (academicLevel === "basic" || academicLevel === "intermediate") {
      this.academicVerbs.slice(0, 3).forEach(pair => {
        if (text.toLowerCase().includes(pair.basic)) {
          suggestions.push(`Replace "${pair.basic}" with more academic alternatives like ${pair.advanced.slice(0, 3).join(', ')}`);
        }
      });
      
      this.academicNouns.slice(0, 3).forEach(pair => {
        if (text.toLowerCase().includes(pair.basic)) {
          suggestions.push(`Replace the general term "${pair.basic}" with more precise alternatives like ${pair.advanced.slice(0, 3).join(', ')}`);
        }
      });
    }
    
    // Suggest transition variety if needed
    if (transitionsResult.overusedTransitions.length > 0) {
      const overused = transitionsResult.overusedTransitions[0];
      let alternativeType = "";
      
      // Find which type the overused transition belongs to
      for (const group of this.transitionPhrases) {
        if (group.phrases.includes(overused)) {
          alternativeType = group.type;
          break;
        }
      }
      
      if (alternativeType) {
        // Find alternatives of the same type
        const alternatives = this.transitionPhrases
          .find(g => g.type === alternativeType)?.phrases
          .filter(p => p !== overused) || [];
          
        if (alternatives.length > 0) {
          suggestions.push(`For variety, replace some instances of "${overused}" with ${alternatives.slice(0, 3).join(', ')}`);
        }
      }
    }
    
    // Suggest adding missing transition types
    if (transitionsResult.missingTypes.length > 0) {
      const missingType = transitionsResult.missingTypes[0];
      const examples = this.transitionPhrases
        .find(g => g.type === missingType)?.phrases.slice(0, 3) || [];
        
      if (examples.length > 0) {
        suggestions.push(`Add ${missingType} transitions like ${examples.join(', ')} to improve flow`);
      }
    }
    
    return suggestions;
  }
  
  /**
   * Calculate overall vocabulary score
   */
  private static calculateVocabularyScore(
    lexicalDensity: number,
    sophisticationScore: number,
    typoScore: number,
    transitionVariety: number
  ): number {
    // Weight different aspects of vocabulary
    return Math.round(
      (lexicalDensity * 100 * 0.2) +
      (sophisticationScore * 0.5) +
      (typoScore * 0.1) +
      (transitionVariety * 100 * 0.2)
    );
  }
  
  /**
   * Generate vocabulary feedback based on analysis
   */
  private static generateVocabularyFeedback(
    score: number,
    academicLevel: string,
    lexicalDensity: number,
    overusedWords: string[],
    typos: Array<{word: string, suggestions: string[], context: string}>
  ): string {
    let feedback = "";
    
    // Overall assessment based on score
    if (score >= 85) {
      feedback = "Your vocabulary usage demonstrates exceptional academic sophistication with appropriate variety and precision. ";
    } else if (score >= 75) {
      feedback = "Your vocabulary reflects strong academic writing with good term selection and variety. ";
    } else if (score >= 65) {
      feedback = "Your vocabulary is appropriate for academic writing with some room for enhancement in specificity and variety. ";
    } else if (score >= 50) {
      feedback = "Your vocabulary is adequate but would benefit from more academic terminology and greater variety. ";
    } else {
      feedback = "Your vocabulary needs significant development to meet academic standards. Consider incorporating more field-specific and precise terminology. ";
    }
    
    // Add details about specific aspects
    feedback += `Your writing demonstrates ${academicLevel}-level academic language. `;
    
    if (lexicalDensity > 0.65) {
      feedback += "You use an impressive variety of unique words, indicating strong lexical range. ";
    } else if (lexicalDensity < 0.45) {
      feedback += "Your writing could benefit from a broader range of vocabulary to reduce repetition. ";
    }
    
    if (overusedWords.length > 0) {
      feedback += `Consider finding alternatives for frequently used words like "${overusedWords.slice(0, 3).join('", "')}". `;
    }
    
    if (typos.length > 0) {
      feedback += `There ${typos.length === 1 ? 'is' : 'are'} ${typos.length} potential spelling ${typos.length === 1 ? 'error' : 'errors'} to correct. `;
    }
    
    return feedback.trim();
  }
  
  /**
   * Identify vocabulary strengths
   */
  private static identifyVocabularyStrengths(
    lexicalDensity: number,
    sophisticationResult: any,
    transitionsResult: any
  ): string[] {
    const strengths: string[] = [];
    
    if (lexicalDensity > 0.6) {
      strengths.push("Excellent lexical variety and word choice diversity");
    } else if (lexicalDensity > 0.5) {
      strengths.push("Good lexical variety");
    }
    
    if (sophisticationResult.academicLevel === "expert") {
      strengths.push("Exceptional academic vocabulary usage");
    } else if (sophisticationResult.academicLevel === "advanced") {
      strengths.push("Strong academic terminology throughout");
    }
    
    if (sophisticationResult.advancedWordsRatio > 0.2) {
      strengths.push("Effective use of sophisticated terminology");
    }
    
    if (transitionsResult.variety > 0.7) {
      strengths.push("Excellent variety in transition phrases");
    } else if (transitionsResult.variety > 0.5) {
      strengths.push("Good transition variety");
    }
    
    if (transitionsResult.totalCount > 0 && 
        transitionsResult.missingTypes.length === 0) {
      strengths.push("Comprehensive use of different transition types");
    }
    
    return strengths;
  }
  
  /**
   * Identify areas for vocabulary improvement
   */
  private static identifyImprovementAreas(
    overusedWords: string[],
    sophisticationResult: any,
    typos: Array<{word: string, suggestions: string[], context: string}>,
    transitionsResult: any
  ): string[] {
    const areas: string[] = [];
    
    if (overusedWords.length > 0) {
      areas.push(`Reduce repetition of words like "${overusedWords.slice(0, 3).join('", "')}" `);
    }
    
    if (sophisticationResult.academicLevel === "basic") {
      areas.push("Incorporate more academic terminology appropriate to your field");
    } else if (sophisticationResult.academicLevel === "intermediate") {
      areas.push("Enhance precision with more discipline-specific vocabulary");
    }
    
    if (typos.length > 0) {
      areas.push(`Correct ${typos.length} potential spelling ${typos.length === 1 ? 'error' : 'errors'}`);
    }
    
    if (transitionsResult.variety < 0.3) {
      areas.push("Increase variety in transition phrases");
    }
    
    if (transitionsResult.missingTypes.length > 0) {
      areas.push(`Add ${transitionsResult.missingTypes.join('/')} transitions to improve flow`);
    }
    
    if (transitionsResult.overusedTransitions.length > 0) {
      areas.push(`Find alternatives for overused transition "${transitionsResult.overusedTransitions[0]}"`);
    }
    
    return areas;
  }
  
  /**
   * Find alternatives for common words
   */
  private static findAlternatives(word: string): string[] {
    // Check verbs
    for (const pair of this.academicVerbs) {
      if (word === pair.basic) {
        return pair.advanced;
      }
    }
    
    // Check nouns
    for (const pair of this.academicNouns) {
      if (word === pair.basic) {
        return pair.advanced;
      }
    }
    
    // Default alternatives based on common academic writing improvements
    const commonAlternatives: Record<string, string[]> = {
      "good": ["beneficial", "advantageous", "valuable", "favorable"],
      "bad": ["detrimental", "adverse", "unfavorable", "problematic"],
      "big": ["substantial", "significant", "considerable", "extensive"],
      "small": ["minimal", "limited", "modest", "slight"],
      "important": ["crucial", "essential", "significant", "critical"],
      "problem": ["challenge", "issue", "obstacle", "impediment"],
      "find": ["identify", "discover", "determine", "ascertain"],
      "help": ["facilitate", "enable", "assist", "aid"]
    };
    
    return commonAlternatives[word] || [];
  }
  
  /**
   * Estimate number of syllables in a word
   */
  private static estimateSyllables(word: string): number {
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
   * Check if word is a common function word
   */
  private static isCommonFunctionWord(word: string): boolean {
    const functionWords = [
      "the", "a", "an", "and", "or", "but", "if", "while", "because",
      "to", "of", "in", "on", "at", "with", "from", "for", "by", "about",
      "as", "that", "this", "these", "those", "is", "are", "was", "were",
      "be", "been", "being", "have", "has", "had", "do", "does", "did",
      "will", "would", "shall", "should", "may", "might", "must", "can",
      "could", "not", "no", "nor", "yes", "yet", "so", "such", "than",
      "then", "there", "here", "when", "where", "why", "how", "all", "any",
      "both", "each", "few", "many", "some", "who", "whom", "whose", "which",
      "what", "i", "you", "he", "she", "it", "we", "they", "me", "him", "her",
      "us", "them", "my", "your", "his", "its", "our", "their", "mine", "yours"
    ];
    
    return functionWords.includes(word);
  }
  
  /**
   * Generate an empty result when text is empty
   */
  private static getEmptyResult(): VocabularyAnalysisResult {
    return {
      score: 0,
      feedback: "No text provided for vocabulary analysis.",
      advanced: [],
      suggestions: [],
      uniqueness: 0,
      academicLevel: "basic",
      improvementAreas: [],
      strengths: [],
      typos: []
    };
  }
}
