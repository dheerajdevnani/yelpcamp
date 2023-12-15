const express =require('express');
const path=require('path');
const mongoose=require('mongoose');
const ejsMate= require('ejs-mate');
// const Joi=require('joi');
const {campgroundSchema,reviewSchema}=require('./schema.js')
const catchAsync=require('./utilis/catchAsync');
const ExpressError=require('./utilis/ExpressError');
const methodOverride=require('method-override');
const Campground = require('./models/campground');
const Review=require('./models/review')


var dotenv = require('dotenv');
dotenv.config();

var url = process.env.dburl;
mongoose.connect(url,{
     useNewUrlParser:true,
     useUnifiedTopology:true
});
const db=mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open",()=>{
  console.log("database connected");
});

const app=express();

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extened:true}));
app.use(methodOverride('_method'));

const validateCampground=(req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body);  
    if(error){
      const msg=error.details.map(el => el.message).join(',')
      throw new ExpressError(msg,400)
    }else{
      next();
    }
}

const validateReview=(req,res,next)=>{
   const{error}=reviewSchema.validate(req.body);
   if(error){
    const msg=error.details.map(el=>el.message).join(',')
    throw new ExpressError(msg,400)
   }
   else{
    next();
   }
}

app.get('/', (req,res)=>{
 res.render('home')
});
app.get('/campgrounds',catchAsync(async(req,res)=>{
  const campgrounds=await Campground.find({});
  res.render('campgrounds/index',{campgrounds})
  
}));
app.get('/campgrounds/new',(req,res)=>{
  res.render('campgrounds/new');
})

// app.post('/campgrounds', catchAsync(async(req,res,next)=>{
//         if(!req.body.campground) throw new ExpressError('Invalid Campgound Data',400);
//         console.log(res.body.campground);
//         const campground=new Campground(res.body.campground);
//         await campground.save();
//         res.redirect(`/campground/${campground._id}`)
      
//   }))
  // const result=campgroundSchema.validate(req.body);
app.post('/campgrounds', validateCampground, catchAsync(async(req,res,next)=>{
 
  // console.log(result);
  const campground=new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`)
  }))
  

app.get('/campgrounds/:id',catchAsync(async (req, res,)=>{
  const campground = await Campground.findById(req.params.id).populate('reviews');
  // console.log(campground);
   res.render('campgrounds/show',{campground});

}));
app.get('/campgrounds/:id/edit',catchAsync(async (req, res,)=>{
  const campground = await Campground.findById(req.params.id)
   res.render('campgrounds/edit',{campground});

}));
app.put('/campgrounds/:id',validateCampground, catchAsync(async (req,res)=>{
  // res.send("IT WORKED!!")
  const {id}=req.params;
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
  res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id', catchAsync(async (req,res)=>{
  const {id}=req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req,res)=>{
  const campground=await Campground.findById(req.params.id);
  const review= new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async(req,res)=>{
  const {id,reviewId}=req.params;
  await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`);
    // res.send("delete me!!")
}))



app.all('*',(req,res,next) =>{
   next(new ExpressError('page not found',404))
  // res.send("40003!!!")
}) 

// app.use((err,req,res,next)=>{
//   const{statusCode=500, message='something went wrong!'}=err;
//    res.status(statusCode).render(message)
// })
app.use((err,req,res,next)=>{
  const {statusCode=500}=err;
  if(!err.message) err.message='oh no,Something went wrong!'
  res.status(statusCode).render('error',{err})
  // res.send('oh boy,something went wrong!')
})


app.listen(3000,()=>{
    console.log('serving on the port 3000')
})

