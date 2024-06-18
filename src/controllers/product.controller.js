"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.xxx");

class ProductController {
    createProduct = async (req, res, next) => {
        // new SuccessResponse({
        //     message: "Product created successfully",
        //     metadata: await ProductService.createProduct(
        //         req.body.product_type,
        //         {
        //             ...req.body,
        //             product_shop: req.user.userId,
        //         }
        //     ),
        // }).send(res);

        new SuccessResponse({
            message: "Product created successfully",
            metadata: await ProductServiceV2.createProduct(
                req.body.product_type,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Product published successfully",
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Product unPublished successfully",
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list drafts retrieved successfully",
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list publish retrieved successfully",
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list search retrieved successfully",
            metadata: await ProductServiceV2.searchProducts(req.params),
        }).send(res);
    };
}

module.exports = new ProductController();
