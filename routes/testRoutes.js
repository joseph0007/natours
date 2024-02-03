const express = require('express');
const { sendTestMail } = require('../tests/mail.test');
const authController = require('../controllers/authController');

const Router = express.Router();

// Router.use(authController.protect);

Router.route('/mail')
  .get(sendTestMail);

module.exports = Router;
