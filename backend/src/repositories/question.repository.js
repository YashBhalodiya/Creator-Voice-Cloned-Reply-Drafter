import db from '../database/connection.js';

class QuestionRepository {
  create({ id, creatorId, question }) {
    const stmt = db.prepare(`
      INSERT INTO questions (id, creatorId, question)
      VALUES (?, ?, ?)
    `);
    stmt.run(id, creatorId, question);
    return { id, creatorId, question };
  }

  findById(id) {
    const stmt = db.prepare('SELECT * FROM questions WHERE id = ?');
    return stmt.get(id);
  }
}

export const questionRepository = new QuestionRepository();
export default questionRepository;
