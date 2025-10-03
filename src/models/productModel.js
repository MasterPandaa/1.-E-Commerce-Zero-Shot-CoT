const { pool, query } = require('../config/db');

async function createProduct({ name, slug, description, price, stock, image_url, category_id }) {
  const sql = `INSERT INTO products (name, slug, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const [result] = await pool.execute(sql, [name, slug, description, price, stock, image_url, category_id || null]);
  return { id: result.insertId, name, slug, price, stock, image_url, category_id };
}

async function updateProduct(id, fields) {
  const allowed = ['name', 'slug', 'description', 'price', 'stock', 'image_url', 'category_id', 'is_active'];
  const sets = [];
  const params = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      params.push(fields[key]);
    }
  }
  if (!sets.length) return await findById(id);
  const sql = `UPDATE products SET ${sets.join(', ')} WHERE id = ?`;
  params.push(id);
  await pool.execute(sql, params);
  return await findById(id);
}

async function deleteProduct(id) {
  await query(`DELETE FROM products WHERE id = ?`, [id]);
}

async function findById(id) {
  const rows = await query(`SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`, [id]);
  return rows[0] || null;
}

async function listProducts({ q, category_slug, price_min, price_max, offset = 0, limit = 12 }) {
  const where = ['p.is_active = 1'];
  const params = [];
  if (q) {
    where.push(`(p.name LIKE ? OR p.description LIKE ?)`);
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category_slug) {
    where.push(`c.slug = ?`);
    params.push(category_slug);
  }
  if (price_min !== undefined) {
    where.push(`p.price >= ?`);
    params.push(price_min);
  }
  if (price_max !== undefined) {
    where.push(`p.price <= ?`);
    params.push(price_max);
  }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const rows = await query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     ${whereSql}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [{ count }] = await query(
    `SELECT COUNT(*) AS count
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     ${whereSql}`,
    params
  );
  return { rows, count };
}

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  findById,
  listProducts,
};
