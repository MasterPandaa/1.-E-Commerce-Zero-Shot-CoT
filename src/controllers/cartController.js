const productModel = require('../models/productModel');
const cartModel = require('../models/cartModel');

async function computeCartTotals(items) {
  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);
  const total = subtotal; // can add shipping/taxes here
  return { subtotal, total };
}

exports.getCart = async (req, res, next) => {
  try {
    const cart = await cartModel.getOrCreateActiveCart(req.user.id);
    const items = await cartModel.listItems(cart.id);
    const totals = await computeCartTotals(items);
    res.json({ cart, items, totals });
  } catch (err) {
    next(err);
  }
};

exports.addItem = async (req, res, next) => {
  try {
    const { product_id, quantity } = req.body;
    const product = await productModel.findById(Number(product_id));
    if (!product || !product.is_active) return res.status(400).json({ message: 'Invalid product' });
    const qty = Math.max(1, Number(quantity || 1));
    const cart = await cartModel.getOrCreateActiveCart(req.user.id);
    await cartModel.addOrUpdateItem(cart.id, product.id, qty, Number(product.price));
    const items = await cartModel.listItems(cart.id);
    const totals = await computeCartTotals(items);
    res.json({ cart, items, totals });
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const { quantity } = req.body;
    const qty = Number(quantity);
    const cart = await cartModel.getOrCreateActiveCart(req.user.id);
    const product = await productModel.findById(productId);
    if (!product) return res.status(400).json({ message: 'Invalid product' });

    if (qty <= 0) {
      await cartModel.removeItem(cart.id, productId);
    } else {
      await cartModel.updateQuantity(cart.id, productId, qty, Number(product.price));
    }

    const items = await cartModel.listItems(cart.id);
    const totals = await computeCartTotals(items);
    res.json({ cart, items, totals });
  } catch (err) {
    next(err);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const cart = await cartModel.getOrCreateActiveCart(req.user.id);
    await cartModel.removeItem(cart.id, productId);
    const items = await cartModel.listItems(cart.id);
    const totals = await computeCartTotals(items);
    res.json({ cart, items, totals });
  } catch (err) {
    next(err);
  }
};
