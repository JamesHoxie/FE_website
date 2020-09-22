const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Character = require('./models/character');

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


// start mongoose and mongo routes

// POST
app.get('/add-character', (req, res) => {

    // create new instance of Character model to save to database
    const character = new Character({
        name: 'new character',
        quote: 'new quote',
        bio: 'new bio'
    });

    // save new character to FE-Database on mongoDB cloud
    character.save()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
});

// GET (ALL)
app.get('/all-characters', (req, res) => {
    Character.find()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
});

// GET (SINGLE)
app.get('/search-character', (req, res) => {
    Character.findById('5f6a896a9287038c50a4b6a3')
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        })
});

// end mongo and mongoose routes

app.get('/', (req, res) => {

    // get all characters from DB, sorts in descending order from time of creation (new characters show first)
    Character.find().sort({createdAt: -1})
        .then((result) => {
            res.render('index', {title: 'index page', characters: result});
        })
        .catch((err) => {
            console.log(err);
        })

    // const characters = [
    //     {name: 'Joe', quote: 'I\'m Joe!', bio: 'He is, indeed, Joe'},
    //     {name: 'Patty', quote: 'I will never leave Bumble!', bio: 'She\'s a cow, wearing a meat dress, named patty. Nothing else needs to be said.'},
    //     {name: 'Panda', quote: 'I will complete this project!', bio: 'He\'s the totally rad guy making this website.'} 
    // ];

    // // express automatically checks views folder, does not need path name, does not need to know where path is relative to 
    // // compare to : res.sendFile('./views/index.html', {root: __dirname});
    // // second param is the object to be passed to the corresponding ejs file that will be rendered,
    // // use this param to pass data that will be dynamically rendered on the page
    
    // res.render('index', {title: 'index page', characters: characters});
});

app.get('/about', (req, res) => {
    res.render('about', {title: 'about page'});
});

app.get('/characters', (req, res) => {
    res.redirect('/');
});

app.get('/create', (req, res) => {
    res.render('create', {title: 'create page'});
});

// 404 page, using middleware, (.use() -> use this function for every incoming request, dont try to match a route)
// if nothing else matches a route above, it will send a 404
app.use((req, res) => {
    res.status(404).render('404', {title: 'page not found'});
});