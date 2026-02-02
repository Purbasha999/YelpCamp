const User = require('../models/user');

module.exports.renderRegForm = (req, res) => {
    res.render('users/register');
};

module.exports.registerUser = async (req, res, next) => {
    try {
        const {username, email, password, confirmPassword} = req.body;
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match!');
            return res.redirect('register');
        }
        const user = new User({username, email});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome ${registeredUser.username}, to YelpCamp!`);
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('register');
    }
};

module.exports.renderLoginForm = (req, res) => {
    const redirectUrl = req.get('referer');
    if (redirectUrl && !redirectUrl.includes('/login')) {
        req.session.returnTo = redirectUrl;
    }
    res.render('users/login');
};

module.exports.login = (req, res) => {
    req.flash('success', `Welcome back ${req.user.username}!`);
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout(() => {
        req.flash('success', "Successfully logged out!");
        res.redirect('/campgrounds');
    });
};