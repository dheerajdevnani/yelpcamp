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
         const price=Math.floor(Math.random()*20)+10;
         const camp= new Campground({
            author:'657d9c8d404631cdc4c00586',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            // image:'https://source.unsplash.com/collection/2184453',
            description:'wow! very beautiful places!',
            price,
            geometry:{
                 type:"Point",
                 coordinates:[
                  cities[random1000].longitude,
                  cities[random1000].latitude, 
                ]
            },
            images:[       
              {
                url: 'https://res.cloudinary.com/da1qsm7rq/image/upload/v1703124998/newProject/qdl9bl2zt0fk6d3xoi8x.jpg',
                filename: 'newProject/qdl9bl2zt0fk6d3xoi8x',    
                // _id: new ObjectId("6583a00e376a128c2bba927a")   
              },
              {
                url: 'https://res.cloudinary.com/da1qsm7rq/image/upload/v1703125001/newProject/ed7svtwstrqsz8x6gdtq.jpg',
                filename: 'newProject/ed7svtwstrqsz8x6gdtq',    
                // _id: new ObjectId("6583a00e376a128c2bba927b")   
              },
              {
                url: 'https://res.cloudinary.com/da1qsm7rq/image/upload/v1703125004/newProject/mno23rxa5hu3dkkn8d8h.jpg',
                filename: 'newProject/mno23rxa5hu3dkkn8d8h',    
              }
            ]


            
        })
        await camp.save();
    }
}
seedDB().then(()=>{
  mongoose.connection.close();
})


