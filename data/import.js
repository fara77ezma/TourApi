const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../models/Tour');
const User = require('../models/User');
const Review = require('../models/Review');

dotenv.config({ path: './config/config.env' });

mongoose.connect(process.env.MONGO_URI, {});
mongoose.set('setDefaultsOnInsert', true);

// read data from files
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')); // convert json data to javascript object
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8')); // convert json data to javascript object
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
); // convert json data to javascript object

// import data to database
const iimport = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    console.log('data successfuly loaded');
    process.exit();
  } catch (e) {
    console.log(e);
  }
};
// delete all the data from DB
const deletee = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('data successfuly deleted');
    process.exit();
  } catch (e) {
    console.log(e);
  }
};
if (process.argv[2] === '--import')
  iimport(); // node data/import.js --import
else if (process.argv[2] === '--delete') deletee(); // node data/import.js --delete
