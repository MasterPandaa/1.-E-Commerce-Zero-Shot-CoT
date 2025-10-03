const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');

exports.stats = async (req, res, next) => {
  try {
    const stats = await orderModel.adminStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

exports.listOrders = async (req, res, next) => {
  try {
    const { status, payment_status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const out = await orderModel.adminListOrders({ status, payment_status, offset, limit: Number(limit) });
    res.json({ data: out.rows, pagination: { page: Number(page), limit: Number(limit), total: out.count } });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status, payment_status } = req.body;
    await orderModel.updateOrderStatus(id, { status, payment_status });
    res.json({ message: 'Order updated' });
  } catch (err) {
    next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const offset = (page - 1) * limit;
    const out = await userModel.listUsers({ offset, limit });
    res.json({ data: out.rows, pagination: { page, limit, total: out.count } });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { role, is_active } = req.body;
    const updated = await userModel.adminUpdateUser(id, { role, is_active });
    res.json({ message: 'User updated', user: { id: updated.id, email: updated.email, role: updated.role, is_active: updated.is_active } });
  } catch (err) {
    next(err);
  }
};
