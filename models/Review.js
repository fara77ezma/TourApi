/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema;
const Review = new ReviewSchema(
  {
    review: {
      type: String,
      required: [true, "Review can't be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
    tourId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
  },
  {
    // options
    toJSON: { virtuals: true }, // when there is a virtual property (not stored in database but calculated from other property) it will show in the query output
    toObject: { virtuals: true },
  },
);
//Query midleware
Review.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tourId',
  //     select: 'name',
  //   }).populate({
  //     path: 'userId',
  //     select: 'name photo',
  //   });

  //every populate  produce a query
  this.populate({
    path: 'userId',
    select: 'name photo',
  });
  next();
});
module.exports = mongoose.model('Review', Review);
