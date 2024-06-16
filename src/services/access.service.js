"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const KeyTokenService = require("./keyToken.service");

const shopModel = require("../models/shop.model");
const createTokenPair = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};
class AccessService {
    static signUp = async ({ name, email, password }) => {
        try {
            /** steps: check email exist?? */

            const holderShop = await shopModel.findOne({ email }).lean();
            if (holderShop) {
                return {
                    code: "xxxx",
                    message: "Shop already exist",
                };
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const newShop = await shopModel.create({
                name,
                email,
                password: passwordHash,
                roles: [RoleShop.SHOP],
            });

            if (newShop) {
                // created privateKey and publicKey
                const { privateKey, publicKey } = crypto.generateKeyPairSync(
                    "rsa",
                    {
                        modulusLength: 4096,
                        publicKeyEncoding: { type: "spki", format: "pem" },
                        privateKeyEncoding: { type: "pkcs8", format: "pem" },
                    }
                );

                console.log({ privateKey, publicKey }); // save collection keyStore

                const publicKeyString = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                });

                if (!publicKeyString) {
                    return {
                        code: "xxx",
                        message: "Error create publicKey",
                    };
                }

                const publicKeyObject = crypto.createPublicKey(publicKeyString);

                // create token pair
                const tokens = await createTokenPair(
                    { userId: newShop._id, email },
                    publicKeyString,
                    privateKey
                );

                console.log("Created token success::", tokens);

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({
                            fields: ["_id", "name", "email"],
                            object: newShop,
                        }),
                        tokens,
                    },
                };
            }

            return {
                code: 200,
                metadata: null,
            };
        } catch (error) {
            return {
                code: "xxx",
                message: error.message,
                status: "error",
            };
        }
    };
}

module.exports = AccessService;
