import db from '../database/connection.js';

class EvaluationRepository {
  create({ id, creatorId, score, feedback, createdAt }) {
    const time = createdAt || new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO evaluations (id, creatorId, score, feedback, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, creatorId, score, feedback, time);
    return { id, creatorId, score, feedback, createdAt: time };
  }

  findByCreatorId(creatorId) {
    const stmt = db.prepare(`
      SELECT e.id, e.creatorId, e.score, e.feedback, e.createdAt as date, c.name as creatorName 
      FROM evaluations e
      JOIN creators c ON e.creatorId = c.id
      WHERE e.creatorId = ?
    `);
    return stmt.all(creatorId);
  }

  findAll() {
    const stmt = db.prepare(`
      SELECT e.id, e.creatorId, e.score, e.feedback, e.createdAt as date, c.name as creatorName 
      FROM evaluations e
      JOIN creators c ON e.creatorId = c.id
      ORDER BY e.rowid DESC
    `);
    return stmt.all();
  }

  clearAll() {
    const stmt = db.prepare('DELETE FROM evaluations');
    return stmt.run();
  }
}

export const evaluationRepository = new EvaluationRepository();
export default evaluationRepository;
