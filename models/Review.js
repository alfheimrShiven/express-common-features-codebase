const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('./Bootcamp');
const User = require('./User');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for a review'],
        maxlength: 100,
    },
    text: {
        type: String,
        required: [true, 'Please add a some text'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1-10'],
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

module.exports = mongoose.model('Review', ReviewSchema);