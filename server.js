const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const errorHandler = require('./middleware/error');
const redis = require('redis');

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const connectDB = require('./config/db');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
const googleauth = require('./routes/googleauth');

// Load env vars
dotenv.config({ path: './config/config.env' });
console.log(
  `Environment variables in server.js are Env: ${process.env.NODE_ENV} & Google Oauth Secrets: ${process.env.GOOGLE_OAUTH_CLIENTSECRET}`
);

// Connect to database
connectDB();

// Redis client
const redis_client = redis.createClient();
redis_client.on('error', (error) => {
  console.error(error);
});
redis_client.set('key1', 'value1', redis.print);

redis_client.get('key1', (err, reply) => {
  console.log(`Here is the reply from redis ${reply}`);
});

const app = express();

// Body parser
app.use(express.json());

//CookieParser
app.use(cookieParser());

// Initialising Passport & Passport Session for persistent sessions
app.use(passport.initialize());
app.use(passport.session());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//File Uploading
app.use(fileupload());

//Set Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/googleauth', googleauth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
