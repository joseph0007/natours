const express = require('express');
const {
  signUp,
  logIn,
  logout,
  resetPassword,
  forgotPassword,
  updatePassword,
  protect,
  updateUser,
  deleteMe,
  restrictTo,
  uploadImage,
  processImage,
} = require('../controllers/authController');
const userController = require('../controllers/userController');

const Router = express.Router();

//USERS
//a better way of writing the above route handlers

//it is okay to not follow the RESTapi format in case of special situation as such wherein we describe the action in the url which
//the REST architecture prohibits to do!!
Router.post('/signup', signUp);
Router.post('/login', logIn);
Router.get('/logout', logout);
Router.post('/forgotpassword', forgotPassword);
Router.patch('/resetpassword/:token', resetPassword);

//by using the power of middleware we can stack a middleware which checks for authentication before other middleware in the
//middleware stack!!
//beacuse when a request hits the server it routes through the base Router(app) to the other Router(sub-application) that is mounted
//on top of it and it runs all the middleware in the sequence they are written in!!
Router.use(protect);

Router.get('/me', userController.getMe, userController.getUser);

Router.patch('/updatepassword', updatePassword);
Router.patch('/updateme', uploadImage, processImage, updateUser);
Router.delete('/deleteme', deleteMe);

Router.use(restrictTo('admin'));

Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = Router;
