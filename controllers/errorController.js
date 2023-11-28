const AppError=require('../utils/appError');

const handleCastErrorDB=err=>{
    const message=`Invalid ${err.path} : ${err.value}`;
    return new AppError(message,400);
}
const handleDuplicateFieldsDB=err=>{
    // const value=err.errmsg.match(/(.*?)/)[0];
    // console.log(value);
    const message=`Duplicate field value:${err.keyValue.name}. Please use another value!`;
    
    return new AppError(message,400);

}
const handleValidationErrorsDB=err=>{
    const errors= Object.values(err.errors).map(el=>el.message);

    const message=`Invalid input data! ${errors.join('. ')}`;
    
    return new AppError(message,400);

}
const handleJWTErrors=()=> new AppError('Invalid token! Please log in again.',401);
const handleJWTExpiredErrors=()=> new AppError('Your token has expired! Please log in again.',401);
const sendErrorDev=(err,res)=>{
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message,
        error:err,
        stack:err.stack
    })
}
const sendErrorProd=(err,res)=>{
    //opretional, trusted error: send message to the client
    if(err.isOpertional){
      //  console.log(err);
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message,
        })}
    else {
        //programming, unknown error: don't leak details to the client
        //1) log the error
        console.error("Error: ",err);
        //2)Send generic message
        res.status(500).json({
            status:'error',
            message:'somthing went very wrong!',
           
        }) 
    }
}
const error =(err,req,res,next)=>{ // 4 params makes express knows this is an error handling midlware
    // console.log(err.stack);
err.statusCode=err.statusCode||500;
err.status=err.status||'error';
console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV==='development') {
    // console.log("tessssssssssssssssst");

    sendErrorDev(err,res);
} 
else if(process.env.NODE_ENV.trim()==='production'){

    let error={...err};

    
   

    if(err.name==='CastError') error=handleCastErrorDB(error);
    if(err.code===11000) error=handleDuplicateFieldsDB(error);
    if(err.name==='ValidationError')error=handleValidationErrorsDB(error);
    if(err.name==='JsonWebTokenError')error=handleJWTErrors();
    if(err.name==='TokenExpiredError')error=handleJWTExpiredErrors();

    


    sendErrorProd(error,res);
}

}
module.exports=error;