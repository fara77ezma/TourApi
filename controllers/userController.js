const User = require('../models/User');
const APIFeatures=require('../utils/apiFeatures')
const catchAsync= require('../utils/catchAsync');
const AppError=require('../utils/appError');
const filterObj=(obj,...allowedFields)=>{
    const newObj={};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el))newObj[el]=obj[el];
    })
    return newObj;
}
const getALlUsers=catchAsync(async(req,res,next)=>{
 
    const users=await User.find();
    
    res.status(200).json({
        status:"sucess",
        data:users
       });
}
)
const updateMe=catchAsync(async(req,res,next)=>{
    //1) Create error if user POSTs a password data
    if(req.body.password||req.body.passwordConfirm) return next(new AppError('This route is not for password updates. Please use /updateMyPassword.',400));

     //2) Filteres out unwanted fields names that are not allowed to be updated 
    const filteredObj=filterObj(req.body,'name','email');
    //3)Update user document
    //its ok to use findByIdAndUpdate when you don't deal with sensetive data like passwords
    const user=await User.findByIdAndUpdate(req.user.id,filteredObj,{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        status:"sucess",
        data:{
            user
        }
       });
}
)

const deleteMe=catchAsync(async(req,res,next)=>{
 

   
    //3)Update user document make the account inactive
    const user=await User.findByIdAndUpdate(req.user.id,{active:false},{
        new:true,
        runValidators:true
    });
    res.status(204).json({
        status:"sucess",
        data:null
       });
}
)

module.exports={
    updateMe,
    deleteMe,
    getALlUsers
}