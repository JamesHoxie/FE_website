
const User = require('../models/user');
const jwt = require('jsonwebtoken');


// create new jwt for authenticated user
const maxAge = 3 * 24 * 60 * 60; // 3 days in milli
function createToken(id) {
    // first arg = payload, second arg = secret string to hash, third arg = options
    return jwt.sign({id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: maxAge})
}


// error handler for exported functions
const handleErrors = function(err) {
    console.log(err.message, err.code);
    let errors = {email: '', password: ''};

    // incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'that email is not registered';
    }

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'incorrect password';
    }

    // duplicate email error
    if (err.code === 11000) {
        errors.email = 'that email is already registered'
    }

    // validation errors
    if (err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(error => {
            const properties = error.properties;
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}












// route handling functions for export
const signup_get = function(req, res) {
    res.render('signup', {title: 'signup page'});
}

const login_get = function(req, res) {
    res.render('login', {title: 'login page'});
}

const signup_post = async function(req, res) {
    const {email, password} = req.body; // destructuring
    
    try {
        const user = await User.create({email, password});
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
        res.status(201).json({user: user._id});
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
}

const login_post = async function (req, res) {
    const {email, password} = req.body; // destructuring
    
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
        res.status(200).json({user: user._id});
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
}

const logout_get = function (req, res) {
    // replace jwt cookie with invalid empty value and immediate expiration date
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
}


module.exports = {
    signup_get,
    signup_post,
    login_get,
    login_post,
    logout_get
}