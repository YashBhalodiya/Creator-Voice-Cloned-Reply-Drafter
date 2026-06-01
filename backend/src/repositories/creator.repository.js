import db from '../database/connection.js';

class CreatorRepository {
  create({ id, name, persona, styleFeatures = null }) {
    const stmt = db.prepare(`
      INSERT INTO creators (id, name, persona, styleFeatures)
      VALUES (?, ?, ?, ?)
    `);
    const serializedStyle = styleFeatures ? JSON.stringify(styleFeatures) : null;
    stmt.run(id, name, persona, serializedStyle);
    return { id, name, persona, styleFeatures };
  }

  updateStyle(id, styleFeatures) {
    const stmt = db.prepare(`
      UPDATE creators
      SET styleFeatures = ?
      WHERE id = ?
    `);
    stmt.run(JSON.stringify(styleFeatures), id);
    return styleFeatures;
  }

  findById(id) {
    const stmt = db.prepare('SELECT * FROM creators WHERE id = ?');
    const creator = stmt.get(id);
    if (creator && creator.styleFeatures) {
      try {
        creator.styleFeatures = JSON.parse(creator.styleFeatures);
      } catch (e) {
        creator.styleFeatures = null;
      }
    }
    return creator;
  }

  findAll() {
    const stmt = db.prepare('SELECT * FROM creators');
    const creators = stmt.all();
    return creators.map((c) => {
      if (c.styleFeatures) {
        try {
          c.styleFeatures = JSON.parse(c.styleFeatures);
        } catch (e) {
          c.styleFeatures = null;
        }
      }
      return c;
    });
  }
}

export const creatorRepository = new CreatorRepository();
export default creatorRepository;
