const db = require("../config/db");

const Category = {
  getAll: async () => {
    const query = `
      SELECT c.*, COUNT(p.id)::int AS product_count 
      FROM categories c 
      LEFT JOIN products p ON p.category_id = c.id 
      GROUP BY c.id 
      ORDER BY c.id ASC;
    `;
    const result = await db.query(query);
    return result.rows;
  },

  getById: async (id) => {
    const query = `SELECT * FROM categories WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  getByName: async (name) => {
    const query = `SELECT * FROM categories WHERE LOWER(name) = LOWER($1);`;
    const result = await db.query(query, [name]);
    return result.rows[0];
  },

  getByNameExcludingId: async (name, id) => {
    const query = `SELECT * FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2;`;
    const result = await db.query(query, [name, id]);
    return result.rows[0];
  },

  create: async ({ name, description }) => {
    const query = `
      INSERT INTO categories (name, description) 
      VALUES ($1, $2) 
      RETURNING *;
    `;
    const result = await db.query(query, [name, description || ""]);
    return result.rows[0];
  },

  update: async (id, { name, description }) => {
    const fields = [];
    const values = [];
    let index = 1;

    if (name !== undefined) {
      fields.push(`name = $${index}`);
      values.push(name);
      index++;
    }

    if (description !== undefined) {
      fields.push(`description = $${index}`);
      values.push(description);
      index++;
    }

    if (fields.length === 0) {
      const query = `SELECT * FROM categories WHERE id = $1;`;
      const result = await db.query(query, [id]);
      return result.rows[0];
    }

    values.push(id);
    const query = `
      UPDATE categories 
      SET ${fields.join(", ")} 
      WHERE id = $${index} 
      RETURNING *;
    `;
    const result = await db.query(query, values);
    return result.rows[0];
  },

  countProducts: async (id) => {
    const query = `SELECT COUNT(*)::int AS total FROM products WHERE category_id = $1;`;
    const result = await db.query(query, [id]);
    return result.rows[0]?.total || 0;
  },

  delete: async (id) => {
    const query = `DELETE FROM categories WHERE id = $1 RETURNING *;`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = Category;
