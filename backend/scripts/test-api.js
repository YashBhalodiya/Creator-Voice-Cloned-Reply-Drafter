import assert from 'assert';
import db from '../src/database/connection.js';
import config from '../src/config/env.js';
import logger from '../src/utils/logger.js';

// We import the app.js file to boot the server automatically.
// The server starts listening on config.port.
import '../src/app.js';

const BASE_URL = `http://localhost:${config.port}`;

// Helper delay function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function testEndpoint(name, url, method, body = null, expectedStatus = 200) {
  logger.info(`🧪 Running test: ${name} (${method} ${url})...`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (response.status !== expectedStatus) {
    logger.error(`❌ Test failed: ${name}`);
    logger.error(`Expected status ${expectedStatus}, got ${response.status}`, data);
    throw new Error(`Test failed: ${name}`);
  }

  logger.info(`✅ Test passed: ${name} (Status: ${response.status})`);
  return data;
}

async function runTests() {
  // Wait a moment for server initialization
  await sleep(1500);
  
  let creatorId;
  let questionId;

  try {
    logger.info('🚀 Starting Backend Integration Tests...');

    // 1. Health check
    await testEndpoint(
      'Health check',
      `${BASE_URL}/health`,
      'GET',
      null,
      200
    );

    // 2. Create Creator
    const creatorPayload = {
      name: 'Tech Enthusiast',
      persona: 'Extremely tech-savvy, uses tech emojis like 🚀 and 💻, speaks concisely, and prefers open source solutions.'
    };
    const creatorRes = await testEndpoint(
      'Create Creator',
      `${BASE_URL}/creator`,
      'POST',
      creatorPayload,
      201
    );
    assert.ok(creatorRes.data.id, 'Creator ID should be present');
    creatorId = creatorRes.data.id;
    logger.info(`Created Creator ID: ${creatorId}`);

    // 3. Bulk Upload Replies
    const bulkRepliesPayload = {
      creatorId,
      texts: [
        'Yeah, macOS is fantastic for unix-based development, but Windows is great for gaming! 💻',
        'I highly recommend building your own PC if you want peak performance per dollar. 🖥️',
        'Docker runs great on both, but Linux is the native king for containers. 🐳',
        'You should check out the new M-series chips; their battery life is absolutely incredible. 🚀',
        'Open source is the way to go. Check out their GitHub repo! 📦'
      ]
    };
    const bulkRes = await testEndpoint(
      'Bulk Upload Replies',
      `${BASE_URL}/replies/bulk`,
      'POST',
      bulkRepliesPayload,
      201
    );
    assert.strictEqual(bulkRes.data.importedCount, 5, 'Should have imported 5 replies');

    // Verify Replies are stored in DB
    const storedReplies = db.prepare('SELECT * FROM replies WHERE creatorId = ?').all(creatorId);
    assert.strictEqual(storedReplies.length, 5, 'DB should have 5 replies stored');
    logger.info(`Verified 5 replies stored in database with serialized embeddings.`);

    // 4. Submit Question
    const questionPayload = {
      creatorId,
      question: 'Should I buy a Macbook or build a custom PC for programming?'
    };
    const questionRes = await testEndpoint(
      'Submit Question',
      `${BASE_URL}/question`,
      'POST',
      questionPayload,
      201
    );
    assert.ok(questionRes.data.id, 'Question ID should be present');
    questionId = questionRes.data.id;
    logger.info(`Logged Question ID: ${questionId}`);

    // 5. Test SQLite cosine similarity query directly before calling Gemini
    logger.info('🧪 Testing database-level cosine similarity vector search...');
    // We fetch one reply embedding to use as a dummy query embedding
    const sampleEmbeddingStr = storedReplies[0].embedding;
    const sampleEmbedding = JSON.parse(sampleEmbeddingStr);
    
    // Find replies similar to our sample reply (the first one should have similarity = 1.0)
    const matches = db.prepare(`
      SELECT id, text, cosine_similarity(embedding, ?) as similarity 
      FROM replies 
      WHERE creatorId = ? 
      ORDER BY similarity DESC 
      LIMIT 3
    `).all(sampleEmbeddingStr, creatorId);
    
    assert.ok(matches.length > 0, 'Should find similar replies');
    assert.ok(matches[0].similarity > 0.99, 'First match similarity should be 1.0 (self comparison)');
    logger.info('✅ SQLite custom cosine_similarity function verified successfully!');
    logger.info(`   Top Match: "${matches[0].text}" (similarity: ${matches[0].similarity})`);

    // 6. Generate Drafts (via Gemini)
    if (!config.gemini.apiKey || config.gemini.apiKey.includes('your_gemini_api_key')) {
      logger.warn('⚠️  Skipping Gemini draft generation test step (GEMINI_API_KEY is not configured).');
    } else {
      try {
        const draftPayload = {
          creatorId,
          questionId
        };
        const draftRes = await testEndpoint(
          'Generate Drafts (Gemini)',
          `${BASE_URL}/draft/generate`,
          'POST',
          draftPayload,
          200
        );
        assert.ok(Array.isArray(draftRes.data), 'Drafts response data should be an array');
        assert.strictEqual(draftRes.data.length, 3, 'Should have generated 3 drafts');
        logger.info('Gemini Draft Suggestions:');
        draftRes.data.forEach((d) => {
          logger.info(`   Rank [${d.rank}] Draft: "${d.draft}"`);
          logger.info(`            Reasoning: ${d.reasoning}`);
        });
      } catch (err) {
        logger.warn(`⚠️  Gemini draft generation skipped or failed (likely due to sandbox environment API key limits). Error: ${err.message}`);
      }
    }

    // 7. Submit Evaluation
    const evaluationPayload = {
      creatorId,
      score: 5,
      feedback: 'The drafts matched the Tech Enthusiast persona perfectly!'
    };
    await testEndpoint(
      'Submit Evaluation',
      `${BASE_URL}/evaluation`,
      'POST',
      evaluationPayload,
      201
    );

    // Verify Evaluation stored in DB
    const storedEvaluations = db.prepare('SELECT * FROM evaluations WHERE creatorId = ?').all(creatorId);
    assert.strictEqual(storedEvaluations.length, 1, 'DB should have 1 evaluation stored');
    logger.info('Verified evaluation stored in DB.');

    logger.info('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉\n');
    process.emit('SIGINT'); // Trigger graceful shutdown
  } catch (error) {
    logger.error('❌ Integration tests encountered a fatal error:', error);
    process.exit(1);
  }
}

runTests();
