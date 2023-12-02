const mongoose=require('mongoose');
const express=require('express');
const rateLimit=require('express-rate-limit'); //to prevent the same ip from making too much requests //limiting deinal of services attacks and also brute force attacks
const helmet=require('helmet');// setting security http headers
const mongoSanitizie=require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');
const app= express();
const jwt= require('jsonwebtoken');
const dotenv=require('dotenv');
const morgan=require('morgan');
const globalErrorHandler=require('./controllers/errorController');
const AppError=require('./utils/appError');
//its for errors or bungs in sync code
process.on('uncaughtException',(err)=>{ //this events not gonna happend async so we don't need the server at all
    console.log('uncaught Exception! shutting dowm.....');
    console.log(err.name,err.message);

        process.exit(1);  // very nescessary to crash our application


})

dotenv.config({path:'./config/config.env'});
//1)Global midlwares

//Set security HTTP headers
app.use(helmet());//its good to put it early in the midlware stack so this headers are really sure to be set


//body parser, reading data from body into req.body
app.use(express.json({limit:'10kb'}));// limit:'10kb' : make the maximum size to the body is 10 kilobyte

//AFTER reading the data to req.body
//DATA SANTIZATION against NOSQL query injection 
//if you try to log in with only password and this email structre "email":{"$gt":""}, you will logged in sucessfully so this why we need to protect our site from NOSQL query injection
app.use(mongoSanitizie()); //it looks to all req.body and req.params and remove all $ and . so this type of queries can't work

//DATA SANTIZATION against XSS cross-site scripting attacks 

app.use(xss());//  ensuring that user inputs are treated as plain text and not as executable code


//Preventing Parameter Pollution
app.use(hpp({//used to clear up the query string and deal with duplicated fields and only accept the last value of the field
    whitelist:['duration','ratingsAverage','ratingsQuantity','maxGroupSize','difficulty','price'] //array of properities which we actually  allow duplicates in the query string
})); 





//Devlopement logging
if(process.env.NODE_ENV=='development')app.use(morgan('dev'));




//Limit requests from same IP
const limiter=rateLimit({
    max:100,
    windowMs:60*60*1000, 
    message:'Too many requests from this IP, please try again in an hour!' //error message to send when it reaches the limits 
}) //this will allow maximum of 100 requests from the same ip in  one hour 
app.use('/api',limiter) //to only affects the rouets starts with /api



//Some test midlware 
app.use((req,res,next)=>{
    //  console.log(req.headers);
      next();
  })

  


//2)Connect to database
mongoose.connect(process.env.MONGO_URI,{
}).then(()=>console.log("connect succesfully!"));
mongoose.set('setDefaultsOnInsert', true);
const server=app.listen(3000);

//3)ROUTES
app.use('/api/users',require('./Routes/users'));

app.use('/api/tours',require('./Routes/tours'));

app.all('*',(req,res,next)=>{ // all -> is to handle all http requests types , * -> is to handle all the url would pass to it
    
    next(new AppError(`Can't find this ${req.originalUrl} on this Server!`,404));//any thing passed in next() it knows its an error and it skip all other midlwares and go to gloable error handling midlware
});

app.use(globalErrorHandler);
//handle all promise rejection that not handled by programmer
process.on('unhandledRejection',err=>{
    console.log('Unhandler rejection! shutting dowm.....');
    server.close(()=>{ //server.close is to give the server time to finish all the requests that is still pending or being handled at the time and only after this we kill the process
        process.exit(1); // it kill the process directly    //code 0 for sucess //1 for uncaught exception
// its optional to crash our application
    })

})

// console.log(x);