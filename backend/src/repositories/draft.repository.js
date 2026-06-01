import db from '../database/connection.js';

class DraftRepository {
  /**
   * Bulk inserts drafts inside a transaction.
   * @param {Array<Object>} drafts Array of drafts to insert.
   */
  createBulk(drafts) {
    const stmt = db.prepare(`
      INSERT INTO drafts (id, creatorId, questionId, draft, rank, similarityScore)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertTransaction = db.transaction((items) => {
      for (const item of items) {
        stmt.run(item.id, item.creatorId, item.questionId, item.draft, item.rank, item.similarityScore ?? 0.0);
      }
    });

    insertTransaction(drafts);
    return drafts;
  }

  /**
   * Retrieves all drafts created for a specific question.
   * @param {string} questionId The ID of the question.
   */
  findByQuestionId(questionId) {
    const stmt = db.prepare(`
      SELECT * FROM drafts
      WHERE questionId = ?
      ORDER BY rank ASC
    `);
    return stmt.all(questionId);
  }

  /**
   * Find a draft by ID.
   * @param {string} id The draft ID.
   */
  findById(id) {
    const stmt = db.prepare('SELECT * FROM drafts WHERE id = ?');
    return stmt.get(id);
  }
}

export const draftRepository = new DraftRepository();
export default draftRepository;
