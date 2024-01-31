const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
//const { decode } = require('querystring');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRS_IN, // will add some additional data to payload but that's okay
  });
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRS_IN * 24 * 60 * 60 * 1000,
    ),
    //  secure:true, //the cookie will be sent only on encrypted connection basically when we use https
    httpOnly: true, // make the cookie can NOT be acessed or modeified in any way by the browser
  };
  if (process.env.NODE_ENV.trim() === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'sucess',
    token,
    data: {
      user,
    },
  });
};
const signup = catchAsync(async (req, res, next) => {
  // const newUser=await User.create(req.body); //we replace it because of security flow anyon can sign up as an admin!!!!!
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check if there is email and passwords
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400)); // never forget the return to send only one result to the client
  }
  // 2) check if email is exist && password is correct

  const user = await User.findOne({ email }).select('+password'); // select password explicitly
  // const correct= await user.correctPasswords(password,user.password);
  console.log(user);
  if (
    !user ||
    !(await user.correctPasswords(
      password,
      user.password,
    )) /* use the instance function declared in User model */
  ) {
    return next(new AppError('Incorrect email or password !', 401));
  }

  // 3)if everything is ok, send token to the client
  createSendToken(user, 200, res);
});
const protect = catchAsync(async (req, res, next) => {
  let token;
  // 1)getting token and check of it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }
  // 2)verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // because jwt use callbacks and doesn't use promises so we use promisify to make it use promises
  // console.log(decoded);
  // 3)check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist',
        401,
      ),
    );
  }
  // 4)check if user changed password after the token was issued
  if (currentUser.changedPasswordAfterToken(decoded.iat)) {
    return next(
      new AppError('User recently change password! Please log in again.', 401),
    );
  }

  // put entire user data in the request
  req.user = currentUser;
  // GRANT acess to protected route

  next();
});
const restrictTo =
  (...roles) =>
  // wrapper function contains our midlware function to make the midelware function deals with the paramerters path through the function
  (req, res, next) => {
    // roles ['admin','lead-guide']
    if (!roles.includes(req.user.role)) {
      // includes is a javascript array function return true if the array have the value passed in and false otherwise
      return next(
        new AppError('Your do not have permission to perform this action', 403),
      );
    }
    next();
  };
const forgetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }
  // 2)Generate the random  reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // to turn off all validators in the schema
  // 3)Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/users/resetPassword/${resetToken}`;
  const message = `Forget your password? Submit a PATCH request with your new password and password confirm to: ${resetURL}.\n if you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token  (valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'sucess',
      message: 'Token send to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'there was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});
const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }); // passwordResetExpires:{$gt:Date.now()} // if its greater than now date so the token not expired

  // 2)If token has not expired,and there is user,set the new password
  if (!user) return next(new AppError('Token is invalid or has expired', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // we want turn of validation because we want it to validate the passwords // pre save midlware in User model will encrypt the password

  // 3)Update changedPassworedAt property for the user
  // 4)Log the user in, send JWT
  createSendToken(user, 200, res);
});
const updatePassword = catchAsync(async (req, res, next) => {
  // 1)Get User from collection
  const currentUser = await User.findById(req.user._id).select('+password');
  // 2) Check if POSTed current password is correct

  if (
    !(await currentUser.correctPasswords(
      req.body.passwordCurrent,
      currentUser.password,
    ))
  ) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // 3) If so, update Password
  currentUser.password = req.body.password;
  currentUser.passwordConfirm = req.body.passwordConfirm;

  await currentUser.save();
  // User.findByIdAndUpdate will NOT work as intended!!!
  // 4)Log in user. send JWT

  createSendToken(currentUser, 201, res);
});
module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgetPassword,
  resetPassword,
  updatePassword,
};
