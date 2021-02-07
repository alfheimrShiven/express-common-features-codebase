const express = require('express');
const router = express.Router();
const ErrorResponse = require('../utils/errorResponse');
const { createBucket, presignedURL, generatePreSignedURL } = require('../controllers/fileOps');

router.route('/createBucket').get(createBucket) ;
router.route('/getpresignedurl').get(generatePreSignedURL);
module.exports = router; 