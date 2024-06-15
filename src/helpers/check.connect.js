"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");

const _SECONDS = 20000;

const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;

        /** maximum number of connections based on number of core */
        const maxConnections = numCores * 5;

        console.log("---------START----------");

        console.log(`Number of connections: ${numConnection}`);
        console.log(`Number of cores: ${numCores}`);
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);

        console.log("------------------------");

        if (numConnection > maxConnections) {
            console.log(`Maximum number of connections: ${maxConnections}`);
            console.log("Overload connection");
        }
    }, _SECONDS);
};

module.exports = { checkOverload };
