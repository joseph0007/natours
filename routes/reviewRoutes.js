const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const Router = express.Router({ mergeParams: true });

Router.use(protect);

Router.route('/')
  //gets all the reviews(advanced querying available)
  .get(reviewController.getAllReviews)
  //post a new review
  .post(
    restrictTo('admin', 'user'),
    reviewController.checkIDs,
    reviewController.createReview
  );

//gets a single review based on the id provided
Router.route('/:id')
  .get(reviewController.getReview)
  .delete(
    restrictTo('user', 'admin'),
    // reviewController.checkUserReview,
    reviewController.deleteReview
  )
  .patch(restrictTo('user', 'admin'), reviewController.updateReview);

module.exports = Router;
