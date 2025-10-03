const { pool, query } = require("../config/db");

async function createUser({ name, email, password_hash, role = "user" }) {
  const sql =
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)";
  const params = [name, email, password_hash, role];
  const [result] = await pool.execute(sql, params);
  return { id: result.insertId, name, email, role };
}

async function findByEmail(email) {
  const rows = await query("SELECT * FROM users WHERE email = ? LIMIT 1", [
    email,
  ]);
  return rows[0] || null;
}

async function findById(id) {
  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function updateLastLogin(userId) {
  await query("UPDATE users SET last_login = NOW() WHERE id = ?", [userId]);
}

async function listUsers({ offset = 0, limit = 20 }) {
  const rows = await query(
    "SELECT id, name, email, role, is_active, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?",
    [limit, offset],
  );
  const [{ count }] = await query("SELECT COUNT(*) AS count FROM users");
  return { rows, count };
}

// Password reset helpers
async function insertPasswordReset({ user_id, token_hash, expires_at }) {
  const sql =
    "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)";
  const [result] = await pool.execute(sql, [user_id, token_hash, expires_at]);
  return result.insertId;
}

async function findValidPasswordReset({ token_hash }) {
  const rows = await query(
    "SELECT * FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW() LIMIT 1",
    [token_hash],
  );
  return rows[0] || null;
}

async function markPasswordResetUsed(id) {
  await query("UPDATE password_resets SET used_at = NOW() WHERE id = ?", [id]);
}

async function updatePasswordHash(userId, password_hash) {
  await query("UPDATE users SET password_hash = ? WHERE id = ?", [
    password_hash,
    userId,
  ]);
}

async function adminUpdateUser(id, { role, is_active }) {
  const sets = [];
  const params = [];
  if (role) {
    sets.push("role = ?");
    params.push(role);
  }
  if (typeof is_active === "number" || typeof is_active === "boolean") {
    sets.push("is_active = ?");
    params.push(Number(is_active) ? 1 : 0);
  }
  if (!sets.length) return await findById(id);
  params.push(id);
  await query(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`, params);
  return await findById(id);
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  updateLastLogin,
  listUsers,
  insertPasswordReset,
  findValidPasswordReset,
  markPasswordResetUsed,
  updatePasswordHash,
  adminUpdateUser,
};
