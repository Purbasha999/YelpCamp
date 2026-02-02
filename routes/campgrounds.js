const express = require('express');
const router = express.Router();
const multer = require('multer')
const { storage } = require('../cloudinary');
var upload = multer({ storage })
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds')


router.route('/')
    .get(campgrounds.index)
    .post(upload.array('image'), validateCampground,  campgrounds.createNewCamp);

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(campgrounds.displayCamp)
    .put(upload.array('image'), isLoggedIn, isAuthor, validateCampground, campgrounds.editCamp)
    .delete(isLoggedIn, isAuthor, campgrounds.deleteCamp);

router.get('/:id/edit', isLoggedIn, isAuthor, campgrounds.renderEditForm);

module.exports = router;