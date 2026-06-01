import config from '../src/config/env.js';

async function main() {
  const apiKey = config.gemini.apiKey;
  if (!apiKey) {
    console.error('No Gemini API key configured.');
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    console.log('Fetching models from REST API...');
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
      console.log('Supported models:');
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log('No models returned:', data);
    }
  } catch (err) {
    console.error('HTTP Request failed:', err);
  }
}

main();
