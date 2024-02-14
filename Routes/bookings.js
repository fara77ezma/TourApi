/* eslint-disable prettier/prettier */
const express = require('express');

const router = express.Router(); //  mergeParams: true => to make the router get access to params from other routers
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

router.get(
  '/book-tour/:tourId',
  authController.protect,
  bookingController.createCustomer,
  bookingController.getCheckout,
);
router.get('/my-tours', authController.protect, bookingController.getMyTours);
router.route('/').get(authController.protect, bookingController.getAllBookings);
router
  .route('/:id')
  .get(authController.protect, bookingController.getOneBooking)
  .delete(authController.protect, bookingController.deleteOneBooking);

module.exports = router;
