const mongoose = require("mongoose");

// Schema Setup
let campSchema = new mongoose.Schema({
    name:  String,
    price: String,
    desc:  String,
    image: String,
    link: String,
    location: String,
    lat: Number,
    lng: Number,
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    createdAt: { type:Date, default: Date.now},
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
})

module.exports = mongoose.model("Campground", campSchema);