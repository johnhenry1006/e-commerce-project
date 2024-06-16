const dev = {
    host: process.env.DEV_DB_HOST,
    port: process.env.DEV_DB_PORT,
    name: process.env.DEV_DB_NAME,
    user: process.env.DEV_DB_USER,
    pass: process.env.DEV_DB_PASS,
};

const pro = {
    host: process.env.PRO_DB_HOST,
    port: process.env.PRO_DB_PORT,
    name: process.env.PRO_DB_NAME,
    user: process.env.PRO_DB_USER,
    pass: process.env.PRO_DB_PASS,
};

const config = { dev, pro };

const env = process.env.NODE_ENV || "dev";

module.exports = config[env];
