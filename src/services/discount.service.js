"use strict";

const { max } = require("lodash");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { discount } = require("../models/discount.model");
const { convertToObjectIdMongoDb } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
    findAllDiscountCodesUnselect,
} = require("../models/repositories/discount.repo");

/**
 * Discount Service
 * 1 - Generate discount code [Shop | Admin]
 * 2 - Get discount amount [User]
 * 3 - Get all discount codes [User | Shop]
 * 4 - Verify discount code [User]
 * 5 - Delete discount code [Shop | Admin]
 * 6 - Cancel discount code [User]
 */

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code,
            start_date,
            end_date,
            is_active,
            shopId,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type,
            value,
            max_value,
            max_uses,
            uses_count,
            users_used,
            max_uses_per_user,
        } = payload;

        // check tmp
        if (
            new Date() < new Date(start_date) ||
            new Date() > new Date(end_date)
        ) {
            throw new BadRequestError(
                "Start date must be greater than current date"
            );
        }

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError("Start date must be before current date");
        }

        // create index for discount code
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                // discount_shopId: convertToObjectIdMongoDb(shopId),
                discount_shopId: shopId,
            })
            .lean();

        if (foundDiscount?.discount_is_active) {
            throw new BadRequestError("Discount code already exist");
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids:
                applies_to === "all_products" ? [] : product_ids,
        });

        return newDiscount;
    }

    static async updateDiscountCode() {
        // ...
    }

    static async getAllDiscountCodesWithProduct({
        code,
        shopId,
        userId,
        limit,
        page,
    }) {
        // create index for discount code
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                // discount_shopId: convertToObjectIdMongoDb(shopId),
                discount_shopId: shopId,
            })
            .lean();

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError("Discount code not found");
        }

        const { discount_product_ids, discount_applies_to } = foundDiscount;

        let products = [];
        if (discount_applies_to === "all_products") {
            // Get all products
            products = await findAllProducts({
                filter: {
                    // product_shop: convertToObjectIdMongoDb(shopId),
                    product_shop: shopId,
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name"],
            });
        }

        if (discount_applies_to === "specific_products") {
            // Get specific product ids
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name"],
            });
        }

        return products;
    }

    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findAllDiscountCodesUnselect({
            limit: +limit,
            page: +page,
            sort: "ctime",
            filter: {
                discount_shopId: shopId,
                discount_is_active: true,
            },
            unSelect: ["__v", "discount_shopId"],
            model: discount,
        });

        return discounts;
    }
}

module.exports = DiscountService;
