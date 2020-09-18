var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const Users = require('../models/User');
const express = require('express');
const router = express.Router({ mergeParams: true });
const ErrorResponse = require('../utils/errorResponse');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  Users.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_OAUTH_CLIENTID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENTSECRET,
      callbackURL: 'http://localhost:5000/api/v1/googleauth/callback',
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log(
        `Access Token: ${accessToken} and Refresh Token: ${refreshToken}`
      );
      console.log(`User Google Profile: ${JSON.stringify(profile)}`.green);

      // checking if the user exists
      let user = await Users.findOne({
        email: profile.emails[0].value,
      });

      if (!user) {
        // creating user profile
        console.log(`Creating new user`);

        // Establishing a socket connection for signedup user

        // Add new user in the db
        const new_user = await Users.create({
          email: profile.emails[0].value,
          name: profile.displayName,
        });

        if (!new_user)
          return done(
            new ErrorResponse(`Error while creating new user`, 500),
            null
          );
        // console.log(`User socket id added: ${user}`);
        return done(null, new_user);
      } else {
        console.log(`User exists with id: ${user.email}`);
        // return existing user
        return done(null, user);
      }
    }
  )
);

router.route('/').get(
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
);

router.route('/callback').get(
  passport.authenticate('google', {
    failureRedirect: '/api/v1/googleauth/',
    successRedirect: '/api/v1/googleauth/redirect',
  }),
  function (req, res) {
    console.log(
      `Inside Google Success Callback with session object: ${JSON.stringify(
        req.user
      )}`
    );
    // res.cookie('userId', req.user._id);
    res.status(200).json({
      success: true,
      msg: 'User authenticated!',
    });
  }
);

//redirecting back inside the app from the browser
router.route('/redirect').get((req, res) => {
  res.redirect('<deep-link-to-client-app>');
});

module.exports = router;
