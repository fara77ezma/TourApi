/* eslint-disable prettier/prettier */
const express = require('express');

const router = express.Router(); //  mergeParams: true => to make the router get access to params from other routers
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

router.use(authController.protect);
router.post(
  '/book-tour/:tourId',

  bookingController.createCustomer,
  bookingController.getCheckout,
);
router.get('/my-tours', bookingController.getMyTours);
router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createNewBooking);
router
  .route('/:id')
  .get(bookingController.getOneBooking)
  .delete(bookingController.deleteOneBooking)
  .patch(bookingController.updateOneBooking);

module.exports = router;
