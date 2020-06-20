// This class is added to add a property of statusCode to the parent Error class in order to be used in the (common) error.js middleware
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message), (this.statusCode = statusCode);
    }
}

module.exports = ErrorResponse;