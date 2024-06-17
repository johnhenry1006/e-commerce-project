"use strict";

const AccessService = require("../services/access.service");

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class AccessController {
    /**
     * Handles the login functionality.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the login process is complete.
     */
    login = async (req, res, next) => {
        const metadata = await AccessService.login(req.body);

        new SuccessResponse({
            metadata,
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
        const metadata = await AccessService.signUp(req.body);

        new CREATED({
            message: "Registered OK!",
            metadata,
            options: { limit: 10 },
        }).send(res);
    };
}

module.exports = new AccessController();
