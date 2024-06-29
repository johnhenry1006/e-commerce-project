"use strict";

const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
    /**
     *
     * @param {*} req
     * @param {*} res
     * @param {*} next
     */
    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: "Discount code created successfully",
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId,
            }),
        }).send(res);
    };

    getAllDiscountCodes = async (req, res, next) => {
        new SuccessResponse({
            message: "All discount codes",
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId,
            }),
        }).send(res);
    };

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: "All discount codes",
            metadata: await DiscountService.getDiscountAmount(req.body),
        }).send(res);
    };

    getAllDiscountCodeWithProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "All discount codes",
            metadata: await DiscountService.getAllDiscountCodesWithProduct(
                req.query
            ),
        }).send(res);
    };
}

module.exports = new DiscountController();
