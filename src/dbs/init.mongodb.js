"use strict";

const mongoose = require("mongoose");

const { db } = require("../configs/config.mongodb");

const { host, port, name } = db;
const connectString = `mongodb://${host}:${port}/${name}`;

class Database {
    constructor() {
        this._connect();
    }

    _connect() {
        if (1 === 1) {
            mongoose.set("debug", true);
            mongoose.set("debug", { color: true });
        }

        mongoose
            .connect(connectString, {
                maxPoolSize: 50,
            })
            .then((e) => {
                console.log("Database connection successful");
            })
            .catch((err) => {
                console.error("Database connection error");
            });
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Database();
        }

        return this.instance;
    }
}

const instanceMongoDB = Database.getInstance();

module.exports = instanceMongoDB;
