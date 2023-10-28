const mongoose=require('mongoose');
const userSchema=mongoose.Schema;
const User=new userSchema({
  username:{
    type:string,
    required:true,
    unique:true
  },
  password:{
    type:string,
    required:true
  },
})
module.exports=mongoose.model('Post',User);
