"use strict";

// key [!dmbg] install by Mongo Snippets for Node-js

const { model, Schema } = require("mongoose"); // Erase if already required
const slugify = require("slugify");

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
        product_slug: String, // aaa-bbb-ccc
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
        product_ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, "Rating must be above 1.0"],
            max: [5, "Rating must be below 5.0"],
            // 4.3456666 => 4.3
            set: (val) => Math.round(val * 10) / 10,
        },
        product_variations: {
            type: Array,
            default: [],
        },
        isDraft: { type: Boolean, default: true, index: true, select: false },
        isPublished: {
            type: Boolean,
            default: false,
            index: true,
            select: false,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

// create index for search
productSchema.index({ product_name: "text", product_description: "text" });

// Document middleware: runs before .save() and .create()
productSchema.pre("save", function (next) {
    this.product_slug = slugify(this.product_name, { lower: true });
    next();
});

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
        product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
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
        product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    },
    {
        timestamps: true,
        collection: "Electronics",
    }
);

// define the product type = Books
const bookSchema = new Schema(
    {
        brand: {
            type: String,
            required: true,
        },
        size: String,
        material: String,
        product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    },
    {
        timestamps: true,
        collection: "Books",
    }
);

//Export the model
module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    clothing: model("Clothing", clothingSchema),
    electronic: model("Electronic", electronicSchema),
    book: model("Book", bookSchema),
};
