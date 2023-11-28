const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcrypt');

const userSchema=mongoose.Schema;
const User=new userSchema({
  name:{
    type:String,
    required:[true,'Please tell us your name!'],
  },
  email:{
    type:String,
    required:[true,'Please provide your email!'],
    unique:true,
    lowercase:true, // its going to convert the email entered to lowercase
    validate:[validator.isEmail,'Please provide a valid email']
  },
  password:{
    type:String,
    required:[true,'Please enter you password!'],
    minlength:8,
    select:false, // to never show the password in any output

  },
  passwordConfirm:{
    type:String,
    required:[true,'Please enter you password again!'],
    validate:
    {
      validator:function(el){ //this only gonna work on CREATE and SAVE!!!
        return el === this.password;
      },
      message:"Passwords are not the same!"
    }
  },
  photo:{
    type:String,
    
  },
})
User.pre('save',async function(next){
  //only run the function when the password is modeified
  if(!this.isModified('password')) return next();
  // hash the password with cost of 12
  const salt= await bcrypt.genSalt(12);
this.password=await bcrypt.hash(this.password,salt);//12 is the same as we but in  salt  // the higher the number the more powerful encrypted and the more cpu intensive
//delete the passwordConfirm field
this.passwordConfirm=undefined; // we only want it to the validation process and now we can remove it 
next();

})
User.methods.correctPasswords= async function(candidatePassword,userPassword) //this called an instance function it will be available in every user document 
{
return await bcrypt.compare(candidatePassword,userPassword);
}
module.exports=mongoose.model('User',User);
