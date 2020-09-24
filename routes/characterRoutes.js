const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');
const Character = require('../models/character');

// FYI: all routes here are prepended by '/characters', so get('/') in this file is actually get('/characters/') overall

router.post('/', characterController.character_create_post);

router.get('/create', characterController.character_create_get);

router.get('/:id', characterController.character_details);

router.get('/', characterController.character_index);

router.delete('/:id', characterController.character_delete);


module.exports = router;