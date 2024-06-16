"use strict";

const AccessService = require("../services/access.service");

class AccessController {
    signUp = async (req, res, next) => {
        try {
            console.log("[P]::Signup::", req.body);

            const data = await AccessService.signUp(req.body);

            return res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new AccessController();
