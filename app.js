const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const usersRouter = require('./routes/users');
const rankingRouter = require('./routes/ranking');

const db = mongoose.connection;
mongoose.connect(process.env.DATA_BASE_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('MongoDB connecting!');
});

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const connectSocket = require('./routes/socket');

app.use(logger('dev'));
app.use(
  cors({
    origin: [process.env.WEB_CLIENT_DOMAIN, process.env.MOBILE_CLIENT_DOMAIN],
    credentials: true
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: 'true',
    cookie: {
      maxAge: Number(process.env.ONE_HOUR),
      sameSite: null
    }
  })
);

app.use('/users', usersRouter);
app.use('/ranking', rankingRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

connectSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listen on localhost:${PORT}`));

module.exports = app;
