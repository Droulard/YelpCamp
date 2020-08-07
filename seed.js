const   mongoose        = require("mongoose"),
        Comments        = require("./models/comments")
        Campground      = require("./models/campground");

let data = [
    {
        name: "Camp Yosemiti",
        desc: "Camp at Yosemiti National Park Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia sequi earum reiciendis quas quo asperiores debitis sapiente ut adipisci laudantium. Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia sequi earum reiciendis quas quo asperiores debitis sapiente ut adipisci laudantium.Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia sequi earum reiciendis quas quo asperiores debitis sapiente ut adipisci laudantium.", 
        image : "https://images.unsplash.com/photo-1516173953256-444587fcd3ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
    },
    {
        name: "Camp Salmon",   
        desc: "Camp with Salmon Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia sequi earum reiciendis quas quo asperiores debitis sapiente ut adipisci laudantium.",
        image : "https://images.unsplash.com/photo-1570207396332-f8a67821adf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
    },
    {
        name: "Camp BearClaw", 
        desc: "Camp with nature Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia sequi earum reiciendis quas quo asperiores debitis sapiente ut adipisci laudantium.",
        image : "https://images.unsplash.com/photo-1552355170-c8337700279c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
    }
]


let seedDB = function (params) {
    Campground.deleteMany({},(err) =>{
        if(err){
            console.log(err);
        }else{
            console.log("Campgrounds Removed!")
        }
    })
    // .then(
    //     data.forEach((camp) =>{
    //         Campground.create(camp, (err, newCamp) =>
    //         {
    //             if(err){
    //                 console.log(err);
    //             }else{
    //                 console.log("Created");
    //                 Comments.create(
    //                     {
    //                         text: "This place is amazing",
    //                         author: "Simpson"
    //                     }, (err, comment) =>{
    //                         if(err){
    //                             console.log(err);
    //                         }else{
    //                             newCamp.comments.push(comment);
    //                             newCamp.save();
    //                             console.log("Created Comments");
    //                         }
    //                     }
    //                 )
    //             }
    //         });
    //     }));

}

module.exports = seedDB;