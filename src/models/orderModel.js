const { pool, query } = require("../config/db");

async function createOrder({
  user_id,
  total_amount,
  payment_status,
  payment_ref,
  shipping,
}) {
  const sql = `INSERT INTO orders (user_id, total_amount, status, payment_status, payment_ref, shipping_name, shipping_phone, shipping_address1, shipping_address2, shipping_city, shipping_state, shipping_postal_code, shipping_country)
               VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    user_id,
    total_amount,
    payment_status || "pending",
    payment_ref || null,
    shipping.name,
    shipping.phone,
    shipping.address1,
    shipping.address2 || null,
    shipping.city,
    shipping.state || null,
    shipping.postal_code,
    shipping.country,
  ];
  const [result] = await pool.execute(sql, params);
  return result.insertId;
}

async function insertOrderItems(order_id, items) {
  if (!items.length) return;
  const sql =
    "INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES ?";
  const values = items.map((it) => [
    order_id,
    it.product_id,
    it.product_name,
    it.quantity,
    it.unit_price,
    it.quantity * it.unit_price,
  ]);
  await pool.query(sql, [values]);
}

async function listOrdersByUser(user_id, { offset = 0, limit = 20 }) {
  const rows = await query(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [user_id, limit, offset],
  );
  const [{ count }] = await query(
    "SELECT COUNT(*) AS count FROM orders WHERE user_id = ?",
    [user_id],
  );
  return { rows, count };
}

async function getOrderWithItems(order_id) {
  const rows = await query("SELECT * FROM orders WHERE id = ?", [order_id]);
  const order = rows[0] || null;
  if (!order) return null;
  const items = await query("SELECT * FROM order_items WHERE order_id = ?", [
    order_id,
  ]);
  return { order, items };
}

async function adminListOrders({
  status,
  payment_status,
  offset = 0,
  limit = 20,
}) {
  const where = [];
  const params = [];
  if (status) {
    where.push("status = ?");
    params.push(status);
  }
  if (payment_status) {
    where.push("payment_status = ?");
    params.push(payment_status);
  }
  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
  const rows = await query(
    `SELECT * FROM orders ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  const [{ count }] = await query(
    `SELECT COUNT(*) AS count FROM orders ${whereSql}`,
    params,
  );
  return { rows, count };
}

async function updateOrderStatus(id, { status, payment_status }) {
  const sets = [];
  const params = [];
  if (status) {
    sets.push("status = ?");
    params.push(status);
  }
  if (payment_status) {
    sets.push("payment_status = ?");
    params.push(payment_status);
  }
  if (!sets.length) return;
  params.push(id);
  await query(`UPDATE orders SET ${sets.join(", ")} WHERE id = ?`, params);
}

async function adminStats() {
  const revRows = await query(
    "SELECT COALESCE(SUM(total_amount),0) AS total_revenue FROM orders WHERE payment_status = 'paid'",
  );
  const ordRows = await query("SELECT COUNT(*) AS total_orders FROM orders");
  const monthly = await query(`
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS orders, COALESCE(SUM(total_amount),0) AS revenue
    FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY 1 ORDER BY 1 ASC
  `);
  const total_revenue = Number((revRows[0] && revRows[0].total_revenue) || 0);
  const total_orders = Number((ordRows[0] && ordRows[0].total_orders) || 0);
  return { total_revenue, total_orders, monthly };
}

module.exports = {
  createOrder,
  insertOrderItems,
  listOrdersByUser,
  getOrderWithItems,
  adminListOrders,
  updateOrderStatus,
  adminStats,
};
