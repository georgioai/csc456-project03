const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String, required:true},
    category:{type: String},
    budget:{type:Number},
    deadline:{type:Date},
    status:{type:String, enum:["open", "in progress", "closed"], default:"open"},
    expectedPeriod:{type:String, enum:["2 weeks", "1 month", "2 months", "+3 months"]},
    client:{type: mongoose.Schema.Types.ObjectId, ref:"Client", required:true},
},
    {timestamps:true}
);

// Export the Job model to use in other parts of the application
module.exports = mongoose.model("Job", jobSchema);

/* 
ONE TO MANY RELATIONSHIP 
CLIENT -> JOB
A CLIENT CAN POST MANY JOBS 

*/