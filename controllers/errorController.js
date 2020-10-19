const AppError = require('../utils/appError');

const handleMongoError = (err) => {
  return new AppError(`Invalid value ${err.value} for ${err.path}`, 400);
};

const handleMongoDuplicateError = (err) => {
  //const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  return new AppError(
    `Duplicate value.The value "${err.keyValue.name}" already exists`
  );
};

const handleMongoValidationError = (err) => {
  const errMsg = Object.values(err.errors).map((el) => el.message);

  return new AppError(`Validation Error. "${errMsg.join('. ')}"`);
};

const handleJWTInvalidError = () =>
  new AppError('Invalid Token.Please login again!');

const handleJWTExpireError = () =>
  new AppError('Token expired.Please login again!');

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    //this error handler is to handle the api errors i.e.(errors coming from  /api/v1/..)
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err,
      stack: err.stack,
    });

    //for devs
    // eslint-disable-next-line no-unreachable
    // console.error(err);
  }

  //for devs
  console.error(err);

  //this error handler is to handle errors coming from the rendered website which does not have "/api/v1/" appended before the
  //url endpoint!!
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    message: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //this error handler is to handle the api errors i.e.(errors coming from  /api/v1/..)
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational === true) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //for devs
    console.error(err);

    //send generic message to user
    return res.status(err.statusCode).json({
      status: 500,
      message: 'Something went wrong!!',
    });
  }

  //this error handler is to handle errors coming from the rendered website which does not have "/api/v1/" appended before the
  //url endpoint!!
  if (err.isOperational === true) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      message: err.message,
    });
  }
  //for devs
  console.error(err);

  //send generic message to user
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    message: 'Something went wrong!Try again later!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';
  err.message = err.message || 'Something went wrong!!';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    //this does not add message property to the newly created object for some reason, I think it s because the message property is
    //not actually created by us but instead it is created by the Error constructor and set on our AppError class, and this
    //for some reason then dont actually destructure the message value into the newly created object!!!
    let error = { ...err };
    error.message = err.message;
    if (error.kind === 'ObjectId' || error.name === /CastError/)
      error = handleMongoError(error);
    if (error.code === 11000) error = handleMongoDuplicateError(error);
    if (error._message === 'Tours validation failed')
      error = handleMongoValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTInvalidError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpireError();

    sendErrorProd(error, req, res);
  }
};
