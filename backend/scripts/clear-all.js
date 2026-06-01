import db from '../src/database/connection.js';

try {
  console.log('Wiping all tables in SQLite database...');
  // Deleting from creators will cascade delete all replies, questions, drafts, and evaluations
  db.prepare('DELETE FROM creators').run();
  console.log('✓ All database profiles and records cleared successfully.');
} catch (err) {
  console.error('Failed to wipe database:', err);
} finally {
  db.close();
}
