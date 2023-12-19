if(process.env.NODE_ENV !=="production"){
  require('dotenv').config();
}
console.log(process.env.SECRET);
console.log(process.env.API_KEY);

const express =require('express');
const path=require('path');
const mongoose=require('mongoose');
const ejsMate= require('ejs-mate');
const session=require('express-session');
const flash=require('connect-flash')
const {campgroundSchema,reviewSchema}=require('./schema.js')
const catchAsync=require('./utilis/catchAsync');
const ExpressError=require('./utilis/ExpressError');
const methodOverride=require('method-override');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');


const Campground = require('./models/campground');
const Review=require('./models/review');

const userRoutes=require('./routes/users')
const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes=require('./routes/reviews');

var dotenv = require('dotenv');
dotenv.config();

var url = process.env.dburl;
mongoose.connect(url,{
     useNewUrlParser:true,
    //  useCreateIndex:true,
     useUnifiedTopology:true,
    // useFindAndModify:false
     
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
app.use(express.static(path.join(__dirname,'public')))


const sessionConfig={
  secret:'thisshouldbeabtettersecret!',
  resave:false,
  saveUninitialized:true,
  Cookie:{
    httpOnly:true,
    expires:Date.now()+1000*60*60*24*7,
    maxAge:1000*60*60*24*7
  }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
  res.locals.currentUser=req.user;
  res.locals.success=req.flash('success');
  res.locals.error=req.flash('error');
  next();
})

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


app.get('/fakeUser',async(req,res)=>{
  const user=new User({email:'pratiksharma7739@gmail.com',username:'pratik'});
  const newUser=await User.register(user,'chicken');
  res.send(newUser);
})

app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrunds/:id/reviews', reviewRoutes)



app.get('/', (req,res)=>{
 res.render('home')
});

app.get('/campgrounds', catchAsync(async(req,res)=>{
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
  }));
  

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
