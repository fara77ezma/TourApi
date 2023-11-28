const jwt=require('jsonwebtoken');
const catchAsync= require('../utils/catchAsync');
const AppError= require('../utils/appError');
const {promisify}= require('util');


const User = require('../models/User');
const signToken=(id)=>{
 return   jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRS_IN,//will add some additional data to payload but that's okay
    })
}
const signup=catchAsync(async (req,res,next)=>{
    //const newUser=await User.create(req.body); //we replace it because of security flow anyon can sign up as an admin!!!!!
    const newUser=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
    });
    const token=signToken(newUser._id);
    
    res.status(201).json({
        status:"sucess",
        token,
        data:{
        user:newUser,
    },
    })
})

const login=catchAsync(async(req,res,next) => {
    const {email,password}=req.body;
    //1) check if there is email and passwords
    if(!email||!password)
    {
      return next(new AppError('Please provide email and password',400));//never forget the return to send only one result to the client
    } 
    //2) check if email is exist && password is correct

    const user=await User.findOne({email}).select('+password');//select password explicitly
   // const correct= await user.correctPasswords(password,user.password);
    console.log(user);
    if(!user||!await user.correctPasswords(password,user.password)/*use the instance function declared in User model*/)
    {
        return next(new AppError('Incorrect email or password !',401));
    }
     
    //3)if everything is ok, send token to the client
    const token=signToken(user._id);
    res.status(200).json({
        status:"sucess",
        token
    });
});
const protect=catchAsync(async(req,res,next)=>{
    let token;
    //1)getting token and check of it's there
     if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer'))
     {
         token=req.headers.authorization.split(' ')[1];
     }
     if(!token)
     {
        return next(new AppError('You are not logged in! Please log in to get access.',401));
     }
    //2)verification token
      const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET); //because jwt use callbacks and doesn't use promises so we use promisify to make it use promises
      console.log(decoded);
    //3)check if user still exists
    //4)check if user changed password after the token was issued

    next();
})
module.exports={
    signup,
    login,
    protect,

}
