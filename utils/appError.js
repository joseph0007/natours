module.exports = class AppError extends Error {
  constructor(message, statusCode) {
    //calls the constructor of Error Object and which in turn sets the message property on this object
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    //to check if the error is operational error or programming
    this.isOperational = true;

    //the Error.captureStackTrace() recieves 2 arguments 1 --> the target object 2 ---> the constructor of the target object
    //it then runs the error stack() which just traces where the error occured inside the code!!
    //and it then creates a property stack in the current object and stores the data inside it!!
    Error.captureStackTrace(this, this.constructor);
  }
};
