const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const appErrorHandler = require('./controllers/errorController');

const app = express();

//to enable trust proxy
app.enable('trust proxy');

//setting view engine to let express know which template engine we are using
//you dont need to require "pug", express does that implicitly!!
app.set('view engine', 'pug');

//setting the path
//we should use path.join() method to join path as it is way more flexible in figuring out path which otherwise you would need to
//to make a exact string path using template literals!!
app.set('views', path.join(__dirname, 'views'));

//this middleware is used to route only and only static files(.html, .js, .css, .png, etc) and not any directory
//so if we make a request for a file without providing any specific path it will consider /path as its root directory and
//look for that file in that directory!!
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//middleware functions on the app are called as GLOBAL middleware functions because they operate at the highest level!!
//to set a middleware function you can use use() method which then recevies a function which should be called there itself!!

//sets http headers which can then be understood by the browser to set security measures and prevent attacks
//this should always be set as soon as possible in the middleware stack
//by default it has certain options turned on but if you need further protection then refer helmet documentation
app.use(helmet());

//this package keeps a track of requests coming from all the IP address and if the options that we set are broken then it will
//block the access to our api and send an error message back to the client!!
//this set up so that hackers dont send huge requests or use brute force to crash the servers!!
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP address.Please try again after one hour!',
});

//for all the request that start with /api resource locator
app.use('/api', limiter);

//using inbuild express middleware
//we can set a limit to the amount of data that can be send to the server in the req.body()
//this is done to further enforce security.n
app.use(
  express.json({
    limit: '10kb',
  })
);

//to parse urlencoded data
//by default when we use form to send data to our api using url-based action, it is encoded in a urlencoded format which we need to
//to parse otherwise we woont be able to use that data!!
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);

//cookie parser
app.use(cookieParser());

//using mongoSanitization to prevent from NoSQL query injection
//this type of attacks can use query injection to perform some operations that the api is not meant to do and do
//to prevent this we basically remove all the "$" and "{}" from the data that was send in the req.body
//and so we need to implement this middleware after the body-parser has parsed the req.body
//by default it has certain options turned on but if you need further protection then refer documentation
app.use(mongoSanitizer());

//to prevent cross site scripting(xss) which basically means injecting some malicious html code that has some js attached to it
app.use(xss());

//to prevent parameter population
app.use(
  hpp({
    whitelist: ['duration', 'ratingsAverage', 'difficulty', 'price'],
  })
);

app.use(compression());

//using our own middleware --> to use middleware we need to use the use() method
// app.use((req, res, next) => {
//   //adds the date and time when the request was made
//   req.requestTime = new Date().toISOString();
//   //it is important to call the next function beacuse if not then the request object will be stuck at this middleware function
//   //and the request/response cycle will never end!!

//   next();
// });

//using morgan(3rd party) middleware
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//to handle all the requests that are not handled by this server!!
//if suppose a path does not lead to a middleware function that has a response ending operation that terminates the middleware flow
//and sends the response back to the user, it routes back to the "all" request handling method and which in turn throws an error!!
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `cannot find ${req.originalUrl} on this server!`,
  // });

  // const error = new Error(`cannot find ${req.originalUrl} on this server!!`);
  // error.statusCode = 404;
  // error.status = 'fail';

  //passing the error into the middleware which in turn triggers the error middleware since the argument is an Error Object!!
  next(new AppError(`cannot find ${req.originalUrl} on this server!!`, 404));
});

//ERROR MIDDLEWARE
/**
 * error middleware are used to handle error throught the server-side app in a central place.
 * this middleware is special in the sense that it has a  pararmeter for receiving error argument and as soon as a error object is passed
 * to the next() function it straight away jumps to the error middleware and skips all the other middleware functions in the stack!!!
 */
app.use(appErrorHandler);

//what is happening is when we require this js file it will execute all of its code inside its iife and return this app object
module.exports = app;
