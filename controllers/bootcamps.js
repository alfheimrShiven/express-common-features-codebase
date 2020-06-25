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
    let query;
    let reqQuery = {...req.query };
    console.log(req.query);

    // removing "select" from req.query. "Select" is used to mention the fields we want to receive back while retrieving docs. It should not be used an a key to match docs
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach((param) => delete reqQuery[param]);
    console.log(reqQuery);

    // entertaining query operators
    let queryStr = JSON.stringify(reqQuery);
    // adding a dollar sign (acc. to the MongoDB query format)
    var dollar_queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => {
        return '$' + match;
    });

    // framing the query
    query = Bootcamp.find(JSON.parse(dollar_queryStr)).populate('courses');

    // framing the query to just get the mentioned 'select' fields
    if (req.query.select) {
        const select_fields = req.query.select.split(',').join(' ');
        query = query.select(select_fields); // mongoose function .select(keys/fields)
    }

    // framing the query to just get the mentioned 'sort' fields
    if (req.query.sort) {
        const sort_fields = req.query.sort.split(',').join(' ');
        query = query.sort(sort_fields); // mongoose function .sort (keys/fields)
    } else {
        query = query.sort('-createdAt');
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    const pagination = {};

    if (endIndex < total) {
        console.log('NEXT is there');
        pagination.next = {
            page: page + 1,
            limit,
        };
    }

    if (startIndex > 0) {
        console.log('PREV is there');
        pagination.prev = {
            page: page - 1,
            limit,
        };
    }

    query = query.skip(startIndex).limit(limit);

    const bootcamps = await query;
    if (!bootcamps) {
        return next(
            new ErrorResponse('Bootcamp not found with id of:' + req.params.id, 404)
        ); // accessing the error.js middleware with a new ErrorResponse obj
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
        pagination,
    });
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