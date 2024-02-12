const Tour = require('../models/Tour');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');
const multer = require('multer');
const sharp = require('sharp');

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
//upload.array('images',5) // for only one field with multiple images // req.files
const uploadTourImages = upload.fields([
  // for  more than one field // req.files
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
const resizeTourImages = (req, res, next) => {
  console.log(req.files);
  next();
};
const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // its a mongodb object but mongoose give it to us to deal with. everything about it in mongodb documantaion
    // {
    //   $match:{ratingsAverage:{$gte:4.5}},
    // },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 }, // add one for each document  numTour+=1 for each document
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1, // 1 is for asc sorting
      },
    },
    //   {
    // //  $match:{_id:{$ne:'EASY'}}  //every stage is dealing with the result of the previous stage
    //   }
  ]);
  res.status(200).json({
    status: 'sucess',
    data: { stats },
  });
});

const getMontlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', // create a seprate document for each element in the array
    },
    {
      // mach the data with condtitions you put
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        // group the data with specific field data you choose
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' }, // just add new fields
    },
    {
      $project: {
        _id: 0, // 0 value -> means not appear in the reault  1 value -> means it will appear in result
      },
    },
    {
      $sort: { numTourStarts: -1 }, // 1 value ->  for asc  , -1 value -> for desc
    },
    {
      $limit: 6, // allow us to have only 6 or any other number you choose documents in the result
    },
  ]);
  res.status(200).json({
    status: 'sucess',
    results: plan.length,
    data: { plan },
  });
});
///tours-within/:distance/center/:latlng/unit/:unit
const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitur and longitude in the format of lat,lng.',
        400,
      ),
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }, //in geospatial it takes the lng first and the lat second
  });
  res.status(200).json({
    status: 'sucess',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitur and longitude in the format of lat,lng.',
        400,
      ),
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        //its always valid as the first stage in geospatial pipeline (it needs at least one index used in geospatial and if its only one used in geospatial it use it by default to
        // calculate  the distance but if it more than one we  specify the attribute we want to use to calculate the distance by using the (key)
        near: {
          //its a mandatory field in $geoNea
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance', // the name of the field we will store all the calculations in it //its a mandatory field in $geoNear
        distanceMultiplier: multiplier, // optional field (specified a number to multiply to all distance fields )
      },
    },
    {
      $project: {
        // to specify only the fields you need to appear in the result
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'sucess',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});
const createTour = factory.createOne(Tour);

const getAllTours = factory.getAll(Tour);
const getTour = factory.getOne(Tour, { path: 'reviews' });
const updateTour = factory.updateOne(Tour);

const deleteTour = factory.deleteOne(Tour);
module.exports = {
  createTour,
  getAllTours,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMontlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
};
