import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import { creatorRepository } from '../repositories/creator.repository.js';
import { questionRepository } from '../repositories/question.repository.js';
import { replyRepository } from '../repositories/reply.repository.js';
import { draftRepository } from '../repositories/draft.repository.js';
import { embeddingService } from './embedding.service.js';
import { generateDraftPrompt } from '../prompts/templates.js';
import { NotFoundError, AppError } from '../utils/errors.js';

class DraftService {
  /**
   * Generates ranked response drafts for a specific question using semantic RAG.
   * @param {string} creatorId The ID of the creator.
   * @param {string} questionId The ID of the submitted question.
   */
  async generateDrafts({ creatorId, questionId }) {
    // 1. Validate creator and question exist
    const creator = creatorRepository.findById(creatorId);
    if (!creator) {
      throw new NotFoundError(`Creator with ID ${creatorId} not found.`);
    }

    const questionRecord = questionRepository.findById(questionId);
    if (!questionRecord) {
      throw new NotFoundError(`Question with ID ${questionId} not found.`);
    }

    if (questionRecord.creatorId !== creatorId) {
      throw new AppError('The specified question does not belong to this creator.', 400);
    }

    if (!config.gemini.apiKey) {
      throw new AppError('GEMINI_API_KEY is not defined in the backend environment. Cannot generate drafts.', 500);
    }

    logger.info(`Generating drafts for creator: ${creator.name}, question: "${questionRecord.question}"`);

    // 2. Vector search: Get embedding for the question
    let queryEmbedding;
    try {
      queryEmbedding = await embeddingService.getEmbedding(questionRecord.question);
    } catch (err) {
      logger.error('Failed to generate embedding for the incoming question', err);
      throw new AppError('Embedding generation for vector search failed.', 500);
    }

    // 3. Query similar past replies
    const similarReplies = replyRepository.findSimilarReplies(creatorId, queryEmbedding, 4);
    logger.debug(`Found ${similarReplies.length} semantically similar past replies for context.`);

    // 4. Generate structured Gemini prompt
    const prompt = generateDraftPrompt(creator, questionRecord.question, similarReplies);

    // 5. Query Gemini API
    let parsedResult;
    try {
      const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      const model = genAI.getGenerativeModel({ model: config.gemini.model });
      
      logger.info(`Invoking Gemini API (${config.gemini.model}) for drafts...`);
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = result.response.text();
      logger.debug(`Raw Gemini API Response: ${responseText}`);

      // Handle parsing with markdown sanitization fallback
      try {
        parsedResult = JSON.parse(responseText);
      } catch (err) {
        // Strip out common Markdown JSON wrappers if the model didn't obey the MIME type fully
        const cleanedText = responseText.replace(/```json|```/g, '').trim();
        parsedResult = JSON.parse(cleanedText);
      }
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      logger.warn(`⚠️ Gemini API call failed (${err.message}). Falling back to local RAG style generator.`);
      
      // Local relevance validation: check similarity of top matches. If too low or empty, throw validation error
      const maxSimilarity = similarReplies.length > 0 ? similarReplies[0].similarity : 0;
      if (similarReplies.length === 0 || maxSimilarity < 0.22) {
        throw new AppError('Irrelevant question detected. Please ask a question related to the creator\'s content.', 400);
      }

      parsedResult = {
        relevant: true,
        relevanceMessage: null,
        drafts: this.generateLocalFallbackDrafts(creator, questionRecord.question, similarReplies)
      };
    }

    if (!parsedResult) {
      throw new AppError('No response received from draft generation pipeline.', 502);
    }

    // Relevance Check validation
    if (parsedResult.relevant === false) {
      throw new AppError(parsedResult.relevanceMessage || 'Irrelevant question detected. Please ask a question related to the creator\'s content.', 400);
    }

    if (!Array.isArray(parsedResult.drafts)) {
      throw new AppError('Draft generation response did not contain the expected drafts structure.', 502);
    }

    // 6. Fetch creator's stored embeddings to compute REAL cosine similarity per draft
    const creatorEmbeddings = replyRepository.findEmbeddingsByCreatorId(creatorId, 10);

    // 7. For each draft, compute its embedding and average cosine against the corpus
    const draftsWithRealScores = await Promise.all(
      parsedResult.drafts.map(async (d) => {
        let realScore = d.similarityScore ?? 0.80; // fallback if embedding fails
        if (creatorEmbeddings.length > 0) {
          try {
            const draftEmbedding = await embeddingService.getEmbedding(d.draft);
            const scores = creatorEmbeddings.map(corpusEmbed =>
              this.cosineSimilarity(draftEmbedding, corpusEmbed)
            );
            // Use average of top-3 scores for stability
            const topScores = scores.sort((a, b) => b - a).slice(0, 3);
            realScore = topScores.reduce((sum, s) => sum + s, 0) / topScores.length;
          } catch (err) {
            logger.warn(`Could not compute real similarity for draft: ${err.message}`);
          }
        }
        return { ...d, similarityScore: Math.round(realScore * 1000) / 1000 };
      })
    );

    logger.info(`Computed real cosine similarity scores for ${draftsWithRealScores.length} drafts.`);

    // 8. Save generated drafts to SQLite database
    const draftsToInsert = draftsWithRealScores.map((d) => ({
      id: crypto.randomUUID(),
      creatorId,
      questionId,
      draft: d.draft,
      rank: d.rank,
      similarityScore: d.similarityScore
    }));

    draftRepository.createBulk(draftsToInsert);
    logger.info(`Saved ${draftsToInsert.length} draft suggestions to the database.`);

    // Return drafts combined with reasoning metadata for rich API responses
    return draftsToInsert.map((d, index) => ({
      ...d,
      reasoning: draftsWithRealScores[index].reasoning || ''
    }));
  }

  /**
   * Retrieves previously generated drafts for a question.
   * @param {string} questionId The ID of the question.
   */
  async getDraftsByQuestion(questionId) {
    const question = questionRepository.findById(questionId);
    if (!question) {
      throw new NotFoundError(`Question with ID ${questionId} not found.`);
    }
    return draftRepository.findByQuestionId(questionId);
  }

  /**
   * Computes cosine similarity between two equal-length float vectors.
   * @param {number[]} a Vector A
   * @param {number[]} b Vector B
   * @returns {number} Cosine similarity from 0.0 to 1.0
   */
  cosineSimilarity(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  generateLocalFallbackDrafts(creator, question, similarReplies) {
    const drafts = [];
    const style = creator.styleFeatures || {
      formality: 'informal',
      emojiDensity: 5,
      punctuationStyle: 'standard expressive style',
      avgCharLength: 100
    };

    // Use REAL cosine similarity scores from SQLite vector search
    const getScore = (idx) => {
      const raw = similarReplies[idx]?.similarity;
      return raw != null ? Math.round(raw * 1000) / 1000 : null;
    };

    const examples = similarReplies.map(r => r.text);
    
    if (examples.length > 0) {
      // Option 1: Direct copy of closest semantic match — uses its real similarity score
      drafts.push({
        draft: examples[0],
        rank: 1,
        similarityScore: getScore(0),
        reasoning: `Closest voice match from ingested corpus (similarity: ${getScore(0) ? Math.round(getScore(0) * 100) + '%' : 'N/A'}).`
      });

      // Option 2: Second-closest reply with minor stylistic touch
      let blendText = examples[1] || examples[0];
      if (style.formality === 'informal' && !blendText.includes('🚀') && style.emojiDensity > 2) {
        blendText += ' 🚀';
      }
      drafts.push({
        draft: blendText,
        rank: 2,
        similarityScore: getScore(1) ?? getScore(0),
        reasoning: `Second-closest historical match with stylistic adaptation.`
      });

      // Option 3: Third reply in compact form
      let shortText = examples[2] || examples[0];
      if (shortText.length > 120) {
        shortText = shortText.substring(0, 100) + '...';
      }
      drafts.push({
        draft: shortText,
        rank: 3,
        similarityScore: getScore(2) ?? getScore(0),
        reasoning: `Compact alternative (approx. ${Math.min(shortText.length, style.avgCharLength)} chars).`
      });
    } else {
      // Generic template fallback based on profile parameters
      const isFormal = style.formality === 'formal';
      if (isFormal) {
        drafts.push({
          draft: `Based on the principles outlined in your query, we should proceed with caution and ensure compliance with best practices.`,
          rank: 1,
          similarityScore: 0.78,
          reasoning: "Aligned with formal persona description."
        });
        drafts.push({
          draft: `To address this appropriately: we need to evaluate the core requirements and establish a structured implementation framework.`,
          rank: 2,
          similarityScore: 0.75,
          reasoning: "Structured formal response."
        });
        drafts.push({
          draft: `I recommend scheduling a review of these requirements to maintain overall operational integrity.`,
          rank: 3,
          similarityScore: 0.75,
          reasoning: "Concise formal suggestion."
        });
      } else {
        drafts.push({
          draft: `GM! Bullish on this! 🚀 Let's execute and learn by doing! LFG!`,
          rank: 1,
          similarityScore: 0.79,
          reasoning: "Casual, high-energy response."
        });
        drafts.push({
          draft: `Awesome question. Focus on building and keeping it simple. Execution over everything! 🚀`,
          rank: 2,
          similarityScore: 0.77,
          reasoning: "Action-oriented informal suggestion."
        });
        drafts.push({
          draft: `Let's make it happen! 🚀`,
          rank: 3,
          similarityScore: 0.75,
          reasoning: "Concise informal response."
        });
      }
    }

    return drafts;
  }
}

export const draftService = new DraftService();
export default draftService;
