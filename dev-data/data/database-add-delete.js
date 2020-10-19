const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../Models/TourModel');
const User = require('../../Models/UserModel');
const Review = require('../../Models/ReviewModel');

// dotenv.config({ path: './config.env' });
dotenv.config({ path: `${__dirname}/../../config.env` });

//the ./ path always points to the root directory in this core_modules context
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const review = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// connecting to database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  // .connect(process.env.DATABASE_LOCAL
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

// deletes all the documents from the tours collection
const deleteDbDocs = async function () {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('documents deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const addDbDocs = async function () {
  try {
    //create can also receive an array of objects instead of just one object for creating documents inside the collection
    await Tour.create(tour);
    await User.create(user, { validateBeforeSave: false });
    await Review.create(review);

    console.log('documents added');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  addDbDocs();
} else if (process.argv[2] === '--delete') {
  deleteDbDocs();
}

console.log(process.argv);
