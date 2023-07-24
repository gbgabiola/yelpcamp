const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose
  .connect('mongodb://localhost:27017/yelpCamp')
  .then(() => console.log('Database connected!'))
  .catch(err => console.log(err));

const pattern = arr => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = `${Math.floor(Math.random() * 20) + 10}.${
      Math.floor(Math.random() * 60) + 10
    }`;
    const camp = new Campground({
      author: '64b7b6dd95c9d5374a2a73d1',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${pattern(descriptors)} ${pattern(places)}`,
      image: 'https://source.unsplash.com/collection/483251',
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus minima veniam, veritatis error non, ducimus, reiciendis sed expedita cum facere sapiente voluptas blanditiis itaque doloribus eos facilis iure dolor ex!',
      price,
    });

    await camp.save();
  }
};

seedDB().then(() => mongoose.connection.close());
