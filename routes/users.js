const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register', async (req, res) => {
  // res.send(req.body)
  const { email, username, password } = req.body;
  
  // Use 'User' instead of 'user' for object instantiation
  const newUser = new User({ email, username });
  
  const registeredUser = await User.register(newUser, password);
  
  console.log(registeredUser);
  
  req.flash('success', 'Welcome to Yelp Camp!');
  res.redirect('/campgrounds');
});

module.exports = router;
