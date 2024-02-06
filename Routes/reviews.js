/* eslint-disable prettier/prettier */
const express = require('express');

const router = express.Router({ mergeParams: true }); //  mergeParams: true => to make the router get access to params from other routers
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

router.use(authController.protect); // it will protect all routes comes after it because middleware runs in sequence

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );
router
  .route('/:id')
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .get(reviewController.getReview);

module.exports = router;
