const Character = require('../models/character');
const https = require('https');
const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET_NAME;
aws.config.region = 'us-east-1';

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
    req.body.portrait = req.body['portrait-url'];  
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

            // remove profile portrait from storage before deleting profile on mongo
            if (portraitID !== 'Fire_Emblem_Logo.png') {
                // only remove profile portrait from aws s3 if it is not the default portrait
                // get file name from portraitID url
                fileName = portraitID.split('/');
                fileName = fileName[fileName.length - 1];
                console.log("file name is: " + fileName);
                  
                /* setting params for s3 delete request */
                const s3 = new aws.S3();
                const s3Params = {
                    Bucket: S3_BUCKET,
                    Delete: {Objects: [{Key: fileName}]},
                };

                /* delete profile portrait from s3 bucket */
                s3.deleteObjects(s3Params, (err, data) => {
                    if(err){
                        console.log(err);
                    } else {
                        console.log(data);
                    }
                });
            }

            /* remove profile from mongodb */
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