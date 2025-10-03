const express = require("express");
const { query, body } = require("express-validator");
const { authenticate, requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");
const ctrl = require("../controllers/productController");

const router = express.Router();

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("price_min").optional().isFloat({ min: 0 }),
    query("price_max").optional().isFloat({ min: 0 }),
    query("category").optional().isString().isLength({ min: 1, max: 120 }),
    query("q").optional().isString().isLength({ min: 1, max: 200 }),
  ],
  validate,
  ctrl.list,
);

router.get("/categories/list", ctrl.categories);

router.get("/:id", ctrl.get);

router.post(
  "/",
  authenticate,
  requireRole("admin"),
  upload.single("image"),
  [
    body("name").isLength({ min: 2, max: 200 }),
    body("price").isFloat({ min: 0 }),
    body("stock").optional().isInt({ min: 0 }),
    body("category_id").optional().isInt({ min: 1 }),
  ],
  validate,
  ctrl.create,
);

router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  upload.single("image"),
  [
    body("name").optional().isLength({ min: 2, max: 200 }),
    body("price").optional().isFloat({ min: 0 }),
    body("stock").optional().isInt({ min: 0 }),
    body("category_id").optional().isInt({ min: 1 }),
    body("is_active").optional().isBoolean(),
  ],
  validate,
  ctrl.update,
);

router.delete("/:id", authenticate, requireRole("admin"), ctrl.remove);

module.exports = router;
