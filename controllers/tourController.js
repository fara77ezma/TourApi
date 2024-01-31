const Tour = require('../models/Tour');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');

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
};
