const { campgroundSchema, reviewSchema } = require('./schema.js');
const ExpressError = require('./utilis/ExpressError');
const Campground = require('./models/campground');

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; // Save the original URL
    req.flash('error', 'You must be signed in first!');
    return res.redirect('/login');
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
      req.flash('error', 'Campground not found!');
      return res.redirect('/campgrounds'); // or wherever you want to redirect
    }

    if (!campground.author.equals(req.user._id)) {
      req.flash('error', 'You do not have the permission to do that!');
      return res.redirect(`/campgrounds/${id}`);
    }

    next();
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong');
    res.redirect('/campgrounds'); // Redirect to a safe page or handle as needed
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
