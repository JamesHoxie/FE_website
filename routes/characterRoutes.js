const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/portraits');
    }, 

    // ensure uploaded profile portraits will keep their file extensions when stored (jpeg, png, etc)
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

// json parser for put route
const jsonParser = bodyParser.json();

// FYI: all routes here are prepended by '/characters', so get('/') in this file is actually get('/characters/') overall

router.post('/create', upload.single('portrait'), characterController.character_create_post);

router.get('/create', characterController.character_create_get);

router.get('/:id', characterController.character_details);

router.get('/', characterController.character_index);

router.delete('/:id', characterController.character_delete);

router.put('/:id', jsonParser, characterController.character_put);


module.exports = router;