"use strict";

const AccessService = require("../services/access.service");

class AccessController {
    signUp = async (req, res, next) => {
        const data = await AccessService.signUp(req.body);

        return res.status(201).json(data);
    };
}

module.exports = new AccessController();
