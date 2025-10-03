const express = require("express");
const { body, query, param } = require("express-validator");
const { requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/adminController");

const router = express.Router();

// Admin guard is applied in parent index router with authenticate; add per-route role guard here
router.use(requireRole("admin"));

router.get("/stats", ctrl.stats);

router.get(
  "/orders",
  [
    query("status")
      .optional()
      .isIn(["pending", "paid", "shipped", "completed", "cancelled"]),
    query("payment_status").optional().isIn(["pending", "paid", "failed"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  ctrl.listOrders,
);

router.patch(
  "/orders/:id/status",
  [
    param("id").isInt({ min: 1 }),
    body("status")
      .optional()
      .isIn(["pending", "paid", "shipped", "completed", "cancelled"]),
    body("payment_status").optional().isIn(["pending", "paid", "failed"]),
  ],
  validate,
  ctrl.updateOrderStatus,
);

router.get(
  "/users",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  ctrl.listUsers,
);

router.patch(
  "/users/:id",
  [
    param("id").isInt({ min: 1 }),
    body("role").optional().isIn(["user", "admin"]),
    body("is_active").optional().isBoolean(),
  ],
  validate,
  ctrl.updateUser,
);

module.exports = router;
