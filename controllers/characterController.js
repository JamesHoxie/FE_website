const Character = require('../models/character');

// character_index, character_details, character_create_get, character_create_post, character_delete

const character_index = function(req, res) {
    // get all characters from DB, sorts in descending order from time of creation (new characters show first)
    Character.find().sort({createdAt: -1})
        .then((result) => {
            res.render('characters/index', {title: 'index page', characters: result});
        })
        .catch((err) => {
            console.log(err);
        });
}

const character_details = function(req, res) {
    const id = req.params.id;
    Character.findById(id)
        .then(result => {
            res.render('characters/details', {character: result, title: 'character details'});
        })
        .catch((err) => {
            res.status(404).render('404', {title: 'Character not found'});
        });
}

const character_create_get = function(req, res) {
    res.render('characters/create', {title: 'create page'});
}

const character_create_post = function(req, res) {
    const character = new Character(req.body);

    character.save()
        .then((result) => {
            res.redirect('/characters');
        })
        .catch((err) => {
            console.log(err);
        });
}

const character_delete = function(req, res) {
    const id = req.params.id;

    Character.findByIdAndDelete(id)
        .then((result) => {
            res.json({redirect: '/characters'});
        })
        .catch((err) => {
            console.log(err);
        });
}

module.exports = {
    character_index,
    character_details,
    character_create_get,
    character_create_post,
    character_delete
}