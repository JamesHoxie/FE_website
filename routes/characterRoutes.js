const express = require('express');
const router = express.Router();
const Character = require('../models/character');

// FYI: all routes here are prepended by '/characters', so get('/') in this file is actually get('/characters/') overall


router.get('/', (req, res) => {
    res.redirect('/');
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    Character.findById(id)
        .then(result => {
            res.render('details', {character: result, title: 'character details'});
        })
        .catch((err) => {
            console.log(err);
        });
});

router.post('/', (req, res) => {
    const character = new Character(req.body);

    character.save()
        .then((result) => {
            res.redirect('/characters');
        })
        .catch((err) => {
            console.log(err);
        });
});

router.delete('/:id', (req, res) => {
    const id = req.params.id;

    Character.findByIdAndDelete(id)
        .then((result) => {
            res.json({redirect: '/characters'});
        })
        .catch((err) => {
            console.log(err);
        });
});



module.exports = router;