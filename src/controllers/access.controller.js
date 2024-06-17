"use strict";

const AccessService = require("../services/access.service");

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class AccessController {
    /**
     * Handles the refresh token request.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the response is sent.
     */
    handlerRefreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: "Refresh token OK!",
            metadata: await AccessService.handlerRefreshToken(
                req.body.refreshToken
            ),
        }).send(res);
    };

    /**
     * Logout user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the logout process is complete.
     */
    logout = async (req, res, next) => {
        new SuccessResponse({
            message: "Logout OK!",
            metadata: await AccessService.logout(req.keyStore),
        }).send(res);
    };

    /**
     * Handles the login functionality.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the login process is complete.
     */
    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.login(req.body),
        }).send(res);
    };

    /**
     * Handles the sign up functionality.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the sign up process is completed.
     */
    signUp = async (req, res, next) => {
        new CREATED({
            message: "Registered OK!",
            metadata: await AccessService.signUp(req.body),
            options: { limit: 10 },
        }).send(res);
    };
}

module.exports = new AccessController();
