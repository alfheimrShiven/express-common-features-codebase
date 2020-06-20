const ErrorResponse = require('../utils/errorResponse');
const colors = require('colors');

const errorHandler = (err, req, res, next) => {
    let error = {...err }; // spread operator turning iterable value into distinctive values
    error.message = err.message;

    //Log to console for dev
    console.log(colors.red(err));

    // creating statusCode based on the err name
    if (err.name === 'CastError') {
        const message =
            'Bootcamp not found with id of because of the ID being unformarted:' +
            err.value;
        error = new ErrorResponse(message, 404);
    }

    //Mongoose Duplicate Key error
    if (err.code === 11000) {
        const message = 'Duplicate Field Value entered';
        error = new ErrorResponse(message, 400);
    }

    // Mongoose Validation error
    if (err.name === 'ValidationError') {
        const message = 'Validation Error boss';
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
    });
};

module.exports = errorHandler;