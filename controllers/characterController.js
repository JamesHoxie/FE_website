const Character = require('../models/character');
const fs = require('fs');

// list of characters profiles page
const character_index = function(req, res) {
    // if we have a query string parameter for a name, only get profiles with that name,
    // regexp matches only case insensitive full string (won't match name as a substring of another string) -> 'name' == 'NaMe' but 'xname' != 'name'
    if (req.query.name) {
        Character.find({'name': { $regex : new RegExp(`^${req.query.name}$`, "i") }}).sort({createdAt: -1})
            .then((result) => {
                res.status(200).render('characters/index', {title: 'index page', characters: result});
            })
            .catch((err) => {
                console.log(err);
            });
    }

    else { 
        // get all characters from DB, sorts in descending order from time of creation (new characters show first)
        Character.find().sort({createdAt: -1})
        .then((result) => {
            res.status(200).render('characters/index', {title: 'index page', characters: result});
        })
        .catch((err) => {
            console.log(err);
        });
    }
}

// indiviudal character profile page
const character_details = function(req, res) {
    const id = req.params.id;
    Character.findById(id)
        .then(result => {
            res.status(200).render('characters/details', {character: result, title: 'character details'});
        })
        .catch((err) => {
            res.status(404).render('404', {title: 'Character not found'});
        });
}

// character profile creation page
const character_create_get = function(req, res) {
    res.status(200).render('characters/create', {title: 'create page'});
}

// character profile creation request
const character_create_post = function(req, res) {
    console.log(req.file); // image file for upload as profile portrait is in req.file
    // set portrait field in req.body to field filename in req.file 
    // to store the portrait filename on the server for recall later for this profile
    
    // if req.file is undefined then no file was chosen for upload, let mongoose set the portrait field to the default in this case, 
    // otherwise set the portrait to the filename uploaded to the public/portraits directory
    if (req.file) {
        req.body.portrait = req.file.filename;
    }
     
    const character = new Character(req.body);

    // save new profile to database, then redirect to characters index page
    character.save()
        .then((result) => {
            res.set('Content-Type', 'text/html');
            res.status(201).send('<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/characters"></head></html>');
        })
        .catch((err) => {
            console.log(err);
        });
}

// delete character profile from database by id (names on characters do not have be unique, do deletion by id instead)
const character_delete = function(req, res) {
    const id = req.params.id;

    Character.findById(id)
        .then((result) => {
            const portraitID = result.portrait;
            console.log(portraitID);

            // remove profile portrait from storage before deleting profile on mongo
            if (portraitID !== 'Fire_Emblem_Logo.png') {
                // only remove profile portrait from storage if it is not the default portrait
                fs.unlink(`./public/portraits/${portraitID}`, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(`${portraitID} was deleted`);
                    }
                  });
            }

            Character.findByIdAndDelete(id)
                .then((result) => {
                    // redirect to characters index page after successful profile deletion
                    res.status(200).json({redirect: '/characters'});
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.log(err);
        });
}

// character profile update route
const character_put = function(req, res) {
    const id = req.params.id;
    const data = req.body;
    console.log(req.body);

    Character.findByIdAndUpdate(id, data)
        .then((result) => {
            res.status(200).json({redirect: `/characters/${id}`});
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
    character_delete,
    character_put
}