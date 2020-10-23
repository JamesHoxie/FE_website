"use strict";

/* ************************ SERVER SET UP  ************************ */

require('dotenv').config();
const aws = require('aws-sdk');
const express = require('express');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const mongoose = require('mongoose');
const characterRoutes = require('./routes/characterRoutes');
const authRoutes = require('./routes/authRoutes')
const Character = require('./models/character');
const cookieParser = require('cookie-parser');
const requireAuth = require('./authChecker.js').requireAuth;
const checkUser = require('./authChecker.js').checkUser;
const PORT = process.env.PORT || 3000;
const S3_BUCKET = process.env.S3_BUCKET_NAME;
aws.config.region = 'us-east-1';

// init express app
const app = express();

// register view engine
app.set('view engine', 'ejs');

// set public directory to serve static files from (css stylesheet and profile images in public)
app.use(express.static(__dirname + '/public'));

// set favicon
app.use(favicon(__dirname + '/public/favicon.ico'));

// json body parser
app.use(express.json());

// cookie parser for jwt
app.use(cookieParser());

// urlencoded body parser
app.use(express.urlencoded({ extended: true }));

// fix for deprecation warning for mongoose for collection.ensureIndex, use createIndexes per mongoose docs
mongoose.set('useCreateIndex', true);

// fix for deprecation warnings for mongoose for findOneAndUpdate, findOneAndDelete
mongoose.set('useFindAndModify', false);

// uri to connect to mongoDB, first value should be defined if running on heroku, else use local developer connection
const dbURI = process.env.MONGODB_URI || process.env.MONGO_DB_DEV;

// connect to FE-Database stored on MongoDB cloud, second arg object is to ensure no deprecation warnings are displayed
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => {
        console.log('Connected to FE-Database');
        app.listen(PORT);
    })
    .catch((err) => {
        console.log(err);
    });

// log incoming request details using morgan middleware
app.use(morgan('dev'));













// ************************ SERVER END POINTS START HERE  ************************

// check if user is logged in on all routes for dynamic rendering to pages
app.get('*', checkUser);

// character routes, require authentication to display these routes 
app.use('/characters', requireAuth, characterRoutes);

// authentication routes (login and signup)
app.use(authRoutes);

// homepage
app.get('/', (req, res) => {
    // get most recent character from DB to display on homepage
    Character.findOne().sort({createdAt: -1})
        .then((result) => {
            res.status(200).render('index', {title: 'home page', featuredProfile: result});
        })
        .catch((err) => {
            console.log(err);
        });
});

// about page
app.get('/about', (req, res) => {
    res.status(200).render('about', {title: 'about page'});
});

// ************************ BEGIN AWS S3 END POINT  ************************
app.get('/sign-s3', (req, res) => {
    const s3 = new aws.S3();
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Expires: 60,
      ContentType: fileType,
      ACL: 'public-read'
    };
  
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if(err){
        console.log(err);
        return res.end();
      }
      const returnData = {
        signedRequest: data,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
      };
      res.write(JSON.stringify(returnData));
      res.end();
    });
  });
  // ************************ END AWS S3 END POINT  ************************

// 404 page, using middleware, (.use() -> use this function for every incoming request, dont try to match a route)
// if nothing else matches a route above, it will send a 404
app.use((req, res) => {
    res.status(404).render('404', {title: 'page not found'});
});