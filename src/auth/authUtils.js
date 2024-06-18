"use strict";

const JWT = require("jsonwebtoken");

const asyncHandler = require("../helpers/asyncHandler");

const {
    CLIENT_ID,
    AUTHORIZATION,
    REFRESH_TOKEN,
} = require("../utils/headerKeys");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

/**
 * Creates a token pair consisting of an access token and a refresh token.
 */
const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "2 days",
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "7 days",
        });

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.log("error verify::", err);
            } else {
                console.log("decode verify::", decode);
            }
        });

        return { accessToken, refreshToken };
    } catch (error) {
        return {
            code: "xxx",
            message: error.message,
            status: "error",
        };
    }
};

/**
 * 1 - Check userId missing ???
 * 2 - Get accessToken
 * 3 - verify accessToken
 * 4 - Check user in dbs
 * 5 - Check keyStore with userId?
 * 6 - OK all => return next()
 */
const authentication = asyncHandler(async (req, res, next) => {
    const userId = req.headers[CLIENT_ID];
    if (!userId) throw new AuthFailureError("Invalid request!");

    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError("Not found keyStore!");

    const accessToken = req.headers[AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError("Invalid request!");

    try {
        const decodeUser = await JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) {
            throw new AuthFailureError("Invalid userId");
        }

        req.keyStore = keyStore;

        return next();
    } catch (error) {
        throw error;
    }
});

/**
 * Verifies a JSON Web Token (JWT) using the provided key secret.
 */
const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret);
};

const authenticationV2 = asyncHandler(async (req, res, next) => {
    const userId = req.headers[CLIENT_ID];
    if (!userId) throw new AuthFailureError("Invalid request!");

    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError("Not found keyStore!");

    if (req.headers[REFRESH_TOKEN]) {
        try {
            const refreshToken = req.headers[REFRESH_TOKEN];
            const decodeUser = await verifyJWT(
                refreshToken,
                keyStore.privateKey
            );
            if (userId !== decodeUser.userId) {
                throw new AuthFailureError("Invalid userId");
            }

            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;

            return next();
        } catch (error) {
            throw error;
        }
    }

    const accessToken = req.headers[AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError("Invalid request!");

    try {
        const decodeUser = await JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) {
            throw new AuthFailureError("Invalid userId");
        }

        req.keyStore = keyStore;
        req.user = decodeUser;

        return next();
    } catch (error) {
        throw error;
    }
});

module.exports = {
    createTokenPair,
    authentication,
    authenticationV2,
    verifyJWT,
};
