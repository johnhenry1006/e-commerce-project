"use strict";

const express = require("express");

const router = express.Router();

const { apiKey, permission } = require("../auth/checkAuth");

// Check apiKey
router.use(apiKey);

// Check permission
router.use(permission("0000"));

router.use("/v1/api/discount", require("./discount"));
router.use("/v1/api/product", require("./product"));
router.use("/v1/api", require("./access"));

module.exports = router;
