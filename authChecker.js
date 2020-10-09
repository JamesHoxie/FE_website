const jwt = require('jsonwebtoken');
const User = require('./models/user');


// middleware to protect character routes behind authentication,
// ensure a valid user with a jwt is accessing the route, else redirect to login
const requireAuth = function(req, res, next) {
    const token = req.cookies.jwt

    // check if json web token exists and is authentic
    if (token) {
        jwt.verify(token, 'fe secret', (err, decodedToken) => {
            if (err) {
                // could not authenticate user, jwt was invalid
                console.log(err.message);
                res.redirect('/login');
            } else {
                // user successfully authenticated
                console.log(decodedToken);
                next();
            }
        });
    } else {
        // could not authenticate user, did not have jwt
        res.redirect('/login');
    }
}

// middleware to check current user, used to dynamically render login/logout options, personal greeting, etc
const checkUser = function(req, res, next) {
    const token = req.cookies.jwt;

    // check if json web token exists and is authentic
    if (token) {
        jwt.verify(token, 'fe secret', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null; // user not authenticated, pass null for user local variable
                next();
            } else {
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user; // pass user info into views for dynamic rendering of user info to pages
                next();
            }
        });
    } else {
        res.locals.user = null; // user not authenticated, pass null for user local variable
        next();
    }
}

module.exports = {requireAuth, checkUser};