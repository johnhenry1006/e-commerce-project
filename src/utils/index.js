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

const removeUndefinedObject = (obj) => {
    Object.keys(obj).forEach((key) => {
        if ([undefined, null, ""].includes(obj[key])) {
            delete obj[key];
        }
    });

    return obj;
};

const updateNestedObjectParser = (obj) => {
    // console.log("[1]::", obj);
    const final = {};

    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
            const response = updateNestedObjectParser(obj[key]);

            Object.keys(response).forEach((subKey) => {
                final[`${key}.${subKey}`] = response[subKey];
            });
        } else {
            final[key] = obj[key];
        }
    });

    // console.log("[2]::", final);

    return final;
};

module.exports = {
    getInfoData,
    getSelectedData,
    unGetSelectedData,
    removeUndefinedObject,
    updateNestedObjectParser,
};
