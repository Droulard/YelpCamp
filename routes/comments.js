const express   = require("express");
const router    = express.Router({mergeParams: true});
var Campground  = require("../models/campground")
var Comment     = require("../models/comments");
const middlewear    = require("../middlewear");

// NEW COMMENTS
router.get("/new", middlewear.isLoggedIn, (req, res) =>{
    Campground.findById(req.params.id, (err, campFound) =>{
        if (err || !campFound) {
            req.flash("error", "Error: The comment could not be made")
            res.redirect("back")
        } else {
            res.render("comments/new", {campground: campFound});
        }
    })
});

// CREATE COMMENTS
router.post("/", middlewear.isLoggedIn, (req, res) =>{
    Campground.findById(req.params.id, (err, campFound) => {
        if(err || !campFound){
            req.flash("error", err.message)
            res.redirect("/campgrounds")
        }else{
            Comment.create(req.body.comment, (err, comment) =>{
                if(err){
                    req.flash("error", "Error: An error occured when adding the comment");
                }else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campFound.comments.push(comment);
                    campFound.save();
                    req.flash("success", "You have successfully added a comment")
                    res.redirect("/campgrounds/" + campFound._id);
                }
            })
        }
    })
});

// EDIT COMMENT
router.get("/:comment_id/edit", middlewear.isCommentOwner, (req,res) =>{
    Comment.findById(req.params.comment_id, (err, foundComment) =>{
        if(err || !foundComment){
            req.flash("error", "Error: No Comment Found!")
            res.redirect("back")
        }else{
            res.render("comments/edit", {campground_id : req.params.id, comment: foundComment})
        }
    })
})

// UPDATE COMMENT
router.put("/:comment_id", middlewear.isCommentOwner, (req, res) =>{
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, UpdatedComment) => {
        if(err || !UpdatedComment){
            req.flash("error", "Error: No Comment Found!")
            res.redirect("back");
        }else{
            req.flash("success", "Comment Successfully Updated")
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
})

// DELETE COMMENT
router.delete("/:comment_id", middlewear.isCommentOwner, (req, res) =>{
    Comment.findByIdAndRemove(req.params.comment_id, (err, foundComment) => {
        if(err || !foundComment){
            req.flash("error", "Error: No Comment Found!")
            res.redirect("/campgrounds")
        }
        req.flash("succes", "Comment Successfully deleted")
        res.redirect("/campgrounds/" + req.params.id);
    })
})

module.exports = router;