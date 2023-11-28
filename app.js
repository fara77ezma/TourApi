const mongoose=require('mongoose');
const express=require('express');
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
app.use(express.json());
app.use(express.urlencoded());
app.use(morgan('dev'))
mongoose.connect(process.env.MONGO_URI,{
}).then(()=>console.log("connect succesfully!"));
mongoose.set('setDefaultsOnInsert', true);
const server=app.listen(3000);
app.use((req,res,next)=>{
    console.log(req.headers);
    next();
})
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