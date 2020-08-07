require("dotenv").config();

const   express             = require("express"),
        app                 = express(),
        bodyParser          = require("body-parser"),
        mongoose            = require("mongoose"),
        Campground          = require("./models/campground"),
        Comment             = require("./models/comments"),
        flash               = require("connect-flash"),
        passport            = require("passport"),
        localStrat          = require("passport-local"),
        User                = require("./models/user"),
        seedDB              = require("./seed"),
        methodOverride      = require("method-override"),
        moment              = require("moment"),
        commentRoutes       = require("./routes/comments"),
        campRoutes          = require("./routes/campgrounds"),
        userRoutes          = require("./routes/users"),
        authRoutes          = require("./routes/index");

app.locals.moment = require('moment');
mongoose.connect("mongodb://localhost:27017/yelp_camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
.then(() => console.log("Connected to DB!"))
.catch(error => console.log(error));

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static( __dirname +"/assets"));
app.use(methodOverride("_method"));
app.use(flash());

// seedDB();


app.use(require("express-session")({
    secret: "Lincoln is the best President",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) =>{
    res.locals.currentUser  = req.user;
    res.locals.error        = req.flash("error") ;
    res.locals.success      = req.flash("success")

    next();
});

passport.use(new localStrat(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// AQUIRE ROUTES
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", authRoutes);
app.use("/campgrounds",campRoutes);
app.use("/users", userRoutes)

// app.get("*", function(req, res){
//     req.flash("error", "Unable to reach your last page!")
//     res.redirect("/campgrounds");
// })


app.listen(process.env.PORT || 3000, function(){
    console.log("Yelp Camp Server");
});