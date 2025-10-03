const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/checkoutController");

const router = express.Router();

router.post(
  "/",
  [
    body("name").isLength({ min: 2, max: 120 }),
    body("phone").isLength({ min: 6, max: 40 }),
    body("address1").isLength({ min: 5, max: 200 }),
    body("address2").optional().isLength({ min: 0, max: 200 }),
    body("city").isLength({ min: 2, max: 100 }),
    body("state").optional().isLength({ min: 0, max: 100 }),
    body("postal_code").isLength({ min: 2, max: 20 }),
    body("country").isLength({ min: 2, max: 100 }),
  ],
  validate,
  ctrl.checkout,
);

module.exports = router;
