const ejsMate = require('ejs-mate');
const express = require('express');
const Joi = require('joi');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const path = require('path');
const PORT = 3000;
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

mongoose
  .connect('mongodb://localhost:27017/yelpCamp')
  .then(() => console.log('Database connected!'))
  .catch(err => console.log(err));

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
  res.render('home');
});

app.get(
  '/campgrounds',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
  })
);

app.post(
  '/campgrounds',
  catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campgroundSchema = Joi.object({
      campground: Joi.object({
        title: Joi.string().required(),
        location: Joi.string().required(),
        image: Joi.string().required(),
        price: Joi.number().min(0).required(),
        description: Joi.string().required(),
      }).required(),
    });
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
      const message = error.details.map(detail => detail.message).join(',');
      throw new ExpressError(message, 400);
    }
    console.log(result);
    const campground = new Campground(req.body.campground);
    campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.get(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
  })
);

app.put(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.get(
  '/campgrounds/:id/edit',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
  })
);

app.delete(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
  })
);

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh no, something went wrong!';
  res.status(statusCode).render('error', { err });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
