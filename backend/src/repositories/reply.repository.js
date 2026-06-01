import db from '../database/connection.js';

class ReplyRepository {
  /**
   * Bulk inserts replies inside a single database transaction.
   * @param {Array<Object>} replies Array of replies to insert.
   * @returns {number} The count of successfully inserted records.
   */
  createBulk(replies) {
    const stmt = db.prepare(`
      INSERT INTO replies (id, creatorId, text, embedding, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Execute in a transaction for speed and safety
    const insertTransaction = db.transaction((items) => {
      for (const item of items) {
        stmt.run(
          item.id,
          item.creatorId,
          item.text,
          JSON.stringify(item.embedding),
          item.createdAt
        );
      }
    });

    insertTransaction(replies);
    return replies.length;
  }

  /**
   * Find replies belonging to a specific creator.
   * @param {string} creatorId The ID of the creator.
   */
  findByCreatorId(creatorId) {
    const stmt = db.prepare(`
      SELECT id, creatorId, text, createdAt
      FROM replies
      WHERE creatorId = ?
      ORDER BY createdAt DESC
    `);
    return stmt.all(creatorId);
  }

  /**
   * Performs a semantic similarity search using the custom registered cosine_similarity function.
   * @param {string} creatorId The ID of the creator.
   * @param {number[]} queryEmbedding The numerical vector embedding of the query.
   * @param {number} limit Maximum results to return.
   */
  findSimilarReplies(creatorId, queryEmbedding, limit = 5) {
    const stmt = db.prepare(`
      SELECT 
        id, 
        text, 
        createdAt, 
        cosine_similarity(embedding, ?) as similarity
      FROM replies
      WHERE creatorId = ?
      ORDER BY similarity DESC
      LIMIT ?
    `);
    
    // Serialize embedding to JSON string for SQLite
    const serializedQuery = JSON.stringify(queryEmbedding);
    return stmt.all(serializedQuery, creatorId, limit);
  }

  /**
   * Fetches raw embeddings for the most recent replies of a creator.
   * Used to compute real in-process cosine similarity against generated drafts.
   * @param {string} creatorId The ID of the creator.
   * @param {number} limit Maximum replies to fetch.
   */
  findEmbeddingsByCreatorId(creatorId, limit = 10) {
    const stmt = db.prepare(`
      SELECT embedding
      FROM replies
      WHERE creatorId = ?
      ORDER BY createdAt DESC
      LIMIT ?
    `);
    const rows = stmt.all(creatorId, limit);
    return rows.map(r => {
      try { return JSON.parse(r.embedding); } catch { return null; }
    }).filter(e => Array.isArray(e) && e.length > 0);
  }
}

export const replyRepository = new ReplyRepository();
export default replyRepository;
