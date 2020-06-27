const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc      Register User
// @route     POST /api/v1/auth/register
// @access    Public

exports.register = asyncHandler(async(req, res, next) => {
    const { name, email, password, role } = req.body;

    //Creating a doc for this user in the db
    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    // Create Token (by running the method )
    sendTokenResponse(user, 200, res);
});

// @desc      Login User
// @route     POST /api/v1/auth/login
// @access    Public

exports.login = asyncHandler(async(req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password (since model validation isn't being used)
    if (!email || !password)
        return next(new ErrorResponse('Please provide an email & password', 400));

    //Check for user (on the model)
    const user = await User.findOne({ email }).select('+password');
    console.log(user);
    if (!user) {
        return next(new ErrorResponse('Invalid Credentials', 401));
    }

    // Checking if password matches (on the returned obj)
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Please provide an email & password', 400));
    }

    sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
    });
};