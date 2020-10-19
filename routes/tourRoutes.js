const express = require('express');
// const app = require('../app');
const { protect, restrictTo } = require('../controllers/authController');
const tourController = require('../controllers/tourController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

//middleware routers(sub-application)
const Router = express.Router();

/**
 * the concept of re-routing where you want to send a route to a different router if a certain route hits.
 * The problem with this Routing is that if you have a parameter specified in the route it will not pass or retain it
 * while being routed to the next Router because that parameter belongs to the Router that actaully handles that route.
 * If you want to retain it then you have to specify "mergeParams: true" inside the Router to which you are routing!!
 * You need to do this because it may be the case that the same route gets hits for different url-endpoints and one
 * of them may not have a parameter defined!!
 */
Router.use('/:tourId/reviews', reviewRouter);

//param middleware
// Router.param('id', tourController.checkID);

//check if body has appropriate properties
// app.use(tourController.checkBody);

//ALIASING
/**
 * aliasing means specifying an alias route which is simple enough for the user to understand and not worry about the underlying
 * query string that is required to carry out the operation.The query string is indeed filled out by the programmer manually
 * if that specific alias route is hit.
 */

Router.route('/top-5-cheap').get(
  tourController.topCheapTours,
  tourController.getAllTours
);

Router.route('/tour-stats').get(tourController.tourStats);

Router.route('/tour-month/:year').get(
  protect,
  restrictTo('admin', 'lead-guide'),
  tourController.getBusyMonth
);

//normally a point on the earth is defined in lat-long but in geoJSON it is specified in long-lat!!
//Route to check for tours in a specified geometrical region!!
Router.route('/tours-within/:distance/center/:latlong/units/:unit').get(
  tourController.handleGeoSpatial
);

//to get distances of tours from a specified point
Router.route('/tours-distance/center/:latlong/units/:unit').get(
  tourController.handleGeoSpatialDistance
);

//TOURS
Router.route('/')
  //a middleware that checks if the user is logged in or not and if logged in only then give all the tours!!
  .get(tourController.getAllTours)
  .post(
    protect,
    restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.processImages,
    tourController.createTour
  );
Router.route('/:id')
  .get(tourController.getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.processImages,
    tourController.updateTour
  )
  .delete(
    protect,
    restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

/**
 * the concept of nested Routes where in you create url or Routes in the url endpoint that are meaningful and easy for the user
 * of the api to understand how the api works.This way of routing is much easier to unserstand than using query to get
 * the same job done!!
 *
 * tours/<tourId>/reviews  or
 * tours/<tourId>/reviews/<reviewId> or
 */

// Router.route('/:tourId/reviews')
//   .get(protect, reviewController.getAllReviews)
//   .post(protect, restrictTo('user'), reviewController.createReview);

module.exports = Router;
