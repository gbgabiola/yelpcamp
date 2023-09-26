if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const ejsMate = require('ejs-mate');
const express = require('express');
const flash = require('connect-flash');
const helmet = require('helmet');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const passport = require('passport');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/user');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const ExpressError = require('./utils/ExpressError');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelpCamp';

mongoose
  .connect(dbUrl)
  .then(() => console.log('Database connected!'))
  .catch(err => console.log(err));

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({ replaceWith: '_' }));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret,
  },
});

store.on('error', function (e) {
  console.log('Session Store Error', e);
});

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxage: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  'https://api.tiles.mapbox.com',
  'https://api.mapbox.com',
  'https://kit.fontawesome.com',
  'https://cdnjs.cloudflare.com',
  'https://cdn.jsdelivr.net',
];
const styleSrcUrls = [
  'https://kit-free.fontawesome.com',
  'https://api.mapbox.com',
  'https://api.tiles.mapbox.com',
  'https://fonts.googleapis.com',
  'https://use.fontawesome.com',
  'https://cdn.jsdelivr.net',
];
const connectSrcUrls = [
  'https://api.mapbox.com',
  'https://*.tiles.mapbox.com',
  'https://events.mapbox.com',
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      childSrc: ['blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
        'https://images.unsplash.com',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh no, something went wrong!';
  res.status(statusCode).render('error', { err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
