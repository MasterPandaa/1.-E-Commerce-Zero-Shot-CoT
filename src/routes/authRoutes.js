const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),
  ],
  validate,
  ctrl.register
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isString().isLength({ min: 8 })],
  validate,
  ctrl.login
);

router.post(
  '/request-password-reset',
  [body('email').isEmail().normalizeEmail()],
  validate,
  ctrl.requestPasswordReset
);

router.post(
  '/reset-password',
  [body('token').isString().isLength({ min: 10 }), body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })],
  validate,
  ctrl.resetPassword
);

router.get('/me', authenticate, ctrl.me);

module.exports = router;
