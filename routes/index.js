const express = require("express");
const router  = express.Router();
var User = require("../models/user");
const passport = require("passport");
const { route } = require("./campgrounds");

const async     = require("async");
const nodemail  = require("nodemailer");
const crypto    = require("crypto");
const adminPass = "Watchmen"
require("dotenv").config();


 
// ROOT ROUTE
router.get("/", function(req, res){
    res.render("landingPage");
});

// REGISTRATION FORM
router.get("/register", (req, res) => {
    res.render("register");
})

// REGISTRATION LOGIC
router.post("/register", (req, res) =>{
    let newUser = new User({
        username:   req.body.username, 
        firstName:  req.body.firstName,
        lastName:   req.body.lastName,
        email:      req.body.email,
        avatar:     req.body.avatar
    });
    if(req.body.password === adminPass){
        newUser.isAdmin = true
    }

    User.register(newUser, req.body.password, (err, user) =>{
        if (err) {
            req.flash("error", err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
        
    });
});


// Change Users
router.get("/switchUsers", (req, res) =>{
    req.logout();
    req.flash("success", "Logged You Out")
    res.redirect("login")
})


// LOGIN FORM
router.get("/login", (req, res) => {
    res.render("login");
});

// LOGIN LOGIC
router.post("/login", function(req, res, next){
    passport.authenticate("local", {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true,
        failureFlash: 'Invalid username or password.',
        successFlash: "Welcome to YelpCamp " + req.body.username
    }) (req, res)
});

// LOG OUT
router.get("/logout", (req, res) =>{
    req.logout();
    req.flash("success", "Logged You Out")
    res.redirect("/");
});

// Forgot Password
router.get("/forgot", (req, res) =>{
    res.render("forgot");
});

router.post("/forgot", (req, res, next) =>{
    async.waterfall([
        (done)=>{
            crypto.randomBytes(20, (err, buff) =>{
                let token = buff.toString("hex");
                done(err, token)
            });
        },
        (token, done) =>{
            User.findOne({email: req.body.email}, (err, user) =>{
                if(!user){
                    req.flash("error", "Could not find your account");
                    return res.redirect("/forgot");
                }

                user.resetPasswordToken = token
                user.resetPasswordExpires = Date.now() + 3600000;
                user.save((err) =>{ 
                    done(err, token, user);
                });
            });
        },
        (token, user, done) =>{
            let smtpTransport = nodemail.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'kyle.droulard@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            let mailOptions = {
                to: user.email,
                    from: "kyle.droulard@gmail.com",
                    subject:"Node.JS Password Reset",
                    text:   "You  are receiving the following email, because you have requested your password to be reset. \n" +
                            "Please click on the following link to reset your password: \n" +
                            "http://" + req.headers.host + "/reset/" + token + "\n\n" +
                            "If you did not request your password to be reset please ignore this email and contact support."
                };
                smtpTransport.sendMail(mailOptions, (err) =>{
                    req.flash("success", "An email has been sent to " + user.email);
                    done(err, "done");
                });
            }], (err) =>{
                if(err) return next(err);
                res.redirect("/forgot");
            }
    );
});

router.get('/reset/:token', (req, res) =>{
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires:{ $gt: Date.now()}}, (err, user) =>{
        if(!user || err) {
            req.flash("error", "An error has occured");
            return res.redirect("/forgot");
        }
        res.render("reset", {token: req.params.token});
    });
});


router.post("/reset/:token", (req, res) =>{
    async.waterfall([
        (done) =>{
            User.findOne({resetPasswordToken: req.params.token,  resetPasswordExpires:{ $gt: Date.now()}}, (err, user) => {
                if(!user){
                    req.flash("error", "Reset Token Has Expired");
                    return res.redirect("back")
                }

                if(req.body.password === req.body.confirm){
                    user.setPassword(req.body.password, (err) =>{
                        user.resetPasswordExpires   = undefined;
                        user.resetPasswordToken     = undefined;

                        user.save((err) =>{
                            req.logIn(user, (err) =>{
                                done(err, user);
                            });
                        });
                    });
                }else{
                    req.flash("err", "Passwords must match");
                    return res.redirect("back");
                }
            });
        }, 
        (user, done) =>{
            let smtpTransport = nodemail.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'kyle.droulard@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            let mailOptions = {
                to: user.email,
                    from: "kyle.droulard@gmail.com",
                    subject:"Password Has Been Reset",
                    text:   "Hello there, \n " +
                            "You  are receiving the following email, because your password has been reset"+
                            "If you did not request your password to be reset please contact support."
                };
                smtpTransport.sendMail(mailOptions, (err) =>{
                    req.flash("success", "Your password has been reset");
                    done(err, "done");
                });
        }, (err) =>{
            res.redirect("/campgrounds");
        }
    ]);
});


module.exports = router;