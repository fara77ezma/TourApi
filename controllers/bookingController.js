/* eslint-disable prettier/prettier */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Tour = require('../models/Tour');

const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');

exports.createCustomer = catchAsync(async (req, res, next) => {
  const email = req.user.email;
  const customers = await stripe.customers.list({ email: email });
  //console.log(customers, ' ', email);
  let customer;
  if (customers.data.length === 0) {
    customer = await stripe.customers.create({
      email: email,
      source: 'tok_visa', // Use a test card token
    });
  } else {
    customer = customers.data[0];
  }
  req.customer = customer.id;
  next();
});

exports.getCheckout = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  const charge = await stripe.charges.create({
    amount: tour.price * 100, // Amount in cents
    currency: 'usd',
    description: 'Book new Tour',
    customer: req.customer,
  });
  if (charge.status === 'succeeded') {
    const booking = await Booking.create({
      tourId: req.params.tourId,
      userId: req.user.id,
      price: tour.price,
    });
    res.status(201).json({
      status: 'sucess',
      message:
        'Payment successful. The money has been transferred successfully.',
      data: {
        data: booking,
      },
    });
  } else {
    res.status(402).json({
      status: 'sucess',
      message: 'Payment Failed. Please check your data and try again.',
    });
  }
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) Find all Bookings
  const bookings = await Booking.find({ userId: req.user.id });

  //2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tourId);
  const tours = await Tour.find({ _id: { $in: tourIDs } }); //$in return the tours which _id is in the tourIDs
  res.status(200).json({
    status: 'sucess',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
exports.createNewBooking = factory.createOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.getOneBooking = factory.getOne(Booking);
exports.deleteOneBooking = factory.deleteOne(Booking);
exports.updateOneBooking = factory.updateOne(Booking);
