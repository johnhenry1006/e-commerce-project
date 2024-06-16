"use strict";

// key [!dmbg] install by Mongo Snippets for Node-js

const { model, Schema, Types } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "token";
const COLLECTION_NAME = "tokens";

// Declare the Schema of the Mongo model
const keyTokenSchema = new Schema(
    {
        user: {
            type: String,
            required: true,
            trim: true,
        },
        publicKey: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

//Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema);
