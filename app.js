//returns function that will create an instance of an express app
const express = require('express');

// express app, instance of express app
const app = express();

// register view engine
app.set('view engine', 'ejs');

// listen for requests on localhost 
app.listen(3000);

// set public directory to serve static files from (css stylesheet currently, place images in public as well)
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    const characters = [
        {name: 'Joe', quote: 'I\'m Joe!', bio: 'He is, indeed, Joe'},
        {name: 'Patty', quote: 'I will never leave Bumble!', bio: 'She\'s a cow, wearing a meat dress, named patty. Nothing else needs to be said.'},
        {name: 'Panda', quote: 'I will complete this project!', bio: 'He\'s the totally rad guy making this website.'} 
    ];

    // express automatically checks views folder, does not need path name, does not need to know where path is relative to 
    // compare to : res.sendFile('./views/index.html', {root: __dirname});
    // second param is the object to be passed to the corresponding ejs file that will be rendered,
    // use this param to pass data that will be dynamically rendered on the page
    
    res.render('index', {title: 'index page', characters: characters});
});

app.get('/about', (req, res) => {
    res.render('about', {title: 'about page'});
});

app.get('/create', (req, res) => {
    res.render('create', {title: 'create page'});
});

// 404 page, using middleware, (.use() -> use this function for every incoming request, dont try to match a route)
// if nothing else matches a route above, it will send a 404
app.use((req, res) => {
    res.status(404).render('404', {title: 'page not found'});
})