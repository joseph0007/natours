const Review = require('../Models/ReviewModel');
// const AppError = require('../utils/appError');
// const APIFeatures = require('../utils/apifeatures');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

//to get all the reviews
exports.getAllReviews = factory.GenericGetAll(Review);

//get a single review!!
exports.getReview = factory.GenericGetOne(Review);

//middleware function to check for tourId, userId!!
exports.checkIDs = (req, res, next) => {
  if (!req.body.tourID) req.body.tourID = req.params.tourId;
  if (!req.body.userID) req.body.userID = req.user._id;
  next();
};

//create review (POSTing review)
exports.createReview = factory.GenericCreateOne(Review);

exports.deleteReview = factory.GenericDeleteOne(Review);

exports.updateReview = factory.GenericUpdateOne(Review);

//FIXME:
// exports.checkUserReview = async (req, res, next) => {
//   const doc = await Review.findById(req.params.id);
//   console.log(doc.userID._id, req.user.id, req.user.role);

//   if (req.user.role === 'user' && req.user.id !== doc.userID._id) {
//     //req.user.role === 'user' && req.user.id !== doc.userID._id
//     return next(
//       new AppError('you do not have permission to delete this review!', 401)
//     );
//   }

//   next();
// };
