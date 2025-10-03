const { pool, query } = require('../config/db');

async function getOrCreateActiveCart(user_id) {
  const rows = await query(`SELECT * FROM carts WHERE user_id = ? AND status = 'active' LIMIT 1`, [user_id]);
  if (rows[0]) return rows[0];
  const [result] = await pool.execute(`INSERT INTO carts (user_id, status) VALUES (?, 'active')`, [user_id]);
  return { id: result.insertId, user_id, status: 'active' };
}

async function listItems(cart_id) {
  return await query(
    `SELECT ci.*, p.name AS product_name, p.image_url, p.price AS current_price
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = ?`,
    [cart_id]
  );
}

async function findItem(cart_id, product_id) {
  const rows = await query(`SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1`, [cart_id, product_id]);
  return rows[0] || null;
}

async function addOrUpdateItem(cart_id, product_id, quantity, unit_price) {
  const existing = await findItem(cart_id, product_id);
  if (existing) {
    const newQty = existing.quantity + quantity;
    await query(`UPDATE cart_items SET quantity = ?, unit_price = ? WHERE id = ?`, [newQty, unit_price, existing.id]);
    return { ...existing, quantity: newQty, unit_price };
  }
  const [result] = await pool.execute(
    `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
    [cart_id, product_id, quantity, unit_price]
  );
  return { id: result.insertId, cart_id, product_id, quantity, unit_price };
}

async function updateQuantity(cart_id, product_id, quantity, unit_price) {
  await query(`UPDATE cart_items SET quantity = ?, unit_price = ? WHERE cart_id = ? AND product_id = ?`, [quantity, unit_price, cart_id, product_id]);
}

async function removeItem(cart_id, product_id) {
  await query(`DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`, [cart_id, product_id]);
}

async function clearCart(cart_id) {
  await query(`DELETE FROM cart_items WHERE cart_id = ?`, [cart_id]);
}

async function markCartOrdered(cart_id) {
  await query(`UPDATE carts SET status = 'ordered' WHERE id = ?`, [cart_id]);
}

module.exports = {
  getOrCreateActiveCart,
  listItems,
  addOrUpdateItem,
  updateQuantity,
  removeItem,
  clearCart,
  markCartOrdered,
};
