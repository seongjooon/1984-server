const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');


router.post('/signup', async (req, res, next) => {
  if (req.body.password !== req.body.passwordConf) {
    throw new Error();
  }
  try {
    console.log('Line 8: ', req.body);
    const userData = {
      email: req.body.email,
      nickname: req.body.nickname,
      password: req.body.password
    };
    const user = await User.findOne({
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

// router.post(
//   '/login',
//   passport.authenticate('local', {
//     failureRedirect: '/login',
//     failureFlash: true
//   }),
//   authorization.extendSession,
//   userController.login
// );

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
