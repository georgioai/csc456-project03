const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true ,minlength: 2, maxlength: 50},//not username because we need a full name for later docs, cleaner
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'client', 'freelancer'], required: true ,default:'freelancer'},//freelancer have the lowest authority
    /*A user could be a Client or a Freelancer. 
    We want to store a reference to their profile document, 
    but we don't know at schema-definition time which collection it will be — 
    it depends on the role.*/
    refId: { type: mongoose.Schema.Types.ObjectId, refPath: 'roleRef' },
    roleRef: { type: String, enum: ['Client', 'Freelancer'] }
    //therefore we got a dynamic reference using refPath, which will point to either the Client or Freelancer collection based on the user's role
},
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);