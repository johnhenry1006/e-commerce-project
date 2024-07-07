"use strict";

const { BadRequestError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const DiscountService = require("./discount.service");

class CheckoutService {
    // login and without login
    /*
        {
            cartId: "string",
            userId: "string",
            shop_order_ids: [
                {
                    shopId: "string",
                    shop_discounts: [],
                    item_products: [
                        {
                            productId: "string",
                            price: "number",
                            quantity: "number",
                        }
                    ],
                },
                {
                    shopId: "string",
                    shop_discounts: [
                        {
                            shopId: "string",
                            discountId: "string",
                            codeId: "string",
                        }
                    ],
                    item_products: [
                        {
                            productId: "string",
                            price: "number",
                            quantity: "number",
                        }
                    ],
                },
            ]
        }
    */
    static async checkoutOrder({ userId, cartId, shop_order_ids }) {
        // check cartId
        const foundCart = await findCartById(cartId);
        if (!foundCart) {
            throw new BadRequestError("Cart dose not exist");
        }

        const checkout_order = {
            totalPrice: 0, // total price of all products
            freeShip: 0, // free ship
            totalDiscount: 0, // total discount
            totalCheckout: 0, // total checkout
        };

        const shop_order_ids_new = [];

        for (const shop_order_id of shop_order_ids) {
            const {
                shopId,
                shop_discounts = [],
                item_products = [],
            } = shop_order_id || {};

            // check product available
            const checkProductServer = await checkProductByServer(
                item_products
            );
            console.log("checkProductServer::", checkProductServer);
            if (!checkProductServer[0]) {
                throw new BadRequestError("Order wrong!!!");
            }

            // calculate total price
            const checkoutPrice = checkProductServer.reduce(
                (total, product) => total + product.price * product.quantity,
                0
            );

            checkout_order.totalPrice += checkoutPrice;

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // money after discount
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer,
            };

            // if shop_discounts exist > 0, check discount
            if (shop_discounts.length > 0) {
                // sample has a discount
                // Get amount of discount

                const { totalPrice = 0, discount = 0 } =
                    await DiscountService.getDiscountAmount({
                        codeId: shop_discounts[0].codeId,
                        userId,
                        shopId,
                        products: checkProductServer,
                    });

                console.log("totalPrice::", totalPrice);
                console.log("discount::", discount);

                // total discount
                checkout_order.totalDiscount += discount;

                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount;
                }
            }

            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
            shop_order_ids_new.push(itemCheckout);
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order,
        };
    }
}

module.exports = CheckoutService;
