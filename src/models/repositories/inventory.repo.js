"use strict";

const { inventory } = require("../inventory.model");

const insertInventory = async ({
    productId,
    shopId,
    stock,
    location = "unknown",
}) => {
    return await inventory.create({
        inventory_productId: productId,
        inventory_shopId: shopId,
        inventory_stock: stock,
        inventory_location: location,
    });
};

const reservationInventory = async ({ productId, cartId, quantity }) => {
    const query = {
        inventory_productId: productId,
        inventory_stock: { $gte: quantity },
    };

    const updateSet = {
        $inc: { inventory_stock: -quantity },
        $push: {
            inventory_reservations: {
                cartId,
                quantity,
                createdOn: new Date(),
            },
        },
    };

    const options = { upsert: true, new: true };

    return await inventory.updateOne(query, updateSet);
};

module.exports = { insertInventory, reservationInventory };
