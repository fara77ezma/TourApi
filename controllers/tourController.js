const Tour = require('../models/Tour');
const APIFeatures=require('../utils/apiFeatures')
const catchAsync= require('../utils/catchAsync');
const AppError=require('../utils/appError');

const createTour=catchAsync(async(req,res,next)=>{


    const newTour=await  Tour.create(req.body);

    res.status(200).json({
      status:"sucess",
      data:{
        tour:newTour
    }});

});

const getAllTours=catchAsync(async(req,res,next)=>{
 
    //Build a query
const features=new APIFeatures(Tour.find(),req.query)
              .filter()
              .sort()
              .limitFields()
              .paginate();
//execute query
    const ourTours=await features.query;

    res.status(200).json({
      status:"sucess",
      results:ourTours.length,
      data:{
        tours:ourTours
    }});
  
})
const getTour=catchAsync(async(req,res,next)=>{
  
    const ourTour=await  Tour.findById(req.params.id);
    if(!ourTour)
    {
      return next(new AppError('No tour found with that ID',404));
    }
// console.log(ourTour.ratingsAvarage);
    res.status(200).json({
      status:"sucess",
      data:{
        tours:ourTour

    }});
  
    
});
const updateTour=catchAsync(async(req,res,next)=>{
  
    const ourTour=await  Tour.findByIdAndUpdate(req.params.id,req.body,{
      new:true //to send the updated document rather than the original to the client
     ,runValidators:true // to run the validators we but in the schema again
    });
    if(!ourTour)
    {
      return next(new AppError('No tour found with that ID',404));
    }
    res.status(200).json({
      status:"sucess",
      data:{
        tours:ourTour
    }});
 
});

const deleteTour=catchAsync(async(req,res,next)=>{
 
  const ourTour=await  Tour.findByIdAndDelete(req.params.id);
  if(!ourTour)
  {
    return next(new AppError('No tour found with that ID',404));
  }
    res.status(200).json({
      status:"sucess",

    });
  
});

const getTourStats=catchAsync(async(req,res,next)=>{
 
 const stats=await Tour.aggregate([       //its a mongodb object but mongoose give it to us to deal with. everything about it in mongodb documantaion
    // {
    //   $match:{ratingsAverage:{$gte:4.5}},
    // },
    {
      $group:{
        _id:{$toUpper:'$difficulty'},
        numTours:{$sum:1},// add one for each document  numTour+=1 for each document
        avgRating:{$avg:'$ratingsAverage'},
        avgPrice:{$avg:'$price'},
        minPrice:{$min:'$price'},
        maxPrice:{$max:'$price'}

      }
    },
    {
      $sort:{
        avgPrice:1 // 1 is for asc sorting
      }
    },
  //   {
  // //  $match:{_id:{$ne:'EASY'}}  //every stage is dealing with the result of the previous stage
  //   }
 ])
 res.status(200).json({
   status:"sucess",
   data:{stats},

 });

  
});


const getMontlyPlan=catchAsync(async(req,res,next)=>{
 
  const year=req.params.year * 1;
  const plan= await Tour.aggregate([
           {
             $unwind:'$startDates', //create a seprate document for each element in the array
           },
           {
             $match:                  // mach the data with condtitions you put
             {
               startDates:{
                 $gte:new Date(`${year}-01-01`),
                 $lte:new Date(`${year}-12-31`),


               }
             }
           },
           {
             $group:{          // group the data with specific field data you choose
               _id:{$month:'$startDates'},
               numTourStarts:{$sum:1},
               tours:{$push:'$name'}
             }
           },
           {
          $addFields:{month:'$_id'} // just add new fields
        },
        {
           $project:{
             _id:0 // 0 value -> means not appear in the reault  1 value -> means it will appear in result
           }
        },
        {
        $sort:{numTourStarts:-1} // 1 value ->  for asc  , -1 value -> for desc
      },
      {
        $limit :6 // allow us to have only 6 or any other number you choose documents in the result
      }

  ])
  res.status(200).json({
    status:"sucess",
    results:plan.length,
    data:{plan},

  });
  
});


module.exports={
  createTour,
  getAllTours,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMontlyPlan

}
