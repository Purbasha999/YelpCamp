if(process.env.NODE_ENV !== 'production') { require('dotenv').config({ quiet: true }) }

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const flash = require('connect-flash');
//const cors = require("cors");
//app.use(cors());
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const expressMongoSanitize = require('@exortek/express-mongo-sanitize');
const helmet = require('helmet');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user');

// 'mongodb://127.0.0.1:27017/yelp-camp'
const dbUrl = process.env.DB_URL;
// const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp';
mongoose.connect(dbUrl)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("Mongo connection error:", err));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(expressMongoSanitize());

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisisasecret!'
    }
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",,
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/"
];
const connectSrcUrls = [
    "https://api.maptiler.com/"
];

const fontSrcUrls = [];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dgrxf2q28/",
            "https://images.unsplash.com",
            "https://plus.unsplash.com",
            "https://api.maptiler.com/"
        ],
        fontSrc: ["'self'", ...fontSrcUrls]
    }
}))


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
}); 

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);


app.get('/', (req, res) => {
    res.render('home.ejs');
});


app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = "Something went wrong"
    res.status(statusCode).render("error.ejs", {err})
});

app.listen(3000, () => {
    console.log("Serving on port 3000");
});