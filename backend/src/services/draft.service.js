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
      logger.error('Gemini API call or response parsing failed:', err);
      throw new AppError(`Gemini generation failed: ${err.message}`, 502);
    }

    if (!parsedResult || !Array.isArray(parsedResult.drafts)) {
      throw new AppError('Gemini API response did not contain the expected drafts structure.', 502);
    }

    // 6. Save generated drafts to SQLite database
    const draftsToInsert = parsedResult.drafts.map((d) => ({
      id: crypto.randomUUID(),
      creatorId,
      questionId,
      draft: d.draft,
      rank: d.rank
    }));

    draftRepository.createBulk(draftsToInsert);
    logger.info(`Saved ${draftsToInsert.length} draft suggestions to the database.`);

    // Return drafts combined with reasoning metadata for rich API responses
    return draftsToInsert.map((d, index) => ({
      ...d,
      reasoning: parsedResult.drafts[index].reasoning || ''
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
}

export const draftService = new DraftService();
export default draftService;
