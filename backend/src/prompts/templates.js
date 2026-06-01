/**
 * Generates the prompt instruction for Gemini draft generation.
 * @param {Object} creator The creator object (name, persona, styleFeatures)
 * @param {string} question The incoming question/comment
 * @param {Array<Object>} similarReplies Top semantically relevant past replies
 */
export const generateDraftPrompt = (creator, question, similarReplies = []) => {
  const pastRepliesContext = similarReplies.length > 0
    ? similarReplies.map((r, idx) => `Example ${idx + 1}:\n"${r.text}"`).join('\n\n')
    : 'No direct examples available. Rely entirely on the persona description.';

  let styleContext = '';
  if (creator.styleFeatures) {
    const style = creator.styleFeatures;
    styleContext = `
STYLE CONSTRAINTS (Calculated from creator's actual post history):
- Formality Level: ${style.formality}
- Average Reply Length: ~${style.avgCharLength} characters (about ${style.avgWordLength} words)
- Emoji Density: Target about ${style.emojiDensity} emojis per 100 words. (If density is 0, do NOT use any emojis).
- Punctuation & Sentence Style: ${style.punctuationStyle}
`;
  }

  return `
You are acting as an AI assistant that drafts reply options for a content creator. Your goal is to write replies that sound exactly like the creator, cloning their unique voice, style, and persona.

---
CREATOR PROFILE:
- Name: ${creator.name}
- Persona: ${creator.persona}
${styleContext}
---
INCOMING QUESTION/COMMENT:
"${question}"

---
HISTORICAL CONTEXT (Past replies written by this creator for style inspiration):
${pastRepliesContext}

---
INSTRUCTIONS:
1. Generate exactly 3 distinct reply draft options.
2. Ensure they strictly align with the creator's defined persona (e.g., tone, formatting, emojis, slang, vocabulary, sentence length).
3. Draw inspiration from the style, length, and format of the historical replies, but answer the new incoming question directly.
4. Rank the drafts from 1 to 3, where 1 is the most suitable, natural-sounding, and context-appropriate option.
5. Provide a brief one-sentence reason for each option's ranking.
6. The output MUST be a valid JSON object matching the following structure:

{
  "drafts": [
    {
      "draft": "Text of the first reply draft...",
      "rank": 1,
      "reasoning": "Brief explanation of why this draft is ranked 1."
    },
    {
      "draft": "Text of the second reply draft...",
      "rank": 2,
      "reasoning": "Brief explanation of why this draft is ranked 2."
    },
    {
      "draft": "Text of the third reply draft...",
      "rank": 3,
      "reasoning": "Brief explanation of why this draft is ranked 3."
    }
  ]
}

Ensure the output contains ONLY the JSON block. Do not wrap it in markdown code blocks like \\\`\\\`\\\`json.
`;
};
