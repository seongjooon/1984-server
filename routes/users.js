const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const passport = require('passport');
const authorization = require('./middlewares/authentication');

authorization.verifyUserData(passport);

router.post('/signup', async (req, res, next) => {
  // if (req.body.password !== req.body.passwordConf) {
  //   throw new Error();
  // }
  try {
    console.log('Line 8: ', req.body);
    const userData = {
      email: req.body.email,
      nickname: req.body.nickname,
      password: req.body.password
    };
    let user = await User.findOne({
      email: req.body.email
    });

    if (!user) {
      user = new User(userData);
      await user.save();
    }

    res.send({ result: 'ok', user });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post(
  '/signin',
  passport.authenticate('local', { failureFlash: true }),
  authorization.extendSession,
  async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    const { nickname, email } = user;
    res.send({
      message: 'Success!',
      token: jwt.sign(
        JSON.stringify({ nickname, email }),
        process.env.SECRET_KEY
      )
    });
  }
);

router.get('/signout', (req, res, next) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return next(err);
      } else {
        return res.redirect(process.env.CLIENT_URL);
      }
    });
  }
});

module.exports = router;
