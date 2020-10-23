const Character = require('../models/character');
const https = require('https');
const aws = require('aws-sdk');
const { sign } = require('crypto');
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
    console.log(req.body); // image file for upload as profile portrait is in req.file
    // set portrait field in req.body to field filename in req.file 
    // to store the portrait filename on the server for recall later for this profile
    
    // if req.file is undefined then no file was chosen for upload, let mongoose set the portrait field to the default in this case, 
    // otherwise set the portrait to the filename uploaded to the public/portraits directory
    // if (req.file) {
    //     req.body.portrait = req.file.filename;
    // }
    req.body.portrait = req.body['portrait-url'];
    console.log(req.body.portrait);
     
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
                // only remove profile portrait from aws s3 if it is not the default portrait
                // get file name from portraitID url
                fileName = portraitID.split('/');
                fileName = fileName[fileName.length - 1];
                console.log("file name is: " + fileName);
                  
                /* sign s3 delete url */
                const s3 = new aws.S3();
                const s3Params = {
                    Bucket: S3_BUCKET,
                    Delete: {Objects: [{Key: fileName}]},
                };

                s3.deleteObjects(s3Params, (err, data) => {
                    if(err){
                        console.log(err);
                    } else {
                        console.log(data);
                    }
                });
    
                // s3.getSignedUrl('deleteObject', s3Params, (err, signedURL) => {
                //     if(err){
                //         console.log(err);
                //         return res.end();
                //     }

                    // let urlParts = signedURL.split('/');
                    // let hostname = urlParts[2];
                    // let path = urlParts[3].split('?')[0];
                    // console.log(urlParts);
                    // /* send delete request for portrait to s3*/
                    // let options = {hostname: hostname, path: path, method: 'DELETE'};
                    // console.log(hostname);
                    // console.log(path);
                    // // https.request(options, (resp) => {
                    // //     let data = '';

                    // //     resp.on('data', (chunk) => {
                    // //         data += chunk;
                    // //     });

                    // //     // The whole response has been received. Print out the result.
                    // //     resp.on('end', () => {
                    // //         console.log("S3 reply: " + resp.statusCode + ", " + data);
                    // //     });

                    // //     }).on("error", (err) => {
                    // //         console.log('Could not delete file.');
                    // //         console.log("Error: " + err.message);
                    // // }).end();
                // });
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