const express = require('express');
const router = express.Router();
const catchAsync=require('../utilis/catchAsync');
const User = require('../models/user');
// const catchAsync = require('../utilis/catchAsync');

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register', catchAsync(async(req, res) => {
  // res.send(req.body)
  try{
    const { email, username, password } = req.body;
  
    // Use 'User' instead of 'user' for object instantiation
    const newUser = new User({ email, username });
    
    const registeredUser = await User.register(newUser, password);
    req.flash('success', 'Welcome to Yelp Camp!');
    res.redirect('/campgrounds');
  }
  catch(e)
  {
     req.flash('error',e.message);
     res.redirect('register');
  }

  
//   console.log(registeredUser);
  
  
}));

module.exports = router;
