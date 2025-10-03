const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const checkoutRoutes = require('./checkoutRoutes');
const adminRoutes = require('./adminRoutes');
const ordersRoutes = require('./orderRoutes');
const { authenticate } = require('../middleware/auth');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', authenticate, cartRoutes);
router.use('/checkout', authenticate, checkoutRoutes);
router.use('/admin', authenticate, adminRoutes);
router.use('/orders', authenticate, ordersRoutes);

module.exports = router;
