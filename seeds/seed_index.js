if(process.env.NODE_ENV !== 'production') { require('dotenv').config({ quiet: true }) }

const mongoose = require('mongoose');
const Campground = require('../models/campground');
const User = require('../models/user');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const dbUrl = process.env.DB_URL;

const { LoremIpsum } = require('lorem-ipsum');
const lorem = new LoremIpsum({
    wordsPerSentence: { min: 4, max: 8 },
    sentencesPerParagraph: { min: 4, max: 10 }
});

mongoose.connect(dbUrl)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("Mongo connection error:", err));

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedCampgrounds = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const userIds = (await User.find({}, '_id')).map(u => u._id);
        const auth = userIds[Math.floor(Math.random() * userIds.length)];
        newCamp = new Campground({
            author: auth,
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            description: lorem.generateParagraphs(1),
            price: Math.floor(Math.random() * 5000) + 1,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude,
                ]
            },
            images: [
            {url: 'https://res.cloudinary.com/dgrxf2q28/image/upload/v1769836630/YelpCamp/urllfyfuzid3jcfyxoii.jpg',
            filename: 'YelpCamp/urllfyfuzid3jcfyxoii'},
            {url: 'https://res.cloudinary.com/dgrxf2q28/image/upload/v1769836630/YelpCamp/c5lxtd4xo1atmrssjv0b.jpg',
            filename: 'YelpCamp/c5lxtd4xo1atmrssjv0b' }
            ]
        });
        await newCamp.save();
    }
};

// const seedUsers = async () => {
//     await Users.deleteMany({});
//     for (let i = 0; i < 50; i++) {
//         const rand1000 = Math.floor(Math.random() * 1000);
//         const rand1 = Math.floor(Math.random() * 2);
        
//         newCamp = new Campground({

seedCampgrounds().then(() => {
    console.log("Seeding complete");
    mongoose.connection.close();
});
