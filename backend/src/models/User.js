const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema =  new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter Your Name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please Enter Your Email'],
    unique: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please Enter Your Password'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['Resident/Garbage_Buyer', 'staff', 'admin', 'financial_manager'],
    default: 'Resident/Garbage_Buyer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
userSchema.index({ email: 1 }); // Already implicitly indexed due to unique: true
userSchema.index({ role: 1 }); // Add index for role if queried often

//Encrypting Password Before Saving
userSchema.pre('save', async function(next){
  if(!this.isModified('password')){
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);