import config from '../config/env.js';
import logger from '../utils/logger.js';

class StyleExtractorService {
  /**
   * Extracts style features from a creator's corpus of past replies.
   * @param {string[]} texts Array of past replies/posts.
   * @returns {Promise<Object>} Object containing style metrics.
   */
  async extractStyle(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
      return {
        avgCharLength: 0,
        avgWordLength: 0,
        emojiDensity: 0,
        punctuationStyle: 'standard punctuation',
        formality: 'informal'
      };
    }

    logger.info(`Extracting style features from ${texts.length} replies...`);

    // 1. Length analysis
    let totalChars = 0;
    let totalWords = 0;
    
    for (const text of texts) {
      totalChars += text.length;
      totalWords += text.split(/\s+/).filter(Boolean).length;
    }

    const avgCharLength = Math.round(totalChars / texts.length);
    const avgWordLength = Math.round(totalWords / texts.length);

    // 2. Emoji analysis
    // Regex matches standard emojis, flags, symbols
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;
    let totalEmojis = 0;

    for (const text of texts) {
      const matches = text.match(emojiRegex);
      if (matches) {
        totalEmojis += matches.length;
      }
    }

    // Emoji density: emojis per 100 words
    const emojiDensity = totalWords > 0 
      ? parseFloat(((totalEmojis / totalWords) * 100).toFixed(2))
      : 0;

    // 3. Punctuation style
    let exclamationCount = 0;
    let questionCount = 0;
    let ellipsesCount = 0;

    for (const text of texts) {
      exclamationCount += (text.match(/!/g) || []).length;
      questionCount += (text.match(/\?/g) || []).length;
      ellipsesCount += (text.match(/\.\.\./g) || []).length;
    }

    const excRate = exclamationCount / texts.length;
    const qRate = questionCount / texts.length;
    const ellRate = ellipsesCount / texts.length;
    
    const punctuationTraits = [];
    if (excRate > 1.2) {
      punctuationTraits.push('highly enthusiastic (uses multiple exclamation marks)');
    } else if (excRate > 0.4) {
      punctuationTraits.push('expressive (uses exclamation marks for emphasis)');
    } else {
      punctuationTraits.push('measured and calm (rarely uses exclamation marks)');
    }

    if (qRate > 0.4) {
      punctuationTraits.push('conversational (often asks questions)');
    }
    if (ellRate > 0.2) {
      punctuationTraits.push('pensive (uses ellipses "..." for pauses)');
    }
    const punctuationStyle = punctuationTraits.join(', ') || 'standard sentence punctuation';

    // 4. Formality classification (HuggingFace vs Local fallback)
    const formality = await this.determineFormality(texts);

    const styleResult = {
      avgCharLength,
      avgWordLength,
      emojiDensity,
      punctuationStyle,
      formality
    };

    logger.info(`Style extraction complete. Results: ${JSON.stringify(styleResult)}`);
    return styleResult;
  }

  /**
   * Formality classifier helper
   */
  async determineFormality(texts) {
    const sampleSize = Math.min(texts.length, 10); // Sample up to 10 replies to prevent heavy API calls
    const sampleTexts = texts.slice(0, sampleSize);
    
    if (config.embedding.hfApiKey && config.embedding.hfApiKey !== 'your_huggingface_api_key_here') {
      try {
        logger.debug('Attempting formality classification via HuggingFace API...');
        let formalCount = 0;
        let informalCount = 0;
        
        for (const text of sampleTexts) {
          const label = await this.classifyFormalityHF(text);
          if (label === 'formal') formalCount++;
          else informalCount++;
        }
        
        return formalCount >= informalCount ? 'formal' : 'informal';
      } catch (err) {
        logger.warn(`HuggingFace formality API call failed (falling back to rule-based classification): ${err.message}`);
      }
    }

    // Local Fallback: Rule-based linguistic classifier
    logger.debug('Running local rule-based formality classifier...');
    let formalCount = 0;
    let informalCount = 0;
    
    for (const text of sampleTexts) {
      const label = this.classifyFormalityLocal(text);
      if (label === 'formal') formalCount++;
      else informalCount++;
    }
    
    return formalCount >= informalCount ? 'formal' : 'informal';
  }

  /**
   * Calls HuggingFace cointegrated/roberta-base-formality model
   */
  async classifyFormalityHF(text) {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/cointegrated/roberta-base-formality',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.embedding.hfApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: text })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Inference API HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    // Response format: [[{"label": "formal", "score": 0.8}, {"label": "informal", "score": 0.2}]]
    if (Array.isArray(result) && Array.isArray(result[0])) {
      let topLabel = 'informal';
      let topScore = -1;
      
      for (const prediction of result[0]) {
        if (prediction.score > topScore) {
          topScore = prediction.score;
          topLabel = prediction.label.toLowerCase();
        }
      }
      return topLabel;
    }
    return 'informal';
  }

  /**
   * Local rule-based heuristic for formality
   */
  classifyFormalityLocal(text) {
    const textLower = text.toLowerCase();
    
    // Contractions check (highly informal)
    const contractions = /\b(don't|can't|i'm|i've|you're|he's|she's|it's|we're|they're|won't|wouldn't|shouldn't|gonna|wanna|gotta|y'all|lol|lmao|omg|smh|tbh)\b/g;
    const contractionMatches = textLower.match(contractions);
    const contractionCount = contractionMatches ? contractionMatches.length : 0;
    
    // Slang and casual indicators
    const slangWords = /\b(yeah|yep|yup|nah|hey|hi|yo|nope|gimme|lemme|cuz|cause|slay|lit|fire|bestie|bruh|bro|dude|kid|guy|sweet|cool|awesome|basic|lowkey|highkey)\b/g;
    const slangMatches = textLower.match(slangWords);
    const slangCount = slangMatches ? slangMatches.length : 0;
    
    // Words and pronoun analysis
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
    // Conversational pronouns (first and second person)
    const personalPronouns = /\b(i|me|my|mine|myself|you|your|yours|yourself|yourselves)\b/g;
    const pronounMatches = textLower.match(personalPronouns);
    const pronounCount = pronounMatches ? pronounMatches.length : 0;
    const pronounRatio = wordCount > 0 ? pronounCount / wordCount : 0;
    
    let score = 50; // base score
    
    // Penalize contractions & slang
    score -= contractionCount * 8;
    score -= slangCount * 10;
    
    // Conversational pronoun ratio penalty
    if (pronounRatio > 0.15) score -= 15;
    if (pronounRatio > 0.25) score -= 15;
    
    // Emojis decrease formality
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const emojiMatches = text.match(emojiRegex);
    const emojiCount = emojiMatches ? emojiMatches.length : 0;
    score -= emojiCount * 5;
    
    // Return formal if score is above threshold
    return score >= 45 ? 'formal' : 'informal';
  }
}

export const styleExtractorService = new StyleExtractorService();
export default styleExtractorService;
