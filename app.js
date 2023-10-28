const mongoose=require('mongoose');
const express=require('express');
const app= express();
const jwt= require('jsonwebtoken');
const dotenv=require('dotenv');
const morgan=require('morgan');
dotenv.config({path:'./config/config.env'});
app.use(express.json());
app.use(express.urlencoded());
app.use(morgan('dev'))
mongoose.connect(process.env.DATABASE,{
}).then(app.listen(3000))
app.use('/api/tours',require('./Routes/tours'));
