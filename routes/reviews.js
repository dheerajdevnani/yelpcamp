const express=require('express');
const router= express.Router();
const {validateReview,isLoggedIn}=require('../middleware');
const Campground = require('../models/campground');
const Review=require('../models/review');
const reviews=require('../controllers/reviews');
const ExpressError=require('../utilis/ExpressError.js');
const catchAsync=require('../utilis/catchAsync');




router.post('/',isLoggedIn, validateReview, catchAsync(reviews.createReview));
  
  router.delete('/:reviewId',isLoggedIn,catchAsync(reviews.deleteReview))

  module.exports=router;