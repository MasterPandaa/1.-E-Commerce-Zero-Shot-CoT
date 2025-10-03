const orderModel = require('../models/orderModel');

exports.listMyOrders = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const offset = (page - 1) * limit;
    const out = await orderModel.listOrdersByUser(req.user.id, { offset, limit });
    res.json({ data: out.rows, pagination: { page, limit, total: out.count } });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrder = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = await orderModel.getOrderWithItems(id);
    if (!data || data.order.user_id !== req.user.id) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
};
