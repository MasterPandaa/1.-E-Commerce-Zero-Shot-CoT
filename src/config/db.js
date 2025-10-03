const mysql = require("mysql2/promise");
const logger = require("./logger");

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const pool = mysql.createPool({
  host: DB_HOST || "localhost",
  port: DB_PORT ? Number(DB_PORT) : 3306,
  user: DB_USER || "root",
  password: DB_PASSWORD || "",
  database: DB_NAME || "ecommerce_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
  dateStrings: true,
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    logger.info("MySQL connected");
  } catch (err) {
    logger.error("MySQL connection error: %s", err.message);
  }
}

// Run test on module load (non-blocking)
testConnection();

module.exports = {
  pool,
  query: async (sql, params = []) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },
};
