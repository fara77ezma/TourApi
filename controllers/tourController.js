const Tour = require('../models/Tour');
const APIFeatures=require('../utils/apiFeatures')
const createTour=async(req,res)=>{
  try {

    const newTour=await  Tour.create(req.body);

    res.status(200).json({
      status:"sucess",
      data:{
        tour:newTour
    }});
  } catch (e) {
    console.log(e);
    res.status(400).json({
      status:"fail",
      error:"Invalid Data Sent!"
    });
  }
}

const getAllTours=async(req,res)=>{
  try {
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
  } catch (e) {
    console.log(e);

    res.status(400).json({
      status:"fail",
      error:"Invalid Data Sent!"
    });
  }
}
const getTour=async(req,res)=>{
  try {
    const ourTour=await  Tour.findById(req.params.id);

    res.status(200).json({
      status:"sucess",
      data:{
        tours:ourTour

    }});
  } catch (e) {
    console.log(e);

    res.status(400).json({
      status:"fail",
      error:"Invalid Data Sent!"
    });
  }
}
const updateTour=async(req,res)=>{
  try {
    const ourTour=await  Tour.findByIdAndUpdate(req.params.id,req.body,{
      new:true //to send the updated document rather than the original to the client
     ,runValidators:true // to run the validators we but in the schema again
    });
    res.status(200).json({
      status:"sucess",
      data:{
        tours:ourTour
    }});
  } catch (e) {
    console.log(e);

    res.status(400).json({
      status:"fail",
      error:"Invalid Data Sent!"
    });
  }
}

const deleteTour=async(req,res)=>{
  try {
  await  Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status:"sucess",

    });
  } catch (e) {
    console.log(e);

    res.status(400).json({
      status:"fail",
      error:"Invalid id!"
    });
  }
}
module.exports={
  createTour,
  getAllTours,
  getTour,
  updateTour,
  deleteTour
}
