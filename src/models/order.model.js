"use strict";

// key [!dmbg] install by Mongo Snippets for Node-js

const { model, Schema } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

// Declare the Schema of the Mongo model
const orderSchema = new Schema(
    {
        order_userId: {
            type: Number,
            required: true,
        },
        /*
            order_checkout = {
                totalPrice: 0,
                totalApplyDiscount: 0,
                freeShip: 0,
            }
        */
        order_checkout: {
            type: Object,
            default: {},
        },
        /*
            order_shipping = {
                street: "string",
                city: "string",
                state: "string",
                country: "string",
            }
        */
        order_shipping: {
            type: Object,
            default: {},
        },
        order_payment: {
            type: Object,
            default: {},
        },
        order_products: {
            type: Array,
            required: true,
        },
        order_tracking_number: {
            type: String,
            required: true,
            default: "#000107072024", // serial number + date
        },
        order_status: {
            type: String,
            required: true,
            enum: [
                "pending",
                "confirmed",
                "shipped",
                "processing",
                "delivered",
                "completed",
                "cancelled",
            ],
            default: "pending",
        },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "modifiedOn",
        },
    }
);

//Export the model
module.exports = { order: model(DOCUMENT_NAME, orderSchema) };
