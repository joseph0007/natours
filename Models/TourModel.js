const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./UserModel');
//const validator = require('validator');

//mongoose.schema
/**
 * a schema is a set of rules definition that can be applied on to a Model.
 * into the mongoose.Schema() ---> constructor() we pass an object that contains the key name and either a simple datatype definition
 * or you can pass an Object containing the set of rules that needs to be applied to that key, this object is called as
 * "schema definition object".
 * other than the schema definition object you can also pass in another object called the "schema options object"!!
 *
 */

//DATATYPE VALIDATORS
/**
 * datatype validators are datatype specific validation provided by mongoose which usually is an object in which
 * we can pass in a value and a message property.
 * there is a shorthand for it which is an array containing the value followed by a message.
 * while updating the documents if you want to run the validators then you have to pass in a option object and
 * set the runValidators to true!!
 */

//CUSTOM VALIDATORS
/**
 * custom validators can be used to define custom functions that can have validation procedure as per our requirements
 * the callback function's first argument is the value passed into that field where you are using the validation in
 * and ONLY IF CREATING A NEW DOCUMENT WILL YOU HAVE THE "this" POINTING TO THE NEWLY CREATED OBJECT(DOCUMENT) and
 * so it will not point to the document if you are updating the document.
 * it can be used by using the "validate" property inside schema type definition object!!
 * this callback function should always return a BOOLEAN value.
 */
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour should have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'a tour name should have less than 40 characters'],
      minlength: [10, 'a tour name should have more than 10 characters'],
      //third party validation
      //validate: [validator.isAlpha, 'name should only contain letters'],
    },
    slug: String,
    rating: {
      type: Number,
      default: 4.5,
      min: [0, 'a tour rating should have values between 0 and 5'],
      max: [5, 'a tour rating should have values between 0 and 5'],
    },
    price: {
      type: Number,
      //validator
      required: [true, 'a tour should have a price'],
    },
    duration: {
      type: Number,
      required: [true, 'a tour should have a duration'],
    },
    difficulty: {
      type: String,
      required: [true, 'a tour should specify its difficulty'],
      //enum: ['easy', 'medium', 'difficult']
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'a tour difficulty can only have easy, medium, difficult values',
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour should have a group sixe'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [0, 'a tour rating should have values between 0 and 5'],
      max: [5, 'a tour rating should have values between 0 and 5'],
      //setter function that will run each time this field will get updated/changed
      set: (val) => Math.round(val * 10) / 10, // 4.6666 * 10 = 46.6666 = 47 / 10 = 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        //mongoose give you access to the passed value by using the following syntax ---> ({VALUE})
        message: 'priceDiscount ({VALUE}) cannot be greater than price',
      },
    },
    summary: {
      type: String,
      require: [true, 'a tour should have a summary'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'a tour should have a description'],
      trim: true,
    },
    //moongoose automatically creates a Date type of when the data was created
    createdAt: {
      type: Date,
      default: Date.now(),
      //"select:false" will hide this data permanently from the user and this data cannot be send even if requested by the user
      //can be used for sensitive data!!
      select: false,
    },
    imageCover: {
      type: String,
      trim: true,
    },
    images: [String],
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    //this is a Geospatial data property, in this the object describing the key(i.e. startLocation) is not an type definition
    //object but just a normal object in which we can set a few property and the in those property we can pass a type
    //definition object!!
    //while defining a geospatial property we can define the area shape which can be ['Point', 'Polygon', 'any shape describing a area'],
    //coordinates: [long,lat], and some other properties!!
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'], //['Point', 'Polygon', 'any shape describing a area']
      },
      coordinates: [Number],
      address: String,
      description: {
        type: String,
        max: 120,
        trim: true,
      },
    },
    /**
     * in mongoose while defining schema we can embed documents inside a document and this can be done by passing an array
     * of objects.You just need to define a schema for one of the objects in the array!!
     *
     */
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: {
          type: String,
          max: 120,
          trim: true,
        },
        day: Number,
      },
    ],
    //give an empty array if you dont know the type of data or just specify the data structure!!
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        //actual reference to the collection from which the above ObjectId is part of!!
        ref: 'users',
      },
    ],
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

//INDEXING
/**
 * indexing are used by the mongodb database to find documents much faster and more efficiently.To make this process easier we use
 * indexes, they can be of two types single value indexes, composite value indexes.You need to specify which field you want to index
 * on the schema object, but mind do indexing does use resources to store the indexing related information and so one should not
 * blindly index every field and should only index the fields that are most often "READ".If there are a lot of write operations
 * performed on the collection then its not a good idea to implement indexing beacuse each time you change some fields the
 * indexing needs to be recomputed!!
 */

//when you create a compound index it actually creates indexes for both the fields and there is no need to specify index for
//individual field!!
// "1" ---> ascending "-1" ---> descending
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
//for geoSpatial indexing
//since we are measuring distance on a sphere we consider a "2dsphere" and if we were to measure the distance on a 2d plane then
//we would have to use "2d"
tourSchema.index({ startLocation: '2dsphere' });

//VIRTUAL PROPERTIES
/**
 * virtual properties are the properties that are created on the go when the documents is fetched from the database.
 * these properties are not stored inside of the database but instead they are created everytime we request for documents.
 * they are just like views in mySQL. these documents are not stored inside the database because they can be derived from
 * the data that is already inside the database.
 * these can also be defined inside of the controllers as a function but it is better to keep the business logic seperated from the
 * application logic as we are following the MVC architecture!!!
 * Once the virtual property is created you need to add the schema options object to the schema and set the virtuals property
 * to true.
 */
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate
/**
 * virtual populate allows you to populate the parent with all the documents that have this collection referenced as parent
 * reference. This feature allows you to populate even without having child references(without persisting data in the database)
 * which was the main reason we chose parent referencing so that we dont need to keep an array of all the child references.
 * this feature is just like FOREIGN KEY REFERENCES in RDBMA system where we connect two columns where the column that is
 * being referenced has to be a PRIMARY KEY column!!
 * this just creates a virtual field but to populate it you need to actually call the populate on the query!!
 */
tourSchema.virtual('reviews', {
  ref: 'reviews',
  foreignField: 'tourID',
  localField: '_id',
});

//DOCUMENT MIDDLEWARE
/**
 * mongoose also provides the functionality of middleware.
 * these middleware provided are of 2 types:
 * -pre():
 * pre runs before the document is saved to the database (runs before the hook event has occured).
 * -post()
 * post runs after the document is saved to the database (runs after the hook event has occured).
 * post also gives us access to the "ready document" which is ready to be inserted into the database!!
 *
 * the document middleware which is usually used with the "save" hook and it runs when a save() or create() methods are run
 * and does not run when other types of queries such as insertOne, updateMany, etc are called on the query object.!!
 *
 * the middleware with the same hook is chained together and are called pre/post hook middlewares!!
 */

//documnet middleware to get the guides document and embed it into the newly created tours document!!
//not gonna use this method as we are using refrencing instead of embedding!!
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));

//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  //console.log(this);
  next();
});

tourSchema.post('save', function (doc, next) {
  //console.log(doc);
  next();
});

//QUERY MIDDLEWARE
/**
 * query middleware is triggered when the hook is a query hook for example: find, update, replace, etc.
 * they too consist of pre and post middleware and in case of query middleware the this is pointed to the current query unlike
 * in document middleware where the this is pointed to the current document.
 */

//NOTE
/**
 * if we change the schema after inserting a few documents inside the database then that changes will not be reflected in the documents
 * that are already in the database.
 * But when you use mongoose to find() data from the database it will return the documents with the updated schema model
 * even though they are not reflected in the database!!!
 */

//FIXME: //issue of guides showing up even in fields query
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -changedAt',
  });
  next();
});

tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });
  this.Date = Date.now();
  next();
});

tourSchema.post('find', function (docs, next) {
  // console.log(
  //   `the time taken to execute the query is ${Date.now() - this.Date}`
  // );
  //the documents returned by the query is available here!!
  // console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE
/**
 * these are the middlewares that gets triggered when an aggregation pipeline hook occurs.
 * these come in handy when we need to change something or add or delete a stage from the pipeline from all the aggreagation
 * functions in the program, it takes away the hassle of changing it manually from every aggregation function.
 * In aggregation hook or middleware we have access to the aggregation object and aggragte.pipeline() method which upon calling
 * return an array of all the pipeline stages that we defined.!!
 * in this the "this" points to the aggregation object!
 */

tourSchema.pre('aggregate', function (next) {
  if (Object.keys(this.pipeline()[0]).includes('$geoNear')) {
    this.pipeline().push({
      $match: {
        secretTour: { $ne: true },
      },
    });
  } else {
    this.pipeline().unshift({
      $match: {
        secretTour: { $ne: true },
      },
    });
  }

  next();
});

//mongoose.model
//is used to create a Model based on the specified schema
const Tours = mongoose.model('Tours', tourSchema);

module.exports = Tours;
