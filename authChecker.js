const jwt = require('jsonwebtoken');
const User = require('./models/user');

const requireAuth = function(req, res, next) {
    const token = req.cookies.jwt

    // check if json web token exists and is authentic
    if (token) {
        jwt.verify(token, 'fe secret', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            } else {
                console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
}

// check current user
const checkUser = function(req, res, next) {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, 'fe secret', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            } else {
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user; // pass user info into views for dynamic rendering of user info to pages
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

module.exports = {requireAuth, checkUser};