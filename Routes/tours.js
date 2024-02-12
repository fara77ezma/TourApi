const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviews');

//const reviewController = require('../controllers/reviewController');

router.use('/:tourId/reviews', reviewRouter); //it redirect to the reviewRouter just like we do in app.js (router is a middleware in itself so we could use (use method on it))

router.get('/tour-stats', tourController.getTourStats);
router.get(
  '/montly-plan/:year',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMontlyPlan,
);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );
router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  )
  .get(tourController.getAllTours);
module.exports = router;
