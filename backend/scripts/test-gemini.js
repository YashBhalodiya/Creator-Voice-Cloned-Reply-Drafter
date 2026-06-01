import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../src/config/env.js';

async function main() {
  if (!config.gemini.apiKey) {
    console.error('No Gemini API key configured.');
    return;
  }
  
  console.log('Testing Gemini API key:', config.gemini.apiKey.substring(0, 10) + '...');
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  
  try {
    // Attempt to list models
    console.log('Listing available models...');
    const result = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).listModels();
    console.log('Models:', result);
  } catch (err) {
    console.error('Error during listing models:', err);
  }
}

main();
