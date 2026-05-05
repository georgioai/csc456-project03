const mongoose = require("mongoose");

const clientSchema= new mongoose.Schema({
    name:{type: String, required:true},
    email:{type: String, required:true, unique:true},
    company:{type: String},
    phone:{type: String},
    country:{type: String},
},
   {timestamps:true}

);

// Export the User model to use in other parts of the application
module.exports = mongoose.model("Client", clientSchema);