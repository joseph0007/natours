const crypto = require('crypto');
const { promisify } = require('util');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const User = require('../Models/UserModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

//multerStorage options where we can specify the destination and filename
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });

//to store it in memory as a buffer!!
const multerBuffer = multer.memoryStorage();

//muterFilter options to check the file type
const multerFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) {
    return cb(new AppError('Please upload only an image file!', 403), false);
  }

  //if no error then call the next middleware!!
  cb(null, true);
};

//to configure upload options
//if we dont specify the "dest" option then it will not save the uploaded multipart encoded data to the disk instead it will just
//store it in the memory!!
const upload = multer({
  storage: multerBuffer,
  fileFilter: multerFilter,
});

//exporting a multer upload function
exports.uploadImage = upload.single('photo');

//image proccessing using sharp
exports.processImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  //process the image and store it inside the file for then be updated into the database
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

//create token
const createToken = async (id) => {
  return await jwt.sign({ id }, process.env.JWT_PRIVATEKEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//create and send token
const createSendToken = async (
  user,
  statusCode,
  res,
  message = 'task sucssesful'
) => {
  const token = await createToken(user._id);
  //COOKIE
  /**
   * cookie is a small piece of data that is transfered between the server and the client.
   * the cookie data is sent automatically by the browser to the same server everytime it establishes a connection to the server
   * cookies use the name as the unique identifiers and if you send a cookie with the same name then it will override it!!
   */
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    //makes so that cookies are sent and recieved over a secure connection
    // secure: true,
    //makes so that the browser only sends and receives cookie data and not concerned with what is inside the cookie
    //this makes it more secure as hackers cannot access the contents of the cookie
    httpOnly: true,
  };

  //to make secure: true only in production environment
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  //not to send the password to the user when a new document is created!!
  //by setting the value of a field to undefined, that field is removed from the document!!
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    user,
  });
};

//filtering update data(object)
const filterUpdateObject = (user, ...fields) => {
  const filteredObj = {};
  //the reason we did not use for..in is beacuse it also iterates over the prototype chain!!
  Object.keys(user).forEach((el) => {
    if (fields.includes(el)) {
      filteredObj[el] = user[el];
    }
  });
  return filteredObj;
};

//SIGNUP
exports.signUp = catchAsync(async (req, res, next) => {
  /**
   * the reason dont pass in the entire req.body object is because it will compromise the security because the user can pass in
   * any data other than what is required and that puts the system at risk so it is better to only use those data that is
   * required to create a new user.
   * the risk is that the user can pass in the role as admin and can gain administrative controls!!
   */
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    changedAt: req.body.changedAt,
    role: req.body.role,
  });

  //send welcome mail
  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(user, url).sendWelcome();

  /**
   * JWT(json web token) is a encryption standard used to encrypt a certain payload(information) using symmetric key cryptography
   * usually SHA-256 is used as the algorithm to encrypt.
   * In this particular case the receiver dont need to know the secret so only the server really knows the secret(private key).
   * on the server we create a token using the id of the newly created user as payload and encrypt it using a secret key
   * and sent this token to the user or client machine which then will be stored either in the cookies or some other file
   * system.
   *
   */
  await createSendToken(user, 201, res);
});

//LOGIN
exports.logIn = async (req, res, next) => {
  const { email, password } = req.body;
  //1.check whether user-email && password is provided or not
  if (!email || !password) {
    return next(new AppError('Please provide email address and password', 400));
  }

  //2.check if email exist(i.e. user exist or not) && check for correct password

  //we have not selected password to return when we select a document in the userSchema and so we have to manually select it
  //while querying for the document which can be done using "select('+name')" where "+" indicates to select and return that
  //field as well!! "-" ---> can be used to not select that field when returning a document!
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3.create a token and send it to the user!!
  await createSendToken(user, 200, res, 'login successful');
};

/**
 * a norm or convention while sending a token from the client side is to send it inside the url header with the name set to
 * "authorization" and the value set to  "Bearer _yourJWTToken" where Bearer is just a convention to specify that the user is the
 * the bearee of the token!!
 */
exports.protect = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;
  let token;

  //1.CHECK IF AUTHORIZATION WITH JWT TOKEN HAS BEEN SEND BY THE USER
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  //2.CHECK IF THERE IS A TOKEN
  if (!token) {
    return next(new AppError('You are not logged in.Please log in!', 401));
  }

  //3.CHECK IF THE TOKEN IS VALID AND NOT TAMPERED WITH
  //the jwt.verify() uses a callback function approach to execute the asynchronous function but to keep the code uniformity we will
  //promisify this async function to use async/await!!
  //promisify is an inbuild method of "util" module provided by the core_modules of nodejs which basically add a "async" keyword to
  //the function declaration and awaits the asynchronous code inside it and returns the data!!

  //check if token is valid and whether it is expired or not!!
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_PRIVATEKEY
  );

  //4.CHECK IF USER STILL EXIST IN DATABASE
  /**
   * because it may happen that after the token has been issued to the user he/she may delete the account and in this case
   * you should not login even if the JWT token is valid!!
   */
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user does not exist!!Please login again!'));
  }

  //5.CHECK IF USER HAS CHANGED THE PASSWORD AFTER THE TOKEN WAS ISSUED!!
  /**
   * if suppose the user changed the password because the JWT token has been compromised and to protect from it he/she
   * changed the password!!and so if the token issued time is less than the "chnagedAt" time of password then deny access!!
   */
  // const isChanged = currentUser.isPasswordChangedAfter(decoded.iat);
  if (currentUser.isPasswordChangedAfter(decoded.iat)) {
    return next(new AppError('Token has expired.Please login again!!'));
  }

  //if all the above steps are verified only then give access to the user!!
  //a crucial step is to store the current user document in the request object which can then be used to check
  //for a number of things in the coming middleware function!!
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

//since we cannot pass in our own arguments inside a middleware function we use the power of closure to wrap the middleware
//function inside another function and pass the arguments we want inside the outer function which then can be accessed by
//the inner function(middleware function)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //check if the user role is included in the permission granted roles!!
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to do the operation!', 403)
      );
    }

    //you have permission
    next();
  };
};

//FORGOT PASSWORD
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1.CHECK IF THE USER EMAIL PROVIDE IS VALID
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError(
        'User does not exist!PLease provide a valid email address',
        404
      )
    );
  }

  //2.GENERATE A TOKEN AND SAVE IT TO THE DATABASE FOR COMAPARISON
  const token = user.getPasswordResetToken();
  console.log(token);

  //save the document to the database using the save() method on the model object which coerses itself based on the data provided
  //that is if you provide data to create a document it will create a new document and if you provide data to update then
  //it will update so on and so forth for replace and for other query as well.
  //switch validation check off before saving the document so that it does not throw a validation error because it demands that you to
  //provide all the required fields again which we dont want here!!
  user.save({ validateBeforeSave: false });

  //3.SEND THE MAIL
  //the .get() method is not only used too get the route on a router but also it can be used to get other data from different objects
  //in node we can set() data on something and then we can get() data from it!!

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}//api/v1/users/resetpassword/${token}`;

  // const message = `Forgot your passsword? Submit your Patch request along with your new password and confirmPassword to this url: ${resetURL}.If you dont want to reset your password please ignore this message!! `;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token!(only valid for 10 min)',
    //   message,
    // });
    await new Email(user, resetURL).sendForgotPassword();

    res.status(200).json({
      status: 'success',
      message: 'token sent to the mail',
    });
  } catch (err) {
    user.resetToken = undefined;
    user.tokenExiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('could not send mial.Please try again later!!', 500)
    );
  }
});

//RESET PASSWORD
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.GET THE RESET-TOKEN FROM THE URL(i.e. from the req.params object)
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //2.GET THE USER FROM DATABASE TO WHOM THE TOKEN WAS ISSUED
  const user = await User.findOne({
    resetToken,
    tokenExpiry: { $gt: new Date().toISOString() },
  });

  if (!user) {
    return next(
      new AppError(
        'Invalid token or token has expired.Please repeat forgot Password steps again',
        400
      )
    );
  }

  //3.SET THE NEW PASSWORD AND CONFIRMPASSWORD AND REMOVE THE RESET-TOKEN AND TOKENEXPIRY FIELDS FROM THE DATABASE!!
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetToken = undefined;
  user.tokenExpiry = undefined;

  //here we dont need to use "validateBeforeSave" option because we actually want to run the validator!!
  await user.save();

  //4.CHANGE THE changedAt property inside the database
  //done using mongo middleware (pre()) on "save" hook and hence we used save() here instead of updateOne() or any other method!!

  //5.SENDING THE NEW JWT TOKEN FOR LOGIN
  await createSendToken(user, 201, res);
});

//UPDATE PASSWORD
exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log(req.body);
  //1.get the user based on the JWT token
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return next(new AppError('user not found', 404));
  }

  //2.confirm the current password
  const isCorrect = await user.isCorrectPassword(
    req.body.password,
    user.password
  );

  if (!isCorrect) {
    return next(new AppError('Please enter the correct current Password', 401));
  }

  //3.get the new password and update the database
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmPassword;

  //will run validators and mongo middleware
  await user.save();

  //4.issue a new JWT token
  await createSendToken(user, 201, res, 'password updated successfully');
});

//UPDATE INFORMATION OF USER
exports.updateUser = catchAsync(async (req, res, next) => {
  console.log(req.file);
  //1.Check if the user is trying to update password and if so throw an error
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'You are not authorized to update password using this route.Please use /updatepassword route',
        401
      )
    );
  }

  //function to only pass the allowed fields which can be updated!!
  const updateUser = filterUpdateObject(req.body, 'name', 'email');
  if (req.file) updateUser.photo = req.file.filename;

  //2.here we cannot use save() because it will run validators and if we switch validationBeforeSave to false it will not run the
  //validation check for updating fields and so we should use findByIdAndUpdate() instead and set runValidators to true
  const user = await User.findByIdAndUpdate(req.user._id, updateUser, {
    new: true,
    runValidators: true,
  });

  //3.Send message indicating operation successful
  res.status(202).json({
    status: 'success',
    message: 'fields updated',
    user,
  });
});

//we dont actually delete the user(document) from the database but instead we just set the active field to false
exports.deleteMe = catchAsync(async (req, res, next) => {
  //set the active field to false
  await User.findByIdAndUpdate(req.user._id, { active: false });

  //send a null response
  res.status(204).json({
    status: 'success',
    message: 'user deleted',
    data: null,
  });
});

//to check if the user is logged in or not
//to not display the login and signup button in pug templates!!
//the reason we dont use catchAsync here is because we dont want any error thrown when the user is logged out instead we just
//want to call next() which will then not set the user.locals.user value!!!
exports.isLoggedIn = async (req, res, next) => {
  try {
    let token;

    //1.CHECK for jwt token in cookies
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    //2.CHECK IF THERE IS A TOKEN
    if (!token) {
      return next();
    }

    //check if token is valid and whether it is expired or not!!
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_PRIVATEKEY
    );

    //4.CHECK IF USER STILL EXIST IN DATABASE
    /**
     * because it may happen that after the token has been issued to the user he/she may delete the account and in this case
     * you should not login even if the JWT token is valid!!
     */
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    //5.CHECK IF USER HAS CHANGED THE PASSWORD AFTER THE TOKEN WAS ISSUED!!
    /**
     * if suppose the user changed the password because the JWT token has been compromised and to protect from it he/she
     * changed the password!!and so if the token issued time is less than the "chnagedAt" time of password then deny access!!
     */
    // const isChanged = currentUser.isPasswordChangedAfter(decoded.iat);
    if (currentUser.isPasswordChangedAfter(decoded.iat)) {
      return next();
    }

    //we can add user document to res.locals which then can be accessed by the pug templates!!!beacuse all the data that the pug
    //templates use are called locals and it is stored in res.locals object!!!
    res.locals.user = currentUser;
    next();
  } catch (error) {
    next();
  }
};

exports.logout = async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};
