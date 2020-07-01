const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('./Bootcamp');
const User = require('./User');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a course title'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    weeks: {
        type: String,
        required: [true, 'Please add a number of weeks'],
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost'],
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced'],
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
});

CourseSchema.statics.getAverageCost = async function(bootcampId) {
    const objArr = await this.aggregate([{
            $match: { bootcamp: bootcampId },
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' },
            },
        },
    ]);
    console.log(objArr[0]);
    // updating the avg cost of bootcamp in the db
    try {
        console.log('About to update bootcamp:' + bootcampId);
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(objArr[0].averageCost / 10) * 10,
        });
        console.log('Bootcamp schema updated');
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageCost after save
CourseSchema.post('save', function() {
    this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre('remove', function() {
    this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);