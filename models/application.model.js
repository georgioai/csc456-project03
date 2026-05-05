const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    job:{type: mongoose.Schema.Types.ObjectId, ref:"Job", required:true},
    freelancer:{type: mongoose.Schema.Types.ObjectId, ref:"Freelancer", required:true},
    coverLetter:{type:String},
    proposedRate:{type:Number},
    status:{type:String, enum:["pending", "accepted", "rejected"], default:"pending"},
    appliedAt:{type:Date, default:Date.now},
},
    {timestamps:true}
);

// Export the Application model to use in other parts of the application
module.exports = mongoose.model("Application", applicationSchema);

/*
MANY TO MANY RELATIONSHIP 
   FREELANCER <-> JOB THROUGH THE APPLICATION ENTITY 

   A FREELANCER CAN APPLY TO MANY JOBS
    A JOB CAN HAVE MANY APPLICATIONS FROM MANY FREELANCERS

*/