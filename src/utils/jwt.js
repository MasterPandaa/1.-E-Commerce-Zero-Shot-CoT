const jwt = require("jsonwebtoken");

function signToken(user) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  const options = { expiresIn: process.env.JWT_EXPIRES_IN || "1d" };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
