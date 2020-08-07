var Campground  = require("../models/campground")
var Comment     = require("../models/comments");

const middlewareOBJ = {};

middlewareOBJ.isCampOwner = function(req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, (err, foundCamp) =>{
            if(err || !foundCamp){
                req.flash("error", "Error: No Campground Found!");
                res.redirect("/campgrounds");
            }else{
                if( foundCamp.author.id.equals(req.user._id) || (req.user.isAdmin)){
                    next();
                } else{
                    req.flash("error", "Error: You do not have permission to do that");
                    res.redirect("back");
                }
            }
        })
    }else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back")
    }
}

middlewareOBJ.isCommentOwner = function (req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundComment) =>{
            if(err || !foundComment){
                req.flash("error", "Error: No Campground Found!");
                res.redirect("/campgrounds");
            }else{
                if( foundComment.author.id.equals(req.user._id) || (req.user.isAdmin)){
                    next();
                } else{
                    req.flash("error", "Error: You do not have permission to do that");
                    res.redirect("back");
                }
            }
        })
    }else{
        console.log("You need to be logged in to do that");
        res.redirect("back")
    }
}


middlewareOBJ.isAdmin = function(req, res, next){
    if(!req.isAuthenticated() || !req.user){
        req.flash("error", "Error: You must have an admin account to go here");
        res.redirect("/campgrounds");
    }
    if(req.user.isAdmin){
        next();
    }else{
        req.flash("error", "Error: You must be an admin to do this");
        res.redirect("/campgrounds")
    }
}


middlewareOBJ.isLoggedIn = function (req, res, next) {
    if(req.isAuthenticated()){
        return next()
    }
    req.flash("error", "You must have an account to do that")
    res.redirect("/register")
}


module.exports = middlewareOBJ