import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import config from '../config/env.js';
import logger from '../utils/logger.js';

// Ensure the directory for the SQLite database exists
const dbDir = path.dirname(config.databasePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  logger.info(`Created database directory: ${dbDir}`);
}

logger.info(`Initializing SQLite database at: ${config.databasePath}`);
const db = new Database(config.databasePath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Register custom cosine similarity function for vector search
db.function('cosine_similarity', (aStr, bStr) => {
  if (!aStr || !bStr) return 0;
  try {
    const a = JSON.parse(aStr);
    const b = JSON.parse(bStr);
    
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  } catch (err) {
    return 0;
  }
});

// Create tables
const schema = `
  CREATE TABLE IF NOT EXISTS creators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    persona TEXT NOT NULL,
    styleFeatures TEXT
  );

  CREATE TABLE IF NOT EXISTS replies (
    id TEXT PRIMARY KEY,
    creatorId TEXT NOT NULL,
    text TEXT NOT NULL,
    embedding TEXT NOT NULL, -- Serialized float array
    createdAt TEXT NOT NULL,
    FOREIGN KEY (creatorId) REFERENCES creators(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    creatorId TEXT NOT NULL,
    question TEXT NOT NULL,
    FOREIGN KEY (creatorId) REFERENCES creators(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    creatorId TEXT NOT NULL,
    questionId TEXT NOT NULL,
    draft TEXT NOT NULL,
    rank INTEGER NOT NULL,
    similarityScore REAL DEFAULT 0.0,
    FOREIGN KEY (creatorId) REFERENCES creators(id) ON DELETE CASCADE,
    FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY,
    creatorId TEXT NOT NULL,
    score INTEGER NOT NULL,
    feedback TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creatorId) REFERENCES creators(id) ON DELETE CASCADE
  );
`;

try {
  db.exec(schema);
  
  // Dynamic migration: Ensure creators table has the styleFeatures column
  const tableInfo = db.prepare("PRAGMA table_info(creators)").all();
  const hasStyleFeatures = tableInfo.some(col => col.name === 'styleFeatures');
  if (!hasStyleFeatures) {
    db.exec("ALTER TABLE creators ADD COLUMN styleFeatures TEXT;");
    logger.info("Migrated SQLite database: added styleFeatures column to creators table.");
  }

  // Dynamic migration: Ensure evaluations table has the createdAt column
  const evalTableInfo = db.prepare("PRAGMA table_info(evaluations)").all();
  const hasCreatedAt = evalTableInfo.some(col => col.name === 'createdAt');
  if (!hasCreatedAt) {
    db.exec("ALTER TABLE evaluations ADD COLUMN createdAt TEXT;");
    logger.info("Migrated SQLite database: added createdAt column to evaluations table.");
  }

  // Dynamic migration: Ensure drafts table has the similarityScore column
  const draftsTableInfo = db.prepare("PRAGMA table_info(drafts)").all();
  const hasSimilarityScore = draftsTableInfo.some(col => col.name === 'similarityScore');
  if (!hasSimilarityScore) {
    db.exec("ALTER TABLE drafts ADD COLUMN similarityScore REAL DEFAULT 0.0;");
    logger.info("Migrated SQLite database: added similarityScore column to drafts table.");
  }

  logger.info('Database schema initialized successfully.');
} catch (error) {
  logger.error('Failed to initialize database schema:', error);
  throw error;
}

export default db;
export { db };
