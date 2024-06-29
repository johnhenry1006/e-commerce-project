"use strict";

const { max } = require("lodash");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { discount } = require("../models/discount.model");
const { convertToObjectIdMongoDb } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
    findAllDiscountCodesUnselect,
    checkDiscountCodeExists,
} = require("../models/repositories/discount.repo");

/**
 * Discount Service
 * 1 - Generator discount code [Shop | Admin]
 * 2 - Get all discount codes [User | Shop]
 * 3 - Get all product by discount code [User]
 * 4 - Get discount amount [User]
 * 5 - Delete discount code [Admin | Shop]
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

    /*
        Apply discount code
        products = [
            {
                productId: "60f7a5a8d1f9b4c6b2b9d3a1",
                shopId: "60f7a5a8d1f9b4c6b2b9d3a1",
                quantity: 2
                name: "product 1",
                price: 100,
            },
            {
                productId: "60f7a5a8d1f9b4c6b2b9d3a2",
                shopId: "60f7a5a8d1f9b4c6b2b9d3a1",
                quantity: 1
                name: "product 2",
                price: 200,
            }
        ]
    */
    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        console.log("getDiscountAmount", { codeId, userId, shopId, products });
        // create index for discount code
        const foundDiscount = await checkDiscountCodeExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: shopId,
                // discount_shopId: convertToObjectIdMongoDb(shopId),
            },
        });

        if (!foundDiscount) {
            throw new NotFoundError("Discount not found");
        }

        const {
            discount_is_active,
            discount_max_uses,
            discount_start_date,
            discount_end_date,
            discount_min_order_value,
            discount_max_uses_per_user,
            discount_users_used,
            discount_value,
            discount_type,
        } = foundDiscount;

        if (!discount_is_active) throw new NotFoundError("Discount expired!");

        if (!discount_max_uses) throw new NotFoundError("Discount are out!");

        if (
            new Date() < new Date(discount_start_date) ||
            new Date() > new Date(discount_end_date)
        ) {
            throw new NotFoundError("Discount expired!");
        }

        // check discount the value min order
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            // Get total order
            totalOrder = products.reduce((acc, { price, quantity }) => {
                return acc + price * quantity;
            }, 0);

            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(
                    `Minimum order value is ${discount_min_order_value}`
                );
            }
        }

        if (discount_max_uses_per_user > 0) {
            // Check if user use discount code
            const userUsedDiscount = discount_users_used.find(
                (user) => user.userId === userId
            );

            if (userUsedDiscount) {
                // Check if user used discount code
                // ...
            }
        }

        // check discount the value fixed_amount or percentage
        const amount =
            discount_type === "fixed_amount"
                ? discount_value
                : totalOrder * (discount_value / 100);

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount,
        };
    }

    static async deleteDiscountCode({ codeId, shopId }) {
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: shopId,
            // discount_shopId: convertToObjectIdMongoDb(shopId),
        });

        return deleted;
    }

    /*
        Cancel discount code
        userId = "60f7a5a8d1f9b4c6b2b9d3a1"
    */
    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await checkDiscountCodeExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: shopId,
                // discount_shopId: convertToObjectIdMongoDb(shopId),
            },
        });

        if (!foundDiscount) {
            throw new NotFoundError("Discount not found");
        }

        const result = await discount.findByIdAndDelete(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1,
            },
        });

        return result;
    }
}

module.exports = DiscountService;
