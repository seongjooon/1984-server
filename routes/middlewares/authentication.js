const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/user');
const bcrypt = require('bcrypt');

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(301).redirect(process.env.CLIENT_URL);
    throw new Error('signin error');
  }
};

exports.extendSession = (req, res, next) => {
  if (!req.body.remember_me) {
    return next();
  }
  res.cookie('remember_me', _, {
    path: '/',
    maxAge: Number(process.env.ONE_HOUR)
  });

  return next();
};

exports.verifyUserData = passport => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        session: true
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (user) {
            bcrypt.compare(password, user.password, (err, same) => {
              if (same) {
                return done(null, user);
              } else {
                done(null, false, { message: '비밀번호가 틀렸습니다.' });
              }
            });
          } else {
            done(null, false, { message: '가입되지 않은 회원입니다.' });
          }
        } catch (err) {
          console.error(err);
          done(err);
        }
      }
    )
  );
};
