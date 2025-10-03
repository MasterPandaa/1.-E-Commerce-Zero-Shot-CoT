const express = require("express");
const { query, param } = require("express-validator");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/ordersController");

const router = express.Router();

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  ctrl.listMyOrders,
);

router.get("/:id", [param("id").isInt({ min: 1 })], validate, ctrl.getMyOrder);

module.exports = router;
