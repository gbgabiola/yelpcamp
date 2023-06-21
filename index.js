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

app.get('/new-campground', async (req, res) => {
  const camp = new Campground({
    title: 'Backyard Campsite',
    location: 'My Backyard',
    price: 12.99,
    description: 'Near and cheap camping!',
  });

  await camp.save();
  res.send(camp);
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
