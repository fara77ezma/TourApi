/* eslint-disable prettier/prettier */
const Review = require('../models/Review');
//const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');
const factory = require('./factoryHandler');

const setTourUserIds = (req, res, next) => {
  if (!req.body.tourId) req.body.tourId = req.params.tourId;
  if (!req.body.userId) req.body.userId = req.user.id;
  next();
};

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
