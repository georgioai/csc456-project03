const mongoose = require("mongoose");

const freelancerSchema = new mongoose.Schema({
    name:{type: String, required:true},
    email:{type: String, required:true, unique:true},
    skills:{type: [String]}, //ex: ["JavaScript", "Python", "Node.JS"]
    hourlyRate:{type:Number}, //ex: $50/hour
    country:{type:String},
    bio:{type:String},

},
  {timestamps:true}
);

// Export the Freelancer model to use in other parts of the application
module.exports = mongoose.model("Freelancer", freelancerSchema);