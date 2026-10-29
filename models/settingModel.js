const db = require("../config/db");

const Setting = {
  initTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(50) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO settings (key, value)
      VALUES ('whatsapp_number', '628123456789')
      ON CONFLICT (key) DO NOTHING;
    `;
    return db.query(query);
  },

  get: async (key) => {
    try {
      const query = `SELECT value FROM settings WHERE key = $1 LIMIT 1;`;
      const result = await db.query(query, [key]);
      return result.rows[0]?.value || null;
    } catch (err) {
      if (err.code === "42P01") {
        await Setting.initTable();
        return process.env.WHATSAPP_NUMBER || "628123456789";
      }
      throw err;
    }
  },

  set: async (key, value) => {
    try {
      const query = `
        INSERT INTO settings (key, value, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = NOW()
        RETURNING *;
      `;
      const result = await db.query(query, [key, value]);
      return result.rows[0];
    } catch (err) {
      if (err.code === "42P01") {
        await Setting.initTable();
        const query = `
          INSERT INTO settings (key, value, updated_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (key) DO UPDATE
          SET value = EXCLUDED.value, updated_at = NOW()
          RETURNING *;
        `;
        const result = await db.query(query, [key, value]);
        return result.rows[0];
      }
      throw err;
    }
  },
};

module.exports = Setting;
