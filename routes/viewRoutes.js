const express = require('express');
const { isLoggedIn, protect } = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const {
  getOverviewPage,
  getTourPage,
  getLoginPage,
  getUserDetailsPage,
  getMyTours,
  getSignUpPage
  // updateUserDetails,
} = require('../controllers/viewController');

const router = express.Router();

//to not perform duplicate actions (protect() and isLoggedIn()) we write above the below middleware!!
router.get('/me', protect, getUserDetailsPage);

router.get('/my-tours', protect, getMyTours);

//USING FORM TO SEND DATA
/**
 * this way of submitting/sending data to the server will
 * - reload the page on submit
 * - you will need to create a seperate route handler to handle the data submitted by the form
 * - its useful if you dont have an api and just need to send data and not use a xhr request
 */
// router.post('/user-details', protect, updateUserDetails);

router.use(isLoggedIn);

router.get('/', bookingController.createBookingCheckout, getOverviewPage);

router.get('/tours/:tour', getTourPage);

router.get('/login', getLoginPage);

router.get('/signup', getSignUpPage);

module.exports = router;
