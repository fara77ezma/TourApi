const mongoose=require('mongoose');
const express=require('express');
const app= express();
const jwt= require('jsonwebtoken');
const dotenv=require('dotenv');
const morgan=require('morgan');
const globalErrorHandler=require('./controllers/errorController');
const AppError=require('./utils/appError');

dotenv.config({path:'./config/config.env'});
app.use(express.json());
app.use(express.urlencoded());
app.use(morgan('dev'))
mongoose.connect(process.env.MONGO_URI,{
}).then(()=>console.log("connect succesfully!"));
mongoose.set('setDefaultsOnInsert', true);
app.listen(3000);
app.use('/api/tours',require('./Routes/tours'));

app.all('*',(req,res,next)=>{ // all -> is to handle all http requests types , * -> is to handle all the url would pass to it
    
    next(new AppError(`Can't find this ${req.originalUrl} on this Server!`,404));//any thing passed in next() it knows its an error and it skip all other midlwares and go to gloable error handling midlware
});

app.use(globalErrorHandler);

