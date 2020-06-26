const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc      Register User
// @route     GET /api/v1/auth/register
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

    res.status(200).json({
        success: true,
    });
});