"use strict";

const { BadRequestError } = require("../core/error.response");
const {
    product,
    clothing,
    electronic,
    book,
} = require("../models/product.model");
const {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
} = require("../models/repositories/product.repo");

// Define factory class to create product
class ProductFactory {
    static productRegistry = {}; // key class reference

    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) {
            throw new BadRequestError(`Invalid product type ${type}`);
        }

        return new productClass(payload).createProduct();
    }

    // PUT
    static async publishProductByShop({ product_id, product_shop }) {
        return await publishProductByShop({ product_id, product_shop });
    }

    static async unPublishProductByShop({ product_id, product_shop }) {
        return await unPublishProductByShop({ product_id, product_shop });
    }

    // Query
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true };

        return await findAllDraftsForShop({ query, limit, skip });
    }

    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true };

        return await findAllPublishForShop({ query, limit, skip });
    }

    static async searchProducts({ keySearch }) {
        return await searchProductByUser({ keySearch });
    }
}

// Define base product class
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes,
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    // create new product
    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id });
    }
}

// Define sub-class for different product types Clothing
class Clothing extends Product {
    // create new clothing product
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newClothing) {
            throw new BadRequestError("Failed to create new clothing product");
        }

        const newProduct = await super.createProduct();
        if (!newProduct) {
            throw new BadRequestError("Failed to create new product");
        }

        return newProduct;
    }
}

// Define sub-class for different product types Electronics
class Electronic extends Product {
    // create new clothing product
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newElectronic) {
            throw new BadRequestError(
                "Failed to create new electronic product"
            );
        }

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) {
            throw new BadRequestError("Failed to create new product");
        }

        return newProduct;
    }
}

// Define sub-class for different product types Books
class Book extends Product {
    // create new Book product
    async createProduct() {
        const newBook = await book.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newBook) {
            throw new BadRequestError(
                "Failed to create new electronic product"
            );
        }

        const newProduct = await super.createProduct(newBook._id);
        if (!newProduct) {
            throw new BadRequestError("Failed to create new product");
        }

        return newProduct;
    }
}

// Register product types
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Electronics", Electronic);
ProductFactory.registerProductType("Books", Book);

module.exports = ProductFactory;
