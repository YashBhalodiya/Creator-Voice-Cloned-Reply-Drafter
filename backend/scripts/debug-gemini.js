import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../src/config/env.js';
import logger from '../src/utils/logger.js';

async function testModel(modelName) {
  try {
    logger.info(`Testing model: ${modelName}...`);
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say hello!');
    logger.info(`✅ Success with ${modelName}! Response: "${result.response.text().trim()}"`);
    return true;
  } catch (error) {
    logger.warn(`❌ Failed with ${modelName}: ${error.message}`);
    return false;
  }
}

async function testAll() {
  if (!config.gemini.apiKey) {
    logger.warn('No GEMINI_API_KEY set.');
    return;
  }

  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest'
  ];

  for (const model of models) {
    const success = await testModel(model);
    if (success) {
      logger.info(`🎉 Found working model: ${model}`);
      break;
    }
  }
}

testAll();
