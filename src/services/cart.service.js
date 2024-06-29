"use strict";

const { cart } = require("../models/cart.model");

/*
    Key features: Cart Service
        1 - Add product to cart [USER]
        2 - Reduce product quantity [USER]
        3 - Increase product quantity [USER]
        4 - Get list to cart [USER]
        5 - Delete cart [USER]
        6 - Delete cart item [USER]
*/
class CartService {
    // START REPO CART
    static async createUserCart({ userId, product }) {
        const query = { cart_userId: userId, cart_state: "active" };
        const updateOrInsert = {
            $addToSet: {
                cart_products: [product],
            },
        };

        const options = { upsert: true, new: true };

        return await cart.findOneAndUpdate(query, updateOrInsert, options);
    }

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product;
        const query = {
            cart_userId: userId,
            "cart_products.productId": productId,
            cart_state: "active",
        };

        const updateSet = {
            $inc: {
                "cart_products.$.quantity": quantity,
            },
        };

        const options = { upsert: true, new: true };

        return await cart.findOneAndUpdate(query, updateSet, options);
    }
    // END REPO CART

    static async addToCart({ userId, product = {} }) {
        const userCart = await cart.findOne({ cart_userId: userId });
        if (!userCart) {
            // create new cart for user
            return await CartService.createUserCart({ userId, product });
        }

        // update product in cart
        if (!userCart.cart_products.length) {
            userCart.cart_products = [product];

            return await userCart.save();
        }

        // update product quantity in cart
        return await CartService.updateUserCartQuantity({ userId, product });
    }
}

module.exports = CartService;
