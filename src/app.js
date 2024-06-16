require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");

const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// parse JSON bodies
app.use(express.json());
// parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// init db
require("./dbs/init.mongodb");

// const { checkOverload } = require("./helpers/check.connect");
// checkOverload();

// init routes
app.use("/", require("./routes"));

// handle errors

module.exports = app;
