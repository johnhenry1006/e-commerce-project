"use strict";

const crypto = require("node:crypto");
const apiKeyModel = require("../models/apiKey.model");

const findById = async (key) => {
    // const generatedKey = crypto.randomBytes(32).toString("hex");

    // const newKey = await apiKeyModel.create({
    //     key: generatedKey,
    //     permissions: ["0000"],
    // });

    // console.log(newKey);

    const objKey = await apiKeyModel.findOne({ key, status: true }).lean();

    return objKey;
};

module.exports = { findById };
