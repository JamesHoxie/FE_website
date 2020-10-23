"use strict";
const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');
const multer = require('multer');

// using multer for parsing multi part form data for profile creation requests
const upload = multer();

// FYI: all routes here are prepended by '/characters', so get('/') in this file is actually get('/characters/') overall
// upload.any() -> multipart form data parsing middleware

router.post('/create', upload.single('portrait'), characterController.character_create_post);

router.get('/create', characterController.character_create_get);

router.get('/:id', characterController.character_details);

router.get('/', characterController.character_index);

router.delete('/:id', characterController.character_delete);

router.put('/:id', characterController.character_put);


module.exports = router;