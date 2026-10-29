const db = require("../config/db");

const User = {
  findByEmail: async (email) => {
    const query = `SELECT * FROM users WHERE LOWER(email) = LOWER($1);`;
    const result = await db.query(query, [email]);
    return result.rows[0];
  },

  findByUsername: async (username) => {
    const query = `SELECT * FROM users WHERE LOWER(username) = LOWER($1);`;
    const result = await db.query(query, [username]);
    return result.rows[0];
  },

  findByUsernameOrEmail: async (identifier) => {
    const query = `
      SELECT * FROM users 
      WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) 
      LIMIT 1;
    `;
    const result = await db.query(query, [identifier]);
    return result.rows[0];
  },

  findById: async (id) => {
    const query = `SELECT id, username, email, created_at FROM users WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  findByEmailExcludingId: async (email, id) => {
    const query = `SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2;`;
    const result = await db.query(query, [email, id]);
    return result.rows[0];
  },

  findByUsernameExcludingId: async (username, id) => {
    const query = `SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2;`;
    const result = await db.query(query, [username, id]);
    return result.rows[0];
  },

  create: async ({ username, email, password }) => {
    const query = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at;
    `;
    const result = await db.query(query, [username, email, password]);
    return result.rows[0];
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }

    if (fields.length === 0) {
      const query = `SELECT id, username, email, created_at FROM users WHERE id = $1;`;
      const result = await db.query(query, [id]);
      return result.rows[0];
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING id, username, email, created_at;
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  },
};

module.exports = User;
