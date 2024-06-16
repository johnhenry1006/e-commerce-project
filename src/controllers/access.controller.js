"use strict";

const AccessService = require("../services/access.service");

const { OK, CREATED } = require("../core/success.response");
class AccessController {
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
