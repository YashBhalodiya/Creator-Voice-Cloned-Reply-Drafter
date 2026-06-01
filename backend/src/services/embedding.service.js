import config from '../config/env.js';
import logger from '../utils/logger.js';
import {
  LocalEmbeddingProvider,
  HuggingFaceEmbeddingProvider,
  GeminiEmbeddingProvider
} from '../embeddings/providers.js';

class EmbeddingService {
  constructor() {
    const providerType = (config.embedding.provider || 'local').toLowerCase();
    logger.info(`Configuring Embedding Service with provider: ${providerType}`);
    
    switch (providerType) {
      case 'local':
        this.provider = new LocalEmbeddingProvider();
        break;
      case 'huggingface':
        this.provider = new HuggingFaceEmbeddingProvider();
        break;
      case 'gemini':
        this.provider = new GeminiEmbeddingProvider();
        break;
      default:
        logger.warn(`Unknown embedding provider "${providerType}". Falling back to local ONNX provider.`);
        this.provider = new LocalEmbeddingProvider();
        break;
    }
  }

  /**
   * Generates a numerical vector embedding for the given input text.
   * @param {string} text The string to embed.
   * @returns {Promise<number[]>} Array of floats representing the embedding vector.
   */
  async getEmbedding(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Input text must be a non-empty string');
    }
    
    const startTime = Date.now();
    logger.debug(`Generating embedding for text length: ${text.length}`);
    const embedding = await this.provider.getEmbedding(text);
    logger.debug(`Embedding generated in ${Date.now() - startTime}ms (dimensions: ${embedding.length})`);
    
    return embedding;
  }
}

export const embeddingService = new EmbeddingService();
export default embeddingService;
