"use strict";

const _ = require("lodash");

const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields);
};

/** ['a', 'ab'] = {a: 1, b: 1} */
const getSelectedData = (select = []) => {
    return Object.fromEntries(select.map((field) => [field, 1]));
};

const unGetSelectedData = (select = []) => {
    return Object.fromEntries(select.map((field) => [field, 0]));
};

module.exports = {
    getInfoData,
    getSelectedData,
    unGetSelectedData,
};
