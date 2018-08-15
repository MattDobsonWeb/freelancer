const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');

// Add validation
const validateRegisterInput = require('../../validation/registerValidation');
const validateLoginInput = require('../../validation/loginValidation');

// Load User Model
const User = require('../../models/User');

// @route   GET api/auth/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Auth Works' }));

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check the validation for errors
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Check if there is already a user with teh same username
  User.findOne({
    $or: [
      { username: new RegExp('^' + req.body.username + '$', 'i') },
      { email: new RegExp('^' + req.body.email + '$', 'i') }
    ]
  }).then(user => {
    if (user) {
      errors.alreadyExists = 'User with same username or email already exists!';
      return res.status(400).json(errors);
    } else {
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        avatar: '',
        password: req.body.password
      });

      // Encrypt the password using bcrypt
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;

          // Turn the user password into hash
          newUser.password = hash;

          // Send new user to database through mongoose
          newUser.save().then(user =>
            res.json({
              id: user.id,
              username: user.username,
              email: user.email,
              avatar: user.avatar,
              date: user.date
            })
          );
        });
      });
    }
  });
});

// @route   GET api/users/login
// @desc    Login User / Returning JWT Token
// @access  Public
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const username = new RegExp('^' + req.body.username + '$', 'i');
  const password = req.body.password;

  // Find user by username
  User.findOne({ username }).then(user => {
    // Check if username exists
    if (!user) {
      return res.status(404).json({ username: 'Username not found' });
    }

    // Check Password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // Passwords Matched and are correct

        // Create JWT Payload
        const payload = {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          admin: user.admin
        };

        // Sign JsonWebToken
        jwt.sign(payload, keys.key, { expiresIn: '7d' }, (err, token) => {
          res.json({
            success: true,
            token: 'Bearer ' + token
          });
        });
      } else {
        return res.status(400).json({ password: 'Password incorrect' });
      }
    });
  });
});

module.exports = router;
