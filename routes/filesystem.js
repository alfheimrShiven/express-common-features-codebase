const express = require('express');
const router = express.Router();
const ErrorResponse = require('../utils/errorResponse');
const { createBucket } = require('../controllers/fileOps');

router.route('/createBucket').get(createBucket) ;

module.exports = router; 