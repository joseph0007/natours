const dotenv = require('dotenv');
const mongoose = require('mongoose');

/**
 * uncaughtException are the bugs, errors that occurs in your synchronous code so in order to catch it we need to place
 * a event handler before any of our code is loaded.
 * in case of uncaughtException it is really necessary to crash the server beacuse our node application is running in an
 * unclean state.
 * if the error occurs inside of a node middleware then it will be handled by the error handling middleware that we set
 */
process.on('uncaughtException', (err) => {
  console.log('Something is not working.Server crashed!!');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: '.env' });
//executes all the code inside of app.js by the iife inside the require function!!
const app = require('./app');

// connecting to database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
).replace(
  '<USERNAME>',
  process.env.DATABASE_USERNAME
)


mongoose
  // .connect(process.env.DATABASE_LOCAL
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('instantiated...');
});

/**
 * to catch all the Unhandled rejections (failed/rejected promise) in the apllication globally we can use the process variable.
 * the process variable emits a Unhandled rejection error ecach time a promise gets rejected which we can catch in our code and
 * handle.
 * process.exit() can have two values 0 or 1 in which 0 ---> success , 1 ---> uncaught exception.
 * and to give the server a chance to serve all the pending request before shutting it down we use .close() on the server
 * and then pass the process.exit() inside its callback!!
 */

process.on('unhandledRejection', (err) => {
  console.log('Something is not working.Server crashed!!!');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

//responding to a SIGTERM event which is an event that is emmited by heroku to our app
//this event is to terminate our app for a while to make some necessary polishing changes to keep our app running smoothly
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('✌🏽SIGTERM RECIEVED. Shutting down!!');
  });
});
