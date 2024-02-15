/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
// const Tour = require('./Tour');

const BookingSchema = mongoose.Schema;
const Booking = new BookingSchema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user.'],
    },
    tourId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a tour.'],
    },
    price: {
      type: Number,
      required: [true, 'Booking must have a price.'],
    },
    paid: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    // options
    toJSON: { virtuals: true }, // when there is a virtual property (not stored in database but calculated from other property) it will show in the query output
    toObject: { virtuals: true },
  },
);
Booking.index({ userId: 1, tourId: 1 }, { unique: true }); // to prevent duplicate bookings (make the same user write only one booking on the same tour)
Booking.pre(/^find/, function (next) {
  this.populate('userId').populate({
    path: 'tourId',
    select: 'name',
  });
  next();
});

module.exports = mongoose.model('Booking', Booking);
