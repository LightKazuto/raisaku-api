const { Pool, neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");
require("dotenv").config();

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err, client) => {
  console.error(
    "Koneksi idle diputus otomatis oleh Neon (Ini normal):",
    err.message,
  );
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("Gagal koneksi ke Neon:", err.stack);
  } else {
    console.log("Berhasil koneksi ke Neon Database via WebSocket");
    release();
  }
});

module.exports = pool;
