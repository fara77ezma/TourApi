const mongoose=require('mongoose');
const tourSchema=mongoose.Schema;

const Tour=new tourSchema({
  name:{
    type:String,
    required:[true,"A tour must have a name"],
    unique:true,
    trim:true,
    select: false, //to exclude this field from the querys send back to the client

  },

  duration:{
    type:Number,
    required:[true,"A tour must have a duration"]
  },
  maxGroupSize:{
    type:Number,
    required:[true,"A tour must have a group size"]
  },
  difficulty:{
    type:String,
    trim: true,
    required:[true,"A tour must have a difficulty"],
  },
  ratingsAvarage:{
    type:Number,
    defualt:4.5
  },
  ratingsQuantity:{
    type:Number,
    defualt:0
  },
  price:{
    type:Number,
    required:[true,"A tour must have a price"]
  },
  summary:{
    type:String,
    trim: true
  },
  description:
  {
    type:String,
    trim: true,
    required:[true,"A tour must have a description"]

  },
  imageCover:{
    type:String,
    required:[true,"A tour must have a cover image"]

  },
  priceDiscount:{Type:Number},

  images:[String], //type: array of strings
  createdAt:{
    type:Date,
    defualt:Date.now
  },
  startDates:[Date],
})
module.exports=mongoose.model('Tour',Tour);
