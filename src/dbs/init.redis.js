"use strict";

const redis = require("redis");
const { RedisErrorResponse } = require("../core/error.response");

let client = {};
let connectionTimeout;

let statusConnectRedis = {
    CONNECT: "connect",
    END: "end",
    RECONNECT: "reconnecting",
    ERROR: "error",
};

const REDIS_CONNECT_TIMEOUT = 10000;
const REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: {
        vn: "Redis loi ket noi",
        en: "Redis connect timeout",
    },
};

const handleEventConnection = (connectionRedis) => {
    connectionRedis.on(statusConnectRedis.CONNECT, () => {
        console.log("Redis connected");
        clearTimeout(connectionTimeout);
    });

    connectionRedis.on(statusConnectRedis.END, () => {
        console.log("Redis end");
        // connect retry
        handleTimeoutError();
    });

    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log("Redis reconnecting");
        clearTimeout(connectionTimeout);
    });

    connectionRedis.on(statusConnectRedis.ERROR, (error) => {
        console.log("Redis error::", error);
        // connect retry
        handleTimeoutError();
    });
};

const handleTimeoutError = () => {
    connectionTimeout = setTimeout(() => {
        throw new RedisErrorResponse({
            message: REDIS_CONNECT_MESSAGE.message.vn,
            statusCode: REDIS_CONNECT_MESSAGE.code,
        });
    }, REDIS_CONNECT_TIMEOUT);
};

const initRedis = () => {
    const instanceRedis = redis.createClient();

    client.instanceConnect = instanceRedis;

    handleEventConnection(instanceRedis);
};

const getRedis = () => client;

const closeRedis = () => {
    client.instanceConnect.quit();
};

module.exports = {
    initRedis,
    getRedis,
    closeRedis,
};
