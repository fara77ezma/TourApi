const mongoose = require('mongoose');
const slugify = require('slugify');
// eslint-disable-next-line no-unused-vars
const validator = require('validator');

const TourSchema = mongoose.Schema;
//const User = require('./User');

const Tour = new TourSchema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour must have name less than or equal to 40 charachters',
      ], // only avaliable in strings types
      minlength: [
        10,
        'A tour must have name more than or equal to 10 charachters',
      ], // only avaliable in strings types
      // validate:[validator.isAlpha,'Tour name must only contain charachters']
      // select: false, //to exclude this field from the querys send back to the client
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Diffuculty is either easy or medium or difficult',
      }, // only for strings
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'], // with numbers and dates
      max: [5, 'Rating must be below 5.0'], // with numbers and dates
      set: (val) => Math.round(val * 10) / 10, // set is called every time we put a new value or update the current value
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator(val) {
          return val < this.price; // this only refers to the current document on NEW document creation not works with updates operations
        },
        message: 'Discount price ({VALUE}) should be less than regular price', // VALUE is the same as val its a mongoose thing to get acess to the value in message
      },
    },

    images: [String], // type: array of strings
    createdAt: {
      type: Date,
      default: Date.now,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        // emded documents always need to use array to embedd new document in the parent document
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    // options
    toJSON: { virtuals: true }, // when there is a virtual property (not stored in database but calculated from other property) it will show in the query output
    toObject: { virtuals: true },
  },
);
Tour.index({ price: 1, ratingsAverage: -1 }); //its a combined index and also play the role of single index for each field separately so we don't have to Initialize an index for price or ratingsAverage again
Tour.index({ slug: 1 });
Tour.index({ startLocation: '2dsphere' }); //index used because of geospatial

// 1 => for ascending sort, -1 => for descending sort

// Document midlware : runs before .save() and .create() but not in any other functions
Tour.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); // this is refer ro the currently process document // slugify just put - instead of the space  // this.slug but the result from the slugify in the slug field

  next(); // to get to the next (pre) midlware
});
/*Tour.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id)); // here await returns array of promises not the documents directly because we use it inside map function which asynchronous function that returns arrayofpromises need to be awaits
  this.guides = await Promise.all(guidesPromises); // await all promises in parallel
  next();
});*/ //for emdeding users but it has alot of drawbacks
Tour.post('save', (doc, next) => {
  // post it execute after all the pre midelwares finished it doesn't get acess to (this) but get acess to finished document (doc)

  next(); // to get to the next (post ) midlware
});
// virtual doesn't get store in the database
// we can't use it in query because it technically not part of the database
// its a good example to practice "we should have models with as much business logic we can offload to them and thin controllers with as less business logic as we can"
Tour.virtual('durationWeeks').get(function () {
  // get to call this in every get request // remember : arrow functions doesn't have this keyword
  return this.duration / 7; // this points to this document
});
//virtual populate (just like keeping an array of reviews ids in the Tour model but without storing it in database )
Tour.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tourId', //Just like foreign key
  localField: '_id', //just like primary key
});
// Query midlware : runs before any commands starts with find
Tour.pre(/^find/, function (next) {
  // this reqular expression it to make this midleware happend when we use any commands starts with find
  this.find({ seccretTour: { $ne: true } }); // this is query object we can chain all of the methods that we have in queries
  this.start = Date.now(); // we can define any field we want because it a reguler object (اوبجيكت عادي يعني)
  next(); // to get to the next (pre) midlware
});
Tour.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  }); //to get user data from user model (only on the query not in the actual data)
  next();
});
Tour.post(/^find/, function (docs, next) {
  console.log(`Time tooks for this query ${Date.now() - this.start} ms`);
  // console.log(docs);
  next(); // to get to the next (pre) midlware
});

// aggregate midlware
// Tour.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { seccretTour: { $ne: true } } }); // this.pipline is an array , unshift() is js function to add element in the start of the array
//   console.log(this.pipeline());
//   next();
// });
module.exports = mongoose.model('Tour', Tour);
