import config from '../config/env.js';
import logger from '../utils/logger.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Interface/base class contract for embedding providers
 */
class BaseEmbeddingProvider {
  async getEmbedding(text) {
    throw new Error('getEmbedding(text) must be implemented');
  }
}

/**
 * Local embedding provider using @xenova/transformers
 */
export class LocalEmbeddingProvider extends BaseEmbeddingProvider {
  constructor() {
    super();
    this.extractor = null;
    this.modelName = config.embedding.model;
  }

  async initialize() {
    if (!this.extractor) {
      logger.info(`Initializing local ONNX embedding model: ${this.modelName}...`);
      // Lazy load to speed up startup for other providers
      const { pipeline } = await import('@xenova/transformers');
      this.extractor = await pipeline('feature-extraction', this.modelName);
      logger.info(`ONNX embedding model ${this.modelName} loaded successfully.`);
    }
  }

  async getEmbedding(text) {
    try {
      await this.initialize();
      const output = await this.extractor(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch (error) {
      logger.error('Error generating local embedding:', error);
      throw new Error(`Local embedding generation failed: ${error.message}`);
    }
  }
}

/**
 * HuggingFace Inference API embedding provider
 */
export class HuggingFaceEmbeddingProvider extends BaseEmbeddingProvider {
  constructor() {
    super();
    this.apiKey = config.embedding.hfApiKey;
    this.modelName = config.embedding.hfModel;
  }

  async getEmbedding(text) {
    if (!this.apiKey) {
      throw new Error('HF_API_KEY is not defined but HuggingFace embedding provider was chosen.');
    }

    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/pipeline/feature-extraction/${this.modelName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: text,
            options: { wait_for_model: true }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (!Array.isArray(result)) {
        throw new Error('Inference API returned unexpected response format');
      }
      return result;
    } catch (error) {
      logger.error('Error generating HuggingFace embedding:', error);
      throw new Error(`HuggingFace embedding generation failed: ${error.message}`);
    }
  }
}

/**
 * Gemini Embedding API provider
 */
export class GeminiEmbeddingProvider extends BaseEmbeddingProvider {
  constructor() {
    super();
    this.apiKey = config.gemini.apiKey;
    this.modelName = 'text-embedding-004'; // Dedicated Gemini embedding model
  }

  async getEmbedding(text) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not defined but Gemini embedding provider was chosen.');
    }

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.embedContent(text);
      
      if (!result || !result.embedding || !result.embedding.values) {
        throw new Error('Gemini API returned empty embedding structure');
      }
      
      return result.embedding.values;
    } catch (error) {
      logger.error('Error generating Gemini embedding:', error);
      throw new Error(`Gemini embedding generation failed: ${error.message}`);
    }
  }
}
