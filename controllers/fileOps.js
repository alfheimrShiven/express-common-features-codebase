const asyncHandler = require('../middleware/async');
// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('uuid');
const ErrorResponse = require('../utils/errorResponse');

exports.createBucket = asyncHandler(async(req, res, next) => {
// Create unique bucket name
var bucketName = 'alfheimrdocs-' + uuid.v4();
// Create name for uploaded object key
var keyName = 'hello_alfheimr.txt';

// Create a promise on S3 service object
var bucketPromise = new AWS.S3({apiVersion: '2006-03-01'}).createBucket({Bucket: bucketName}).promise();
// Handle promise fulfilled/rejected states
bucketPromise.then(
  function(data) {
    // Create params for putObject call
    var objectParams = {Bucket: bucketName, Key: keyName, Body: 'Hello Alfheimr! Im the first ever doc created by you guys in AWS S3'};
       
    // Create object upload promise
    var uploadPromise = new AWS.S3({apiVersion: '2006-03-01'}).putObject(objectParams).promise();
    uploadPromise.then(
      function(data) {
        console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
      });

      res.status(200).send('Bucket created & Doc uploaded');
}).catch(
  function(err) {
    console.error(err, err.stack);
    new ErrorResponse('Error while uploading doc');
});
})