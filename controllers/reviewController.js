/* eslint-disable prettier/prettier */
const Review = require('../models/Review');
const Booking = require('../models/Booking');

//const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');

const setTourUserIds = catchAsync(async (req, res, next) => {
  if (!req.body.tourId) req.body.tourId = req.params.tourId;
  if (!req.body.userId) req.body.userId = req.user.id;
  const booking = await Booking.find({
    userId: req.body.userId,
    tourId: req.body.tourId,
  });
  if (booking.length === 0)
    return next(
      new AppError(
        'You are not authorized to submit a review for a tour that you have not booked.',
        403,
      ),
    );
  next();
});

const getAllReviews = factory.getAll(Review);
const getReview = factory.getOne(Review);
const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateOne(Review);
const createReview = factory.createOne(Review);

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
};
