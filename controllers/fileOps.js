const asyncHandler = require('../middleware/async');
// Load the SDK and UUID
const AWS = require('aws-sdk');
const { S3, CreateBucketCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { S3RequestPresigner } = require("@aws-sdk/s3-request-presigner");
const { createRequest } = require("@aws-sdk/util-create-request");
const { formatUrl } = require("@aws-sdk/util-format-url");
const uuid = require('uuid');
const ErrorResponse = require('../utils/errorResponse');
const fetch = require("node-fetch");

const s3 = new AWS.S3({
  region: 'ap-south-1',
  endpoint: 's3-ap-south-1.amazonaws.com',
  accessKeyId:  'AKIAUYHPR2AHDESEJHJU',
  secretAccessKey: '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',
  Bucket: 'dammnn',
  signatureVersion: 'v4'
});


// @desc      Creating bucket and adding object to the bucket
// @route     GET /api/v1/filesystem/
// @access    Public
exports.createBucket = asyncHandler(async(req, res, next) => {
// Create unique bucket name
var bucketName = 'alfheimrdocs-' + uuid.v4();
// Create name for uploaded object key
var keyName = 'hello_alfheimr.txt';

// Create a promise on S3 service object
const bucketData = await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
      res.status(200).send('Bucket created '+ bucketName);
})


// @desc      Upload file to s3
// @route     GET /api/v1/filesystem/:bucket
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

// @desc  Generating Pre-signed URL (Attempt 2)
// @route PUT /api/v1/filesystem/generatepresignedurl
// @access  Private
exports.generatePreSignedURL = asyncHandler(async (req, res, next)=>{
//  const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

 const params = {
   Bucket: 'dammnn',
   Key: `xyz-${Math.ceil(Math.random() * 10 ** 10)}`,
   Expires: 36000
 }

 // create a command for the presigned url to run
//  const command = new PutObjectCommand(params);

 // creating a presigned url
 const signedUrl = await s3.getSignedUrl('putObject', params);

 if(!signedUrl){
   return new ErrorResponse(`Error while generating presigned url`, 500);
 }

console.log(`Signed URL is: ${signedUrl}`);
res.status(200).json({
  'aws_presignedURL': signedUrl
});
})