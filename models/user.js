const       mongoose  = require("mongoose"),
            passLocal = require("passport-local-mongoose");


var UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    avatar: String,
    firstName: String,
    lastName: String,
    email: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, default:false},
    createdAt: { type:Date, default: Date.now}
});

UserSchema.plugin(passLocal);
module.exports = mongoose.model("User", UserSchema);