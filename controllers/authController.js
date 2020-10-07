
const User = require('../models/user');

// handle errors
const handleErrors = function(err) {
    console.log(err.message, err.code);
    let errors = {email: '', password: ''};

    // duplicate email error
    if (err.code === 11000) {
        errors.email = 'that email is already registered'
        
        return errors;
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

// route handling functions
const signup_get = function(req, res) {
    res.render('signup', {title: 'signup page'});
}

const login_get = function(req, res) {
    res.render('login', {title: 'login page'});
}

const signup_post = async function(req, res) {
    console.log(req.body);
    // destructuring
    const {email, password} = req.body;
    
    try {
        const user = await User.create({email, password});
        res.status(201).json(user);
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
}

const login_post = async function (req, res) {
    res.send('user login');
}


module.exports = {
    signup_get,
    signup_post,
    login_get,
    login_post
}