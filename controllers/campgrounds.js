const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary')
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs');
}

module.exports.createNewCamp = async (req, res) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/campgrounds/new');
    }
    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.features[0].geometry;
    newCampground.location = geoData.features[0].place_name;
    newCampground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCampground._id}`);
}

module.exports.displayCamp = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
    .populate('author')
    .populate({
        path: 'reviews',
        populate: { path: 'author'}
    });
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    };
    res.render('campgrounds/edit.ejs', { campground });
}

module.exports.editCamp = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id
    , req.body.campground, { new: true });
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) await cloudinary.uploader.destroy(filename)
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    campground.images.push(...imgs);    
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCamp = async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}

