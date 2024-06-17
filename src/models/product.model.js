"use strict";

// key [!dmbg] install by Mongo Snippets for Node-js

const { model, Schema } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// Declare the Schema of the Mongo model
const productSchema = new Schema(
    {
        product_name: {
            type: String,
            required: true,
        },
        product_thumb: {
            type: String,
            required: true,
        },
        product_description: String,
        product_price: {
            type: Number,
            required: true,
        },
        product_quantity: {
            type: Number,
            required: true,
        },
        product_type: {
            type: String,
            required: true,
            enum: ["Electronics", "Clothing", "Furniture", "Books", "Others"],
        },
        product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
        product_attributes: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

// define the product type = clothing
const clothingSchema = new Schema(
    {
        brand: {
            type: String,
            required: true,
        },
        size: {
            type: String,
            enum: ["S", "M", "L", "XL", "XXL"],
        },
        color: String,
        material: String,
    },
    {
        timestamps: true,
        collection: "Clothes",
    }
);

// define the product type = Electronics
const electronicSchema = new Schema(
    {
        manufacturer: {
            type: String,
            required: true,
        },
        model: String,
        color: String,
    },
    {
        timestamps: true,
        collection: "Electronics",
    }
);

//Export the model
module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    clothing: model("Clothing", clothingSchema),
    electronic: model("Electronic", electronicSchema),
};
