const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public

exports.getCourses = asyncHandler(async(req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });
        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses,
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
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
//@access   Private

exports.addCourse = asyncHandler(async(req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

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
    // Make sure user is bootcamp owner (course is associated to the bootcamp)
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to add a course to ${bootcamp._id}`,
                401
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
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse('No course exists with ID:' + req.params.courseId, 404)
        );
    }

    // Make sure user is bootcamp owner (course is associated to the bootcamp)
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update a course to course to ${course._id}`,
                401
            )
        );
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

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

    // Make sure user is bootcamp owner (course is associated to the bootcamp)
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update a course to course to ${course._id}`,
                401
            )
        );
    }

    await course.remove();

    res.status(200).json({
        success: true,
        data: {},
    });
});