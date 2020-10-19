const mongoose = require('mongoose');
const Tours = require('./TourModel');

//Schema for reviews collection
const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      maxlength: [300, 'Please keep the review shorter than 300 characters'],
      required: [true, 'Please provide a review!'],
    },
    rating: {
      type: Number,
      max: [5, 'Please provide a rating between 0 and 5'],
      min: [0, 'Please provide a rating between 0 and 5'],
      required: [true, 'Please provide a rating between 0 and 5'],
    },
    userID: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
      required: [true, 'Tour Id needs to be specified'],
    },
    tourID: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tours',
      required: [true, 'Tour Id needs to specified'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

//indexing to compound tourID and userID into one unique field
reviewSchema.index({ tourID: 1, userID: 1 }, { unique: true });

//static method on the Review model to calculate the ratingsAverage and ratingsQuantity
reviewSchema.statics.getRatingsStats = async function (tourId) {
  //this points to the Model object
  const stats = await this.aggregate([
    {
      $match: { tourID: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tours.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tours.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//pre() query middleware to populate the referenced fields
//do not await the query here it gets stuck in an endless loop because the pre() never returns the control to the next middleware!!
reviewSchema.pre(/^find/, function (next) {
  //you can either do it the way i did by just specifying both the path name seperated by a space or you can append another
  //populate() query for the other path!!
  this.populate({
    //not populating tour just to avoid overpopulation and putting unneccessary stress on the mongoose api
    path: 'userID',
    select: 'name photo',
  });
  next();
});

//Document middleware to update the ratingsQuantity and ratingsAverage fields in tours collection
reviewSchema.post('save', async function (doc, next) {
  //console.log('document:', doc);
  //this points to current review Document
  //since its an object of Model(Review) we get access to its static methods!!
  await this.constructor.getRatingsStats(this.tourID);
  next();
});

//if we just put /^findOne/ then it will match findOne() because its comes before findOneAnd..., and will set the pre middleware
//for that query and so to match the queries(findOneAndDelete/Update) we need to /^findOneAnd/ use this regEx!!!
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.reviewDoc = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  if (this.reviewDoc)
    await this.reviewDoc.constructor.getRatingsStats(this.reviewDoc.tourID);
  next();
});

const Review = mongoose.model('reviews', reviewSchema);

module.exports = Review;
