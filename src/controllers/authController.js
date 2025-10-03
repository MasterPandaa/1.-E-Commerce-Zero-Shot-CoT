const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { signToken } = require('../utils/jwt');
const { sanitizeObject } = require('../utils/sanitize');
const { sendMail } = require('../utils/email');
const userModel = require('../models/userModel');

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

exports.register = async (req, res, next) => {
  try {
    const body = sanitizeObject(req.body);
    const { name, email, password } = body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await userModel.createUser({ name, email, password_hash, role: 'user' });
    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    await userModel.updateLastLogin(user.id);
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userModel.findByEmail(email);
    if (!user) return res.json({ message: 'If the email exists, a reset link has been sent.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const token_hash = hashToken(rawToken);
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await userModel.insertPasswordReset({ user_id: user.id, token_hash, expires_at });

    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset.html?token=${rawToken}`;
    await sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Click the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const token_hash = hashToken(token);
    const row = await userModel.findValidPasswordReset({ token_hash });
    if (!row) return res.status(400).json({ message: 'Invalid or expired token' });

    const password_hash = await bcrypt.hash(password, 12);
    await userModel.updatePasswordHash(row.user_id, password_hash);
    await userModel.markPasswordResetUsed(row.id);

    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
};
