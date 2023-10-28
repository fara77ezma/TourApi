const mongoose=require('mongoose');
const dotenv=require('dotenv');
const fs=require('fs');
const Tour=require('../models/Tour');


dotenv.config({path:'./config/config.env'});

mongoose.connect(process.env.DATABASE,{
})
// read data from files
const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));//conver json data to javascript object

//import data to database
const iimport=async()=>{
  try {
    await Tour.create(tours);
    console.log('data successfuly loaded');
    process.exit();

  } catch (e) {
console.log(e);
  }
}
//delete all the data from DB
const deletee=async()=>{
  try {
    await Tour.deleteMany();
    console.log('data successfuly deleted');
    process.exit();
  } catch (e) {
console.log(e);
  }
}
if(process.argv[2]==='--import') iimport();
else if(process.argv[2]==='--delete') deletee();
