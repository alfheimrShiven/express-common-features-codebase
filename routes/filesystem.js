const express = require('express');
const router = express.Router();
const ErrorResponse = require('../utils/errorResponse');
const { createBucket, presignedURL } = require('../controllers/fileOps');

router.route('/createBucket').get(createBucket) ;
router.route('/getpresignedurl').get(presignedURL);
module.exports = router; 