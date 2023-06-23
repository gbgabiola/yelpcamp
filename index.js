const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const PORT = 3000;
const Campground = require('./models/campground');

mongoose
  .connect('mongodb://localhost:27017/yelpCamp')
  .then(() => console.log('Database connected!'))
  .catch(err => console.log(err));

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find();
  res.render('campgrounds/index', { campgrounds });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
