const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users'); //null in first argument mean that there is no error //cb just like next in our middlewares
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage(); // its better to use it when we do processing on images it stores the image as a buffer
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false); //400 for bad request
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadUserPhoto = upload.single('photo'); //for only one field and only one image in it // req.file

const resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  sharp(req.file.buffer) // it returns an object so we can use chain of functions on it
    .resize(500, 500) // resize the image
    .toFormat('jpeg') // change all image to jpeg with 90 percent quality
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`); // store the image in our machine finally
  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs a password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400,
      ),
    );
  }

  // 2) Filteres out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  // 3)Update user document
  // its ok to use findByIdAndUpdate when you don't deal with sensetive data like passwords
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'sucess',
    data: {
      user,
    },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  // 3)Update user document make the account inactive
  // eslint-disable-next-line no-unused-vars
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { active: false },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(204).json({
    status: 'sucess',
    data: null,
  });
});
const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
const getAllUsers = factory.getAll(User);

const getUser = factory.getOne(User);
const deleteUser = factory.deleteOne(User);

//Don't update passwords with this!
const updateUser = factory.updateOne(User);

module.exports = {
  updateMe,
  deleteMe,
  getAllUsers,
  deleteUser,
  updateUser,
  getUser,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
};
