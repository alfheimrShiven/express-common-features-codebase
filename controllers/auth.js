const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

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
        return next(new ErrorResponse('Invalid Credentials', 400));
    }

    sendTokenResponse(user, 200, res);
});

// @desc      Get logged in User
// @route     POST /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc      Forgot Password
// @route     POST /api/v1/auth/me
// @access    Public
exports.forgotPassword = asyncHandler(async(req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        next(new ErrorResponse('No user found with that email', 404));
    }

    const resetToken = user.getResetPasswordToken();

    // saving the hashed reset token in the db
    await user.save({ validateBeforeSave: false });

    // sending the email

    // Step1: creating the reset url
    const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

    // Step 2 : Creating the message:
    const message = `You are receiving this email to reset your DevCamper password. Make PUT request to: \n\n ${resetUrl}`;

    // Step 2: using the sendEmail utility to fire an email
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message,
        });
        res.status(200).json({
            success: true,
            data: 'Email sent',
        });
    } catch (err) {
        console.log(`Error while sending password reset token email ${err}`);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }
});

// @desc      Reset Password
// @route     POST /api/v1/auth/resetPassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async(req, res, next) => {
    // Getting token and hash for matching
    const resetPasswordToken = crypto
        .createHash('SHA256')
        .update(req.params.resettoken)
        .digest('hex');

    // finding the user with the matching token
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    //set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc      Update user details
// @route     Put /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async(req, res, next) => {
    const fieldstoUpdate = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldstoUpdate, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc      Update Password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);

    res.status(200).json({
        success: true,
        data: user,
    });
});

// Helper Function: Generate token from User model, create cookie and send response

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