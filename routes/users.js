const express = require('express');
const router = express.Router();
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');

router.get('/register', users.renderRegisterForm);

router.post('/register', catchAsync(users.register));

router.get('/login', users.renderLoginForm);

router.post(
  '/login',
  storeReturnTo,
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
  }),
  users.login
);

router.get('/logout', users.logout);

module.exports = router;
