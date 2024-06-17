"use strict";

const bcrypt = require("bcrypt");
const crypto = require("node:crypto");

const KeyTokenService = require("./keyToken.service");

const shopModel = require("../models/shop.model");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
    BadRequestError,
    ForbiddenError,
    AuthFailureError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};
class AccessService {
    /**
     * 1 - Check email in dbs
     * 2 - match password
     * 3 - create AccessToken, RefreshToken and save to dbs
     * 4 - generate token
     * 5 - get data user return login
     */
    static login = async ({ email, password, refreshToken = null }) => {
        const foundShop = await findByEmail({ email });

        if (!foundShop) throw new BadRequestError("Error: Shop not found!");

        const match = await bcrypt.compare(password, foundShop.password);
        if (!match) throw new AuthFailureError("Authentication failed!");

        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 4096,
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
        });

        const { _id: userId } = foundShop;

        const tokens = await createTokenPair(
            { userId, email },
            publicKey,
            privateKey
        );

        await KeyTokenService.createKeyToken({
            userId,
            refreshToken: tokens.refreshToken,
            publicKey,
            privateKey,
        });

        return {
            shop: getInfoData({
                fields: ["_id", "name", "email"],
                object: foundShop,
            }),
            tokens,
        };
    };

    /**
     * Sign up a new shop user.
     *
     * @param {Object} params - The sign up parameters.
     * @param {string} params.name - The name of the shop.
     * @param {string} params.email - The email of the shop.
     * @param {string} params.password - The password of the shop.
     * @returns {Object} - The response object containing the code and metadata.
     * @throws {ForbiddenError} - If the shop is already registered.
     * @throws {BadRequestError} - If there is an error creating the key store.
     */
    static signUp = async ({ name, email, password }) => {
        /** steps: check email exist?? */

        const holderShop = await shopModel.findOne({ email }).lean();
        if (holderShop) {
            throw new ForbiddenError("Error: Shop already registered!");
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
            // const publicKeyObject = crypto.createPublicKey(publicKeyString);

            // const privateKey = crypto.randomBytes(64).toString("hex");
            // const publicKey = crypto.randomBytes(64).toString("hex");

            console.log({ privateKey, publicKey }); // save collection keyStore

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            });

            if (!keyStore) {
                throw new BadRequestError("Error: keyStore!");
            }

            // create token pair
            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKey,
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
    };
}

module.exports = AccessService;
