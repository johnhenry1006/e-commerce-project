"use strict";

const { BadRequestError } = require("../core/error.response");
const { inventory } = require("../models/inventory.model");
const { getProductById } = require("../models/repositories/product.repo");

class InventoryService {
    static async addStockInventory({
        productId,
        shopId,
        stock,
        location = "123, Tran Phu, HCM",
    }) {
        const product = await getProductById(productId);
        if (!product) {
            throw new BadRequestError("Product does not exist");
        }

        // add stock to inventory
        const query = {
            inventory_shopId: shopId,
            inventory_productId: productId,
        };

        const updateSet = {
            $inc: { inventory_stock: stock },
            $set: { inventory_location: location },
        };

        const options = { upsert: true, new: true };

        return await inventory.findOneAndUpdate(query, updateSet, options);
    }
}

module.exports = InventoryService;
