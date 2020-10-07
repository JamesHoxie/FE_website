const mongoose = require('mongoose');
const isEmail = require('validator').isEmail;
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Password must be at least 6 characters long']
    }
});

// mongoose hooks

// post meaning... after, not a POST request
userSchema.post('save', function(doc, next) {
    console.log('new user was created and saved', doc);

    //let express go to next middleware after this
    next();
});

// pre meaning... before, saving to the database
userSchema.pre('save', async function(next) {
    // this refers to the new instance of a User being created before being saved to the database
    // hash and salt new user password
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);


    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;