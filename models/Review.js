/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const Tour = require('./Tour');

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

Review.index({ userId: 1, tourId: 1 }, { unique: true }); // to prevent duplicate reviews (make the same user write only one review on the same tour)
// Static methods have access to the model itself via the this keyword.
//This allows you to perform model-level operations, such as aggregations or direct queries against the database.
Review.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tourId },
    },
    {
      $group: {
        _id: '$tourId',
        nRatings: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].averageRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//Query middleware
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
//findByIdAndUpdate //has only query middlewares  in the query middleware we don't have access to the document to do this (this.constructor.calcAverageRating(this.tourId);)
//findByIdAndDelete //has only query middlewares  in the query middleware we don't have access to the document to do this (this.constructor.calcAverageRating(this.tourId);)
Review.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne(); // this refers to the current query we use findOne to execute the query and get the updated/deleted document because the calcAverageRating need the tourId paramter

  next();
});

Review.post(/^findOneAnd/, async function () {
  //this.r=await this.findOne(); //does NOT work here, query has already executed
  await this.r.constructor.calcAverageRating(this.r.tourId);
});

//Document MiddleWare
Review.post('save', function () {
  this.constructor.calcAverageRating(this.tourId); // this is for current query // constructor for the model which create the query because it doesn't declared yet
});

module.exports = mongoose.model('Review', Review);
