import db from '../database/connection.js';

class EvaluationRepository {
  create({ id, creatorId, score, feedback }) {
    const stmt = db.prepare(`
      INSERT INTO evaluations (id, creatorId, score, feedback)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, creatorId, score, feedback);
    return { id, creatorId, score, feedback };
  }

  findByCreatorId(creatorId) {
    const stmt = db.prepare(`
      SELECT * FROM evaluations
      WHERE creatorId = ?
    `);
    return stmt.all(creatorId);
  }
}

export const evaluationRepository = new EvaluationRepository();
export default evaluationRepository;
