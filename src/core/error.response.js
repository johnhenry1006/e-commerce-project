"use strict";

const StatusCode = {
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
};

const ReasonStatusCode = {
    BAD_REQUEST: "Bad Request error",
    FORBIDDEN: "Forbidden error",
    NOT_FOUND: "Not found",
    CONFLICT: "Conflict error",
};

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(
        message = ReasonStatusCode.CONFLICT,
        statusCode = StatusCode.CONFLICT
    ) {
        super(message, statusCode);
    }
}

class BadRequestError extends ErrorResponse {
    constructor(
        message = ReasonStatusCode.BAD_REQUEST,
        statusCode = StatusCode.BAD_REQUEST
    ) {
        super(message, statusCode);
    }
}

class ForbiddenError extends ErrorResponse {
    constructor(
        message = ReasonStatusCode.FORBIDDEN,
        statusCode = StatusCode.FORBIDDEN
    ) {
        super(message, statusCode);
    }
}

class NotFoundError extends ErrorResponse {
    constructor(
        message = ReasonStatusCode.NOT_FOUND,
        statusCode = StatusCode.NOT_FOUND
    ) {
        super(message, statusCode);
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
    ForbiddenError,
    NotFoundError,
};
