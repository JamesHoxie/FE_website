const mongoose = require('mongoose');

// mongoose.Schema is a constructor function on the mongoose object, use to construct schema
const Schema = mongoose.Schema;

const characterSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    quote: {
        type: String,
        required: false
    },
    bio: {
        type: String, 
        required: false
    }
}, {timestamps: true});

// create model based on above schema
// mongoose will pluralize the name param passed to model to find the corresponding collection in mongoDB
// so it will search the characters collection when calling methods from Character
const Character = mongoose.model('Character', characterSchema);

module.exports = Character;