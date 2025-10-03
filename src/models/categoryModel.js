const { pool, query } = require("../config/db");

async function createCategory({ name, slug }) {
  const sql = "INSERT INTO categories (name, slug) VALUES (?, ?)";
  const [result] = await pool.execute(sql, [name, slug]);
  return { id: result.insertId, name, slug };
}

async function findById(id) {
  const rows = await query("SELECT * FROM categories WHERE id = ?", [id]);
  return rows[0] || null;
}

async function findBySlug(slug) {
  const rows = await query("SELECT * FROM categories WHERE slug = ?", [slug]);
  return rows[0] || null;
}

async function listAll() {
  return await query("SELECT * FROM categories ORDER BY name ASC");
}

module.exports = { createCategory, findById, findBySlug, listAll };
