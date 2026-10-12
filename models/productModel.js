const db = require("../config/db");

const Product = {
  getAll: async () => {
    const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            WHERE p.is_available = true
        `;
    const result = await db.query(query);
    return result.rows;
  },
  create: async (data) => {
    const { category_id, name, description, price, image } = data;
    const query = `
            INSERT INTO products (category_id, name, description, price, image) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
    const result = await db.query(query, [
      category_id,
      name,
      description,
      price,
      image,
    ]);
    return result.rows[0];
  },
};

module.exports = Product;
