"use strict";

const express = require("express");
const router = express.Router();

const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const discountController = require("../../controllers/discount.controller");

// Get amount discount
router.post("/amount", asyncHandler(discountController.getDiscountAmount));

router.get(
    "/list_product_code",
    asyncHandler(discountController.getAllDiscountCodeWithProduct)
);

// authentication
router.use(authenticationV2);

router.post("", asyncHandler(discountController.createDiscountCode));
router.get("", asyncHandler(discountController.getAllDiscountCodes));

module.exports = router;
