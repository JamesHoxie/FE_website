/* ************************ SERVER SET UP  ************************ */

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const characterRoutes = require('./routes/characterRoutes');
const authRoutes = require('./routes/authRoutes')
const Character = require('./models/character');
const cookieParser = require('cookie-parser');
const requireAuth = require('./authChecker.js').requireAuth;
const checkUser = require('./authChecker.js').checkUser;

// express app, instance of express app
const app = express();

// register view engine
app.set('view engine', 'ejs');

// set public directory to serve static files from (css stylesheet and profile images in public)
app.use(express.static(__dirname + '/public'));

// json body parser
app.use(express.json());

// cookie parser for jwt
app.use(cookieParser());

// urlencoded body parser
app.use(express.urlencoded({ extended: true }));

// fix for deprecation warning for mongoose for collection.ensureIndex, use createIndexes per mongoose docs
mongoose.set('useCreateIndex', true);

// uri to connect to mongoDB
// TODO: use env variables for user (james) and pass (firklelou) 
const dbURI = 'mongodb+srv://james:firkelou@cluster0.bbgap.mongodb.net/FE-Database?retryWrites=true&w=majority';

// connect to FE-Database stored on MongoDB cloud, second arg object is to ensure no deprecation warnings are displayed
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => {
        console.log('Connected to FE-Database');
        
        // listen for requests on localhost port 3000 now that database was connected to successfully 
        app.listen(3000);
    })
    .catch((err) => {
        // if we fail to connect to database, log out error details
        console.log(err);
    });

// log incoming request details using morgan 3rd party middleware
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

// 404 page, using middleware, (.use() -> use this function for every incoming request, dont try to match a route)
// if nothing else matches a route above, it will send a 404
app.use((req, res) => {
    res.status(404).render('404', {title: 'page not found'});
});