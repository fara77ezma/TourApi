/* eslint-disable prettier/prettier */
const Review = require('../models/Review');
//const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');
const factory = require('./factoryHandler');

const createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tourId) req.body.tourId = req.params.tourId;
  if (!req.body.userId) req.body.userId = req.user.id;
  const review = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    userId: req.body.userId,
    tourId: req.body.tourId,
  });
  res.status(201).json({
    status: 'sucess',
    data: {
      review,
    },
  });
});

const getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tourId: req.params.tourId };
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'sucess',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});
const deleteReview = factory.deleteOne(Review);

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
};
