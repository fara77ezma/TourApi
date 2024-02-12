/* eslint-disable new-cap */
const crypto = require('crypto'); // buildin node function
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema;
const User = new UserSchema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true, // its going to convert the email entered to lowercase
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'Please enter you password!'],
    minlength: 8,
    select: false, // to never show the password in any output
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please enter you password again!'],
    validate: {
      validator(el) {
        // this only gonna work on CREATE and SAVE!!!
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },

  photo: {
    type: String,
    default: 'default.jfif',
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
User.pre('save', async function (next) {
  // only run the function when the password is modeified
  if (!this.isModified('password')) return next();
  // hash the password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt); // 12 is the same as we but in  salt  // the higher the number the more powerful encrypted and the more cpu intensive
  // delete the passwordConfirm field
  this.passwordConfirm = undefined; // we only want it to the validation process and now we can remove it
  next();
});
User.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // miuns one second because accessing database it take more time than createing jwt token so its to ensure the token has always made after the password has been updated (not 100% accurate but good hack to work with)

  next();
});
User.pre(/^find/, function (next) {
  // to do the query midlware at every query start with find
  // its a query midlware so this here refer to the current query
  this.find({ active: { $ne: false } });
  // every query start with find will do this filter first before the query executed
  next();
});
User.methods.correctPasswords = async function (
  candidatePassword,
  userPassword,
  // this called an instance function it will be available in every user document or instance
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
User.methods.changedPasswordAfterToken = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // this refer to the current document
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    ); // getTime give the time in millisecond and JWT iat give time in seconds so we have to convert all in seconds and convert it to int number for compersion //10 for base 10 (decimal numbers)
    console.log(JWTTimestamp, changedTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  // False means not changed
  return false;
};
User.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); // encrypted to store in database
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10mins
  return resetToken; // send the original in email
};
module.exports = mongoose.model('User', User);
