import crypto from 'crypto';
import { replyRepository } from '../repositories/reply.repository.js';
import { creatorRepository } from '../repositories/creator.repository.js';
import { embeddingService } from './embedding.service.js';
import { styleExtractorService } from './style-extractor.service.js';
import { creatorService } from './creator.service.js';
import { NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

class ReplyService {
  /**
   * Bulk imports replies for a creator, generating vector embeddings for each.
   * Also triggers style feature extraction.
   * @param {string} creatorId The ID of the creator.
   * @param {string[]} texts Array of reply texts to import.
   */
  async bulkImportReplies(creatorId, texts) {
    // 1. Ensure creator exists
    const creator = creatorRepository.findById(creatorId);
    if (!creator) {
      throw new NotFoundError(`Creator with ID ${creatorId} not found.`);
    }

    logger.info(`Starting bulk import of ${texts.length} replies for creator: ${creator.name}`);
    const repliesToInsert = [];
    const concurrencyLimit = 5; // Process in chunks to prevent rate-limiting or memory issues

    for (let i = 0; i < texts.length; i += concurrencyLimit) {
      const chunk = texts.slice(i, i + concurrencyLimit);
      logger.debug(`Processing embedding chunk ${Math.floor(i / concurrencyLimit) + 1} of ${Math.ceil(texts.length / concurrencyLimit)}`);
      
      const chunkPromises = chunk.map(async (text) => {
        const embedding = await embeddingService.getEmbedding(text);
        return {
          id: crypto.randomUUID(),
          creatorId,
          text,
          embedding,
          createdAt: new Date().toISOString()
        };
      });

      const chunkResults = await Promise.all(chunkPromises);
      repliesToInsert.push(...chunkResults);
    }

    // 2. Insert all into database
    const insertedCount = replyRepository.createBulk(repliesToInsert);
    logger.info(`Successfully imported ${insertedCount} replies for creator: ${creator.name}`);

    // 3. Extract and update overall style features
    try {
      const allReplies = replyRepository.findByCreatorId(creatorId);
      const allTexts = allReplies.map((r) => r.text);
      
      const styleFeatures = await styleExtractorService.extractStyle(allTexts);
      await creatorService.updateCreatorStyle(creatorId, styleFeatures);
      logger.info(`Updated style features for creator: ${creator.name}`);
    } catch (styleError) {
      logger.error(`Style extraction failed for creator ${creator.name} during bulk upload:`, styleError);
      // Operational non-blocking fallback
    }
    
    return {
      success: true,
      importedCount: insertedCount
    };
  }

  /**
   * Returns all replies for a creator.
   * @param {string} creatorId The creator ID.
   */
  async getRepliesByCreator(creatorId) {
    // Ensure creator exists
    const creator = creatorRepository.findById(creatorId);
    if (!creator) {
      throw new NotFoundError(`Creator with ID ${creatorId} not found.`);
    }
    
    return replyRepository.findByCreatorId(creatorId);
  }
}

export const replyService = new ReplyService();
export default replyService;
