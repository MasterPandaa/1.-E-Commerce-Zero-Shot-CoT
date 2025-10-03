const express = require("express");
const { body, param } = require("express-validator");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/cartController");

const router = express.Router();

router.get("/", ctrl.getCart);

router.post(
  "/items",
  [
    body("product_id").isInt({ min: 1 }),
    body("quantity").optional().isInt({ min: 1 }),
  ],
  validate,
  ctrl.addItem,
);

router.patch(
  "/items/:productId",
  [param("productId").isInt({ min: 1 }), body("quantity").isInt({ min: 0 })],
  validate,
  ctrl.updateItem,
);

router.delete(
  "/items/:productId",
  [param("productId").isInt({ min: 1 })],
  validate,
  ctrl.removeItem,
);

module.exports = router;
