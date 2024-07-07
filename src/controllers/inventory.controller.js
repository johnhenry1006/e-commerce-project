"use strict";

const { SuccessResponse } = require("../core/success.response");
const InventoryService = require("../services/inventory.sevice");

class InventoryController {
    addStockInventory = async (req, res, next) => {
        new SuccessResponse({
            message: "addStockInventory successfully",
            metadata: await InventoryService.addStockInventory(req.body),
        }).send(res);
    };
}

module.exports = new InventoryController();
