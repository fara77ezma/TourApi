const catchAsync= fn=>{
    return (req,res,next)=>
    {
      fn(req,res,next).catch(err=>next(err)); // or fn(req,res,next).catch(next);
    }
  }
  module.exports=catchAsync;