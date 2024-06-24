"use strict";

const { Types } = require("mongoose");
const { product } = require("../product.model");
const { getSelectedData, unGetSelectedData } = require("../../utils");

const findAllDraftsForShop = async ({ query, limit, skip }) => {
    return queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
    return queryProduct({ query, limit, skip });
};

const searchProductByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch);

    const results = await product
        .find(
            {
                isDraft: false,
                $text: { $search: regexSearch },
            },
            { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .lean();

    return results;
};

const publishProductByShop = async ({ product_id, product_shop }) => {
    const foundShop = await product.findOne({
        product_shop,
        _id: product_id,
    });
    if (!foundShop) return null;

    // Specify the update
    const filter = { _id: product_id, product_shop };
    const update = { isDraft: false, isPublished: true };

    const { modifiedCount } = await product.updateOne(filter, update);

    return modifiedCount;
};

const unPublishProductByShop = async ({ product_id, product_shop }) => {
    const foundShop = await product.findOne({
        product_shop,
        _id: product_id,
    });
    if (!foundShop) return null;

    // Specify the update
    const filter = { _id: product_id, product_shop };
    const update = { isDraft: true, isPublished: false };

    const { modifiedCount } = await product.updateOne(filter, update);

    return modifiedCount;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = (sort = "ctime" ? { _id: -1 } : { _id: -1 });

    const products = await product
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectedData(select))
        .lean();

    return products;
};

const findProduct = async ({ product_id, unSelect }) => {
    const products = await product
        .findById(product_id)
        .select(unGetSelectedData(unSelect))
        .lean();

    return products;
};

const updateProductById = async ({
    productId,
    bodyUpdate,
    model,
    isNew = true,
}) => {
    return await model.findByIdAndUpdate(productId, bodyUpdate, { new: isNew });
};

const queryProduct = async ({ query, limit, skip }) => {
    return await product
        .find(query)
        .populate("product_shop", "name email -_id")
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

module.exports = {
    findAllDraftsForShop,
    findAllPublishForShop,
    findAllProducts,
    findProduct,
    searchProductByUser,
    publishProductByShop,
    unPublishProductByShop,
    updateProductById,
};
