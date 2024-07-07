"use strict";

const { BadRequestError } = require("../core/error.response");
const { order } = require("../models/order.model");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const DiscountService = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");

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
    static async checkoutReview({ userId, cartId, shop_order_ids }) {
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

    // order
    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {},
    }) {
        const { shop_order_ids_new, checkout_order } =
            await CheckoutService.checkoutReview({
                userId,
                cartId,
                shop_order_ids,
            });

        // check product available
        const products = shop_order_ids_new.flatMap(
            (order) => order.item_products
        );
        console.log("[1]::", products);

        let acquireProduct = [];

        for (let i = 0; i < products.length; i++) {
            const { productId, quantity } = products[i];

            const keyLock = await acquireLock(productId, quantity, cartId);
            acquireProduct.push(keyLock ? true : false);

            if (keyLock) {
                await releaseLock(keyLock);
            }
        }

        // check if it has a product in store
        if (acquireProduct.includes(false)) {
            throw new BadRequestError("product is updated, please try again");
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new,
        });

        // Case:  order thanh cong, remove product from cart
        if (newOrder) {
            // remove product in my cart
        }

        return newOrder;
    }

    /*
        1> Query Orders [Users]
    */
   static async getOrdersByUser() {
   }

    /*
        1> Query Order Using Id [Users]
    */
   static async getOneOrderByUser() {
   }

    /*
        1> Cancel Order [Users]
    */
   static async cancelOrderByUser() {
   }

    /*
        1> Update Order Status [Shop | Admin]
    */
   static async updateOrderStatusByShop() {
   }
}

module.exports = CheckoutService;
