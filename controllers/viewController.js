const Booking = require('../Models/BookingModel');
const Tours = require('../Models/TourModel');
const User = require('../Models/UserModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverviewPage = catchAsync(async (req, res, next) => {
  // 1) get all the tours to display
  const tours = await Tours.find();

  if (!tours)
    return next(new AppError('No tours available! try again later!', 404));

  //2) create a pug template to fill in the data

  //3) render the template
  //searches for base file inside the path we specified before!!
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTourPage = catchAsync(async (req, res, next) => {
  //1) get the tour based on the slug
  const tour = await Tours.findOne({ slug: req.params.tour }).populate({
    path: 'reviews',
    select: 'review rating userID',
  });

  if (!tour) {
    return next(new AppError('No tour found with that name!!', 404));
  }

  //2)create the template

  //3)render the template
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginPage = (req, res) => {
  res.status(200).render('login', {
    title: 'Login page',
  });
};

exports.getSignUpPage = (req, res) => {
  res.status(200).render('signup', {
    title: 'Signup page',
  });
};

exports.getUserDetailsPage = (req, res) => {
  res.status(200).render('usermenu', {
    title: req.user.name.toUpperCase(),
  });
};

exports.updateUserDetails = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('usermenu', {
    title: updatedUser.name.toUpperCase(),
    user: updatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  //get all the Bookings document for the logged in user
  const bookings = await Booking.find({ user: req.user._id });

  if (!bookings) return next(new AppError('no bookings found!', 404));

  //create an array of tourIds
  const tourIds = bookings.map((el) => el.tour._id);

  //get all the tours related to that user
  //$in mongo operator is used to get values from an array and iterate over each
  const tours = await Tours.find({ _id: { $in: tourIds } });

  //render the tours using the overview page
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
