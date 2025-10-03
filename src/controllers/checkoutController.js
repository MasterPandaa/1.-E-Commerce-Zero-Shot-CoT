const { pool, query } = require('../config/db');
const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const { generateInvoicePDF } = require('../utils/pdf');
const { sendMail } = require('../utils/email');

exports.checkout = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const user_id = req.user.id;
    const shipping = {
      name: req.body.name,
      phone: req.body.phone,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      state: req.body.state,
      postal_code: req.body.postal_code,
      country: req.body.country,
    };
    // Basic validation
    for (const k of ['name','phone','address1','city','postal_code','country']) {
      if (!shipping[k]) return res.status(422).json({ message: `Missing field: ${k}` });
    }

    const cart = await cartModel.getOrCreateActiveCart(user_id);
    const items = await cartModel.listItems(cart.id);
    if (!items.length) return res.status(400).json({ message: 'Cart is empty' });

    // Check stock
    for (const it of items) {
      const p = await productModel.findById(it.product_id);
      if (!p || p.stock < it.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${it.product_name}` });
      }
    }

    // Compute total
    const total_amount = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);

    // Simulate payment success
    const payment_status = 'paid';
    const payment_ref = 'SIM-' + Math.random().toString(36).slice(2, 10).toUpperCase();

    await conn.beginTransaction();

    // Create order
    const [orderRes] = await conn.execute(
      `INSERT INTO orders (user_id, total_amount, status, payment_status, payment_ref, shipping_name, shipping_phone, shipping_address1, shipping_address2, shipping_city, shipping_state, shipping_postal_code, shipping_country)
       VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        total_amount,
        payment_status,
        payment_ref,
        shipping.name,
        shipping.phone,
        shipping.address1,
        shipping.address2 || null,
        shipping.city,
        shipping.state || null,
        shipping.postal_code,
        shipping.country,
      ]
    );
    const order_id = orderRes.insertId;
    // Insert items
    const values = items.map((it) => [order_id, it.product_id, it.product_name, it.quantity, it.unit_price, it.quantity * it.unit_price]);
    await conn.query(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES ?`,
      [values]
    );

    // Decrement stock
    for (const it of items) {
      const [result] = await conn.execute(`UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`, [it.quantity, it.product_id, it.quantity]);
      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(400).json({ message: `Insufficient stock for ${it.product_name}` });
      }
    }

    // Clear cart and mark ordered using same transaction
    await conn.execute(`DELETE FROM cart_items WHERE cart_id = ?`, [cart.id]);
    await conn.execute(`UPDATE carts SET status = 'ordered' WHERE id = ?`, [cart.id]);

    await conn.commit();

    const user = await userModel.findById(user_id);
    const invoice = await generateInvoicePDF({ order: { id: order_id, created_at: new Date().toISOString(), total_amount }, items, user });

    await sendMail({
      to: user.email,
      subject: `Order Confirmation #${order_id}`,
      html: `<p>Thank you for your order. Your payment reference is <b>${payment_ref}</b>.</p>`,
      attachments: [{ filename: `invoice-${order_id}.pdf`, content: invoice }],
    });

    res.status(201).json({ order_id, payment_status, payment_ref, total_amount });
  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    next(err);
  } finally {
    conn.release();
  }
};
