"use strict";

const { Types } = require("mongoose");

const keyTokenModel = require("../models/keyToken.model");

class KeyTokenService {
    /**
     * Creates a key token for a user.
     * @param {Object} params - The parameters for creating the key token.
     * @param {string} params.userId - The ID of the user.
     * @param {string} params.publicKey - The public key.
     * @param {string} params.privateKey - The private key.
     * @param {string} params.refreshToken - The refresh token.
     * @returns {Promise<string|null>} The public key of the created key token, or null if creation failed.
     * @throws {Error} If an error occurs during the creation process.
     */
    static createKeyToken = async ({
        userId,
        publicKey,
        privateKey,
        refreshToken,
    }) => {
        try {
            // level xxx
            const filter = { user: userId };
            const update = {
                publicKey,
                privateKey,
                refreshTokensUsed: [],
                refreshToken,
            };
            const options = {
                upsert: true,
                new: true,
            };

            const tokens = await keyTokenModel.findOneAndUpdate(
                filter,
                update,
                options
            );

            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    };

    /**
     * Finds a key token by user ID.
     *
     * @param {string} userId - The ID of the user.
     * @returns {Promise<object|null>} A promise that resolves to the found key token object, or null if not found.
     */
    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({ user: userId }).lean();
    };

    /**
     * Removes a key token by its ID.
     * @param {string} id - The ID of the key token to be removed.
     * @returns {Promise} A promise that resolves to the result of the deletion operation.
     */
    static removeKeyById = async (id) => {
        return await keyTokenModel.deleteOne(id);
    };

    /**
     * Finds a key token by the refresh token used.
     *
     * @param {string} refreshToken - The refresh token used.
     * @returns {Promise<object|null>} A promise that resolves to the found key token or null if not found.
     */
    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keyTokenModel
            .findOne({
                refreshTokensUsed: refreshToken,
            })
            .lean();
    };

    /**
     * Finds a key token by its refresh token.
     *
     * @param {string} refreshToken - The refresh token to search for.
     * @returns {Promise<object|null>} - A promise that resolves to the found key token or null if not found.
     */
    static findByRefreshToken = async (refreshToken) => {
        return await keyTokenModel.findOne({
            refreshToken,
        });
    };

    /**
     * Deletes a key token by user ID.
     *
     * @param {string} userId - The ID of the user.
     * @returns {Promise<object>} A promise that resolves to the result of the deletion operation.
     */
    static deleteKeyById = async (userId) => {
        return await keyTokenModel.deleteOne({
            user: userId,
        });
    };
}

module.exports = KeyTokenService;
