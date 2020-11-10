const asyncHandler = require('../middleware/async');
// Load the SDK and UUID
// const AWS = require('aws-sdk');
const { S3, PutObjectCommand } = require("@aws-sdk/client-s3");
const { S3RequestPresigner } = require("@aws-sdk/s3-request-presigner");
const { createRequest } = require("@aws-sdk/util-create-request");
const { formatUrl } = require("@aws-sdk/util-format-url");
const uuid = require('uuid');
const ErrorResponse = require('../utils/errorResponse');

const s3 = new S3({apiVersion: '2006-03-01'});


// @desc      Creating bucket and adding object to the bucket
// @route     GET /api/v1/filesystem/
// @access    Public
exports.createBucket = asyncHandler(async(req, res, next) => {
// Create unique bucket name
var bucketName = 'alfheimrdocs-' + uuid.v4();
// Create name for uploaded object key
var keyName = 'hello_alfheimr.txt';

// Create a promise on S3 service object
var bucketPromise = s3.createBucket({Bucket: bucketName}).promise();
// Handle promise fulfilled/rejected states
bucketPromise.then(
  function(data) {
    // Create params for putObject call
    var objectParams = {Bucket: bucketName, Key: keyName, Body: 'Hello Alfheimr! Im the first ever doc created by you guys in AWS S3'};
       
    // Create object upload promise
    var uploadPromise = s3.putObject(objectParams).promise();
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

// @desc      Upload file to s3
// @route     GET /api/v1/filesystem
// @access    Public
exports.uploadFile = asyncHandler(async(req, res, next)=> {
  let fileName = req.params.fileName;

 //creating upload object
 let uploadParamObj = {
   'Bucket': 'hello_alfheimr.txt',
   'Key': '',
   'Body': ''
 }

// Getting the file
var fs = require('fs');
let fileStream = fs.createReadStream(fileName);
fileStream.on('error', (error) => {
  console.log('File Error:'+ error);
});

uploadParamObj.Body = fileStream;
uploadParamObj.Key = fileName;

// call S3 to retrieve upload file to specified bucket
s3.upload (uploadParamObj, function (err, data) {
  if (err) {
    console.log("Error", err);
  } if (data) {
    console.log("Upload Success", data.Location);
  }
});
})

exports.presignedURL = asyncHandler(async (req, res, next)=>{
const BUCKET = 'alfheimrdocs-e4d65ffc-18d0-4c64-bbd2-8b4a71c651c0';
const KEY = 'test-img-'+ uuid.v4();
const EXPIRATION = 60 * 60 * 1000;

// creating a s3 presigner obj
console.log(`S3 config: ${JSON.stringify(s3.config)}`);
const signer = new S3RequestPresigner({...s3.config});

// creating file upload request
const AWSUploadRequest = await createRequest(s3, new PutObjectCommand({ KEY, BUCKET }));
const expirtation = new Date(Date.now() = EXPIRATION);

// creating & formating presigned URL
let signedUrl = formatUrl(await signer.presign(AWSUploadRequest, expirtation));
console.log(`Generated Signed URL: ${signedUrl}`);

res.status(200).json({
  signedUrl
})
})