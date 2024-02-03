const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../Models/TourModel');
const AppError = require('../utils/appError');
// const APIFeatures = require('../utils/apifeatures');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

//to upload tour imageCover and images(3)
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) {
    return cb(new AppError('Please upload only image file!!', 400), false);
  }

  cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);

// upload.array('images', 3);

//processing the images uploaded
exports.processImages = catchAsync(async (req, res, next) => {
  //if no files then retuen
  if (!req.files) return next();

  //imageCover
  const coverImageName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${coverImageName}`);

  //appending it to body so that it can be updated!!
  req.body.imageCover = coverImageName;

  req.body.images = [];
  //images array
  /**
   * here we have to use promise.all because the map function returns a array of promises because we used async await inside the
   * map loop!!
   * the promise.all() returns a single promise which is a promise that is a wrapper of all the promise inside the all() method
   * and so we need to await it!!
   */
  await Promise.all(
    req.files.images.map(async (el, ind) => {
      const imageName = `tour-${req.params.id}-${Date.now()}-${ind + 1}.jpeg`;

      await sharp(el.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageName}`);

      //appending it to body so that it can be updated!!
      req.body.images.push(imageName);
    })
  );

  next();
});

//handler functions
exports.topCheapTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary';
  next();
};

//handler to find the busiest month in a given year
exports.getBusyMonth = catchAsync(async (req, res, next) => {
  const { year } = req.params;

  const stats = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $lte: new Date(`${year}-12-31`),
          $gte: new Date(`${year}-1-1`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        tourName: { $push: '$name' },
        numTour: { $sum: 1 },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTour: -1,
      },
    },
    {
      $limit: 6,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.tourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { price: { $gte: 0 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

//tourController to handle geoSpatial computation
exports.handleGeoSpatial = catchAsync(async (req, res, next) => {
  const { distance, latlong, unit } = req.params;

  const [lat, long] = latlong.split(',');

  if (!lat || !long) {
    next(
      new AppError('Please provide the lattitude and longitude values!!', 400)
    );
  }

  //calculate the distance in radians ----> distance(miles) / radius of the earth in miles
  //distance(kilometers) / radius of the earth in kilometers
  const radius = unit === 'mi' ? distance / 3958.8 : distance / 6371;

  const doc = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[long, lat], radius] },
    },
  });

  res.status(200).json({
    status: 'success',
    length: doc.length,
    data: {
      data: doc,
    },
  });
});

//to calculate distances of tours from a point
exports.handleGeoSpatialDistance = catchAsync(async (req, res, next) => {
  const { latlong, unit } = req.params;

  const [lat, long] = latlong.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !long) {
    return next(
      new AppError('Please provide the lattitude and longitude values!!', 400)
    );
  }

  const doc = await Tour.aggregate([
    {
      //$geoNear aggregation stage should always be the first stage in the aggregation pipeline!!
      $geoNear: {
        // Optional. Specify the geospatial indexed field to use when calculating the distance.(use when multiple geoSpatial fields
        // are present in the collection!!)
        // key: '$startLocation',
        //defining a point from where to calculate the distance!
        near: {
          type: 'Point',
          coordinates: [long * 1, lat * 1],
        },
        //the field to store the distance calculated
        distanceField: 'distance',
        //to convert distances calculated in meters to any other units
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.createTour = factory.GenericCreateOne(Tour);

//there is no need to send a 404: not found error in this case if there was no results found for that specific route because
//everthing worked fine, as in the database searched for tours and found zero results for various reasons(eg: requesting a page
//that has no tours), in this scenario it is more apt to send a 200: OK response and say ther is no tours.
exports.getAllTours = factory.GenericGetAll(Tour);

exports.getTour = factory.GenericGetOne(Tour, { path: 'reviews' });

exports.updateTour = factory.GenericUpdateOne(Tour);

exports.deleteTour = factory.GenericDeleteOne(Tour);
