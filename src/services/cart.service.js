"use strict";

const { NotFoundError } = require("../core/error.response");
const { cart } = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");

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
                cart_products: product,
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

    // update cart
    /*
        shop_order_ids: [
            {
                shopId,
                item_products: [
                    {
                        shopId,
                        productId,
                        price,
                        quantity,
                        old_quantity,
                    }
                ],
                version
            },
        ]
    */
    static async updateCart({ userId, shop_order_ids = [] }) {
        const { productId, quantity, old_quantity } =
            shop_order_ids[0]?.item_products[0] || {};

        // check if product exists in cart
        const foundProduct = await getProductById(productId);
        if (!foundProduct) {
            throw new NotFoundError("Product not found");
        }

        // compare
        if (
            foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId
        ) {
            throw new NotFoundError("Product not belong to the shop");
        }

        if (quantity === 0) {
            // deleted product from cart
        }

        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity,
            },
        });
    }

    static async deleteUserCart({ userId, productId }) {
        const query = {
            cart_userId: userId,
            cart_state: "active",
        };
        const updateSet = {
            $pull: {
                cart_products: { productId },
            },
        };

        return await cart.updateOne(query, updateSet);
    }

    static async getListUserCart({ userId }) {
        return await cart.findOne({ cart_userId: +userId }).lean();
    }
}

module.exports = CartService;
