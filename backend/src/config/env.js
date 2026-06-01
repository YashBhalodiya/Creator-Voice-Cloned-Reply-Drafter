import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve directory to read the .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databasePath: process.env.DATABASE_PATH || './data/database.db',
  embedding: {
    provider: process.env.EMBEDDING_PROVIDER || 'local',
    model: process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2',
    hfApiKey: process.env.HF_API_KEY || '',
    hfModel: process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  }
};

// Validation warnings
if (config.embedding.provider === 'huggingface' && !config.embedding.hfApiKey) {
  console.warn('⚠️  [Config Warning]: EMBEDDING_PROVIDER is set to "huggingface" but HF_API_KEY is not set.');
}

if (config.embedding.provider === 'gemini' && !config.gemini.apiKey) {
  console.warn('⚠️  [Config Warning]: EMBEDDING_PROVIDER is set to "gemini" but GEMINI_API_KEY is not set.');
}

if (!config.gemini.apiKey) {
  console.warn('⚠️  [Config Warning]: GEMINI_API_KEY is not set. Reply generation will fail.');
}

export default config;
