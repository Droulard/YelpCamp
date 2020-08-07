require("dotenv").config();
const express       = require("express");
const router        = express.Router();
var Campground      = require("../models/campground");
var Comment         = require("../models/comments");
const middlewear    = require("../middlewear");
const apiKey        = process.env.MAP_KEY;
const NodeGeo       = require("node-geocoder");

var options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODE_KEY,
    formatter: null
};

var geocoder = NodeGeo(options);


// INDEX ROUTE
router.get("/", function(req, res){
    // Get all campgrounds from db then render
    Campground.find({}, (err, dbCampgrounds)=>{
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds")
        }else{
            res.render("campgrounds/index", {campgrounds: dbCampgrounds, currentUser: req.user });
        }
    });
});


// CREATE CAMPGROUND
router.post("/",  middlewear.isAdmin, function(req, res){
    // Get Data from form and add to array
    let name = req.body.name;
    let link = req.body.link;
    let price = req.body.price;
    let desc = req.body.desc;
    let image = req.body.image;
    let author = {id: req.user._id, username: req.user.username};

    geocoder.geocode(req.body.location, (err, data) =>{
        if(err || !data.length){
            req.flash("err", "Error Could not process location");
            res.redirect("back");
        }

        let lat = data[0].latitude;
        let lng = data[0].longitude;
        let location = data[0].location;

        let newCamp = {name: name, price:price, desc:desc, image: image, author: author, link: link, location: location, lat: lat, lng: lng};
        Campground.create(newCamp, (err, newCampground) => {
            if(err){
                req.flash("error", err.message);
                res.redirect("/campgrounds");
            }else{
                res.redirect("/campgrounds");
            }
        });
    });
});

// NEW CAMPGROUND
router.get("/new", middlewear.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

// SHOW - shows more information about one campground
router.get("/:id", (req, res) =>{
    // Find campground provided ID
    Campground.findById(req.params.id).populate("comments").exec( (err, foundCamp) =>{
        if(err || !foundCamp){
            req.flash("error", err.message)
            res.redirect("/campgrounds")
        }else{
            // Render Show Template with Campground;
            res.render("campgrounds/showplace", {campground: foundCamp, apiKey: apiKey});
        }
    });
});

// Liked Campgrounds
router.post("/:id/like", middlewear.isLoggedIn, (req, res) =>{
    Campground.findById(req.params.id, (err, foundCamp) => {
        if(err || !foundCamp){
            req.flash("error", err.message);
            req.redirect("back")
        }

        let foundUserLike = foundCamp.likes.some((like) =>{
            return like.equals(req.user._id);
        });

        if(foundUserLike){
            foundCamp.likes.pull(req.user._id);
        }else{
            foundCamp.likes.push(req.user);
        }

        foundCamp.save((err) =>{
            if(err){
                req.flash("error", "Error: Unable to like camp");
                res.redirect("back");
            }
            return res.redirect("/campgrounds/" + foundCamp._id);
        });
    });
});

// EDIT CAMPGROUNDS
router.get("/:id/edit", middlewear.isCampOwner, (req, res) =>{
    Campground.findById(req.params.id, (err, foundCamp) =>{
        if(err || !foundCamp){
            req.flash("error", err.message)
            res.redirect("/campgrounds")
        }
        res.render("campgrounds/edit",  {Campground: foundCamp});
    });
});


// UPDATE CAMPGROUNDS 
router.put("/:id", middlewear.isCampOwner, (req, res) =>{
    let isNewLoc = false;
    
    Campground.findById(req.params.id, (err, foundCamp)=>{
        if( ! ( ( foundCamp.location === (req.body.campground.location) )   || (!foundCamp.location &&  req.body.campground.location.length === 0 ) ) ){
            isNewLoc = true;
        }

        console.log("Camp before changes: " + foundCamp);

        if(isNewLoc){
            geocoder.geocode(req.body.campground.location, (err, data) =>{
                if (err || !data.length) {
                    req.flash("err", "Error was made");
                    res.redirect("back");
                }

                req.body.campground.location  = data[0].location;
                req.body.campground.lat       = data[0].latitude;
                req.body.campground.lng       = data[0].longitude;

            })    
        }else{
            req.body.campground.location    = foundCamp.location
            req.body.campground.lng         = foundCamp.lng
            req.body.campground.lat         = foundCamp.lat
        }

    })
    
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, foundCamp)=>{
        if(err){
            req.flash("error", "Error: Unable to like camp");
            res.redirect("back");
        }
        return res.redirect("/campgrounds/" + foundCamp._id);
        
    } )  

})


// DELETE CAMPGROUND
router.delete("/:id", middlewear.isCampOwner, (req, res) =>{
    Campground.findByIdAndRemove(req.params.id, (err, removedCamp) =>{
        if (err || ! removedCamp) {   
            req.flash("error", err.message)
            res.redirect("/campgrounds")
        }
        Comment.deleteMany( {_id: {$in: removedCamp.comments}}, (err) =>{
            if(err){
                req.flash("error", err.message)
            }
            res.redirect("/campgrounds")
        });
    })
});

module.exports = router;