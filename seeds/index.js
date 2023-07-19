// const express =require('express');
// const path=require('path');
const mongoose=require('mongoose');
const cities=require('./cities');
const {places,descriptors}=require('./seedhelper');
const Campground = require('../models/campground');
// const campground = require('../models/campground');

mongoose.connect('mongodb+srv://pratiksharma7739:pratik123@cluster0.eiik7nb.mongodb.net/?retryWrites=true&w=majority',{
     useNewUrlParser:true,
     useUnifiedTopology:true
});

const db=mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open",()=>{
  console.log("database connected");
});

const sample=array=>array[Math.floor(Math.random()*array.length)];

const seedDB = async()=>{
    await Campground.deleteMany({});
    // const c=new Campground({title:`kjhf djhfds`});
    // await c.save();
    for(let i=0;i<50;i++){
        const random1000=Math.floor(Math.random()*1000);

       const camp= new Campground({
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`
        })
        await camp.save();
    }
}
seedDB();


