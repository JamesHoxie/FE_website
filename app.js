const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const characterRoutes = require('./routes/characterRoutes');

// express app, instance of express app
const app = express();

// register view engine
app.set('view engine', 'ejs');

// set public directory to serve static files from (css stylesheet currently, place images in public as well)
app.use(express.static(__dirname + '/public'));

// body parser
app.use(express.urlencoded({ extended: true }));

// uri to connect to mongoDB
// TODO: use env variables for user (james) and pass (firklelou) 
const dbURI = 'mongodb+srv://james:firkelou@cluster0.bbgap.mongodb.net/FE-Database?retryWrites=true&w=majority';

// connect to FE-Database stored on MongoDB cloud, second arg is to ensure no deprecation warnings are displayed
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => {
        console.log('Connected to FE-Database');
        
        // listen for requests on localhost now that database was connected to successfully 
        app.listen(3000);
    })
    .catch((err) => {
        // if we fail to connect to database, log out error details
        console.log(err);
    });

// log incoming request details using morgan 3rd party middleware
app.use(morgan('dev'));

// // log incoming request details using custom middleware, **not use of next() to tell request to call the next middleware function**
// app.use((req, res, next) => {
//     console.log('new request made');
//     console.log('host: ', req.hostname);
//     console.log('path: ', req.path);
//     console.log('method: ', req.method);

//     // tell express to move to next middleware down the file after logging request details (server hangs otherwise)
//     next();
// });





// ************************ SERVER END POINTS START HERE  ************************

// character routes 
app.use('/characters', characterRoutes);

app.get('/', (req, res) => {
    res.status(200).render('index', {title: 'home page'});
});

app.get('/about', (req, res) => {
    res.status(200).render('about', {title: 'about page'});
});

// 404 page, using middleware, (.use() -> use this function for every incoming request, dont try to match a route)
// if nothing else matches a route above, it will send a 404
app.use((req, res) => {
    res.status(404).render('404', {title: 'page not found'});
});