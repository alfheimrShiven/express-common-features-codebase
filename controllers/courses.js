const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public

exports.getCourses = asyncHandler(async(req, res, next) => {
    let query;
    if (req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId });
    } else {
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description',
        });
    }

    const courses = await query;

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
    });
});

// @desc      Get course with specific ID
// @route     GET /api/v1/courses/:id
// @access    Public

exports.getCourse = asyncHandler(async(req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description',
    });

    // Handling Errors
    if (!course) {
        return next(
            new ErrorResponse('No course found with ID:' + req.params.id, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: course,
    });
});

//@desc     Add course to specific bootcamp
//@route    POST /api/v1/bootcamp/:bootcampId/course
//@access   Public

exports.addCourse = asyncHandler(async(req, res, next) => {
    // Step1: Checking whether the Bootcamp exists or not
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(
                'No bootcamp exists with ID:' + req.params.bootcampId,
                404
            )
        );
    }

    // Step 2: Add course
    const course = await Course.create(req.body);
    res.status(200).json({
        success: true,
        data: course,
    });
});

//@desc     Update Course
//@route    PUT /api/v1/course/:id
//@access   Private

exports.updateCourse = asyncHandler(async(req, res, next) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!course) {
        return next(
            new ErrorResponse('No course exists with ID:' + req.params.courseId, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: course,
    });
});

//@desc     Delete Course
//@route    DELETE /api/v1/course/:id
//@access   Private

exports.deleteCourse = asyncHandler(async(req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse('No course exists with ID:' + req.params.courseId, 404)
        );
    }

    await course.remove();
    res.status(200).json({
        success: true,
        data: {},
    });
});