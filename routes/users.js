const   express       = require("express"),
        router        = express.Router(),
        Campground    = require("../models/campground"),
        Comment       = require("../models/comments"),
        User          = require("../models/user"),
        middlewear    = require("../middlewear");



router.get("/", middlewear.isLoggedIn, (req, res) =>{
    User.find({}, function(err, users){   
        res.render("users", {users: users});
    });
});

router.get("/:id", middlewear.isLoggedIn, (req, res) =>{
    User.findById(req.params.id, (err, foundUser) =>{
        if(err || !foundUser){
            console.log(err)
            req.flash("error", "Could Not Find User");
            return res.redirect("back");
        }
        res.redirect("/campgrounds");
    })
});


router.get("/edit/:id", middlewear.isLoggedIn, (req, res) =>{
    res.send("Made it!")
})


router.put("/:id/addAdmin", middlewear.isAdmin, (req, res) =>{
    User.findByIdAndUpdate(req.params.id, {isAdmin: true}, (err, updatedUser) =>{
        if(err || !(updatedUser)){
            req.flash("error", err.message);
        }else{
            req.flash("success", updatedUser.username + " is now an admin");
        }
        res.redirect("back");
           
    });
});

router.put("/:id/removeAdmin", middlewear.isAdmin, (req, res) =>{
    User.findByIdAndUpdate(req.params.id, {isAdmin: false}, (err, updatedUser) =>{
        if(err || !(updatedUser)){
            req.flash("error", err.message);
        }else{
            req.flash("success", updatedUser.username + " has lost admin privilages");
        }
        res.redirect("back");
    });
});

router.delete("/:id", middlewear.isAdmin, (req, res) =>{
    User.findByIdAndRemove(req.params.id, (err, removedUser) =>{
        if(err || !removedUser){
            req.flash("error", "There has ben an error!");
        }else{
            req.flash("success", removedUser.username + " has been removed")
        }
        res.redirect("back");
    })
})

module.exports = router;