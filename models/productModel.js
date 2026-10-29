const db = require("../config/db");

const Product = {
  getAll: async () => {
    const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            ORDER BY p.id ASC
        `;
    const result = await db.query(query);
    return result.rows;
  },
  create: async (data) => {
    const { category_id, name, description, price, image } = data;
    const query = `
            INSERT INTO products (category_id, name, description, price, image, is_available) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
    const result = await db.query(query, [
      category_id,
      name,
      description,
      price,
      image,
      true,
    ]);
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
      const query = `SELECT * FROM products WHERE id = $1`;
      const result = await db.query(query, [id]);
      return result.rows[0];
    }

    fields.push(`updated_at = NOW()`);

    values.push(id);
    const query = `
      UPDATE products 
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *;
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  },
};

module.exports = Product;
