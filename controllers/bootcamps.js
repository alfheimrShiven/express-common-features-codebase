const path = require('path');
const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
// const slugify = require('slugify');

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async(req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc      Get specific bootcamp
// @route     GET /api/v1/bootcamps/id
// @access    Public
exports.getBootcamp = asyncHandler(async(req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    // will run incase the ID is properly formatted but no doc having that ID
    if (!bootcamp) {
        next(
            new ErrorResponse('Bootcamp not found with id of:' + req.params.id, 404)
        ); // accessing the error.js middleware with a new ErrorResponse obj
    } else {
        res.status(200).json({
            success: true,
            data: bootcamp,
        });
    }
});

// @desc      Create a bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = asyncHandler(async(req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    // If the user is not an admin, they can upload only ONE bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                'The user with id ' + req.user.id + ' has already published a bootcamp',
                400
            )
        );
    }

    const bootcamp = await Bootcamp.create(req.body);

    if (!bootcamp) {
        return next(
            new ErrorResponse('Bootcamp not found with id of:' + req.params.id, 404)
        ); // accessing the error.js middleware with a new ErrorResponse obj
    }
    res.status(201).json({
        success: true,
        data: bootcamp,
    });
});

// @desc      Update bootcamps
// @route     PUT /api/v1/bootcamps
// @access    Public
exports.updateBootcamp = asyncHandler(async(req, res, next) => {
    const updated_bootcamp = await Bootcamp.findByIdAndUpdate(
        req.params.id,
        req.body, {
            runValidators: true,
            new: true,
        }
    );

    if (!updated_bootcamp) {
        res.status(400).json({
            success: false,
            data: null,
        });
    } else {
        res.status(200).json({
            success: true,
            data: updated_bootcamp,
        });
    }
});

// @desc      Delete bootcamps
// @route     POST /api/v1/bootcamps
// @access    Public
exports.deleteBootcamp = asyncHandler(async(req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        res.status(400).json({
            success: false,
        });
    } else {
        bootcamp.remove();
        res.status(200).json({
            success: true,
            data: null,
        });
    }
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(async(req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [
                    [lng, lat], radius
                ] } },
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    });
});

// @desc      Upload photo for bootcamps
// @route     PUT /api/v1/bootcamps/:id/photo
// @access    Private
exports.bootcampPhotoUpload = asyncHandler(async(req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse('Bootcamp not found with id: ' + req.params.id, 404)
        );
    }

    if (!req.files) {
        return next(new ErrorResponse('Please upload the file', 400));
    }

    const file = req.files.file;

    // make sure file is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                'Please upload an image less than ' + process.env.MAX_FILE_UPLOAD,
                400
            )
        );
    }

    // creating a custom file name to prevent overriding incase of same name
    file.name = 'photo_' + bootcamp._id + path.parse(file.name).ext; // using path module to add extention to the modified filename

    // mv function is present in the file object check console.log(file) is used to move files
    file.mv(process.env.FILE_UPLOAD_PATH + '/' + file.name, async(err) => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse('Problem with file upload', 500));
        }

        // finally updating the db
        await Bootcamp.findByIdAndUpdate(req.params.id, {
            photo: file.name,
        });

        res.status(200).json({
            success: true,
            data: file.name,
        });
    });
});