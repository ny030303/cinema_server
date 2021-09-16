// mac ip: 192.168.31.31
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');

const dotenv = require('dotenv');
const passport = require('passport');

const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var moviesRouter = require('./routes/movies');
var authRouter = require('./routes/auth');

dotenv.config(); // env
var app = express();

var {init} = require('./controllers/dbController');
init();

Array.prototype.division = function (n) {
  let arr = this;
  let len = arr.length;
  let cnt = Math.floor(len / n) + (Math.floor(len % n) > 0 ? 1 : 0);
  let ret = [];
  for (let i = 0; i < cnt; i++) {
    ret.push(arr.splice(0, n));
  }
  return ret;
}

const prevConsoleLog = console.log;
console.log = (...params) => {
  // prevConsoleLog(callerSrc = (new Error()).stack.split("\n"));
  let callerSrc = (new Error()).stack.split("\n")[2];
  prevConsoleLog('(' + callerSrc.substr(callerSrc.lastIndexOf('\\') + 1), params);
};

let {crawleReservationRate} = require('./crawler/movieCrawler/crawleReservationRateRank');
let {crawleGraph} = require('./crawler/movieCrawler/crawleGraphInNaver');
(async () => {
  await crawleReservationRate();
  // await crawleGraph();
  // await require('./crawler/movieCrawler/crawleGraphInNaver').crawleGraph2();
})();
let crawlerInterval = setInterval(async () => {
  await crawleReservationRate();
  // await require('./crawler/movieCrawler/crawleGraphInNaver').crawleGraph2();
  // await crawleGraph();
}, 300000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));


app.use(cors({
  origin: true,
  credentials: true
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/movies', moviesRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser( (user, done) => {
  done(null, user);
});

module.exports = app;
