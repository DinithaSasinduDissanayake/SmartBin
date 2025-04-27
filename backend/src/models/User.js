const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please fill a valid phone number']
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'Sri Lanka' },
    // Placeholder for future Geolocation integration
    location: {
      type: { type: String, enum: ['Point'], required: false },
      coordinates: { type: [Number], required: false } // [longitude, latitude]
    }
  },
  preferences: {
    pickupNotes: { type: String, trim: true, maxlength: 500 }
    // Add other preference fields as needed later
  },
  skills: [{ type: String, trim: true }], // Array of skill names for staff
  availability: {
    type: String, // Could be 'Mon-Fri 9-5', 'Weekends Only', etc.
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please Enter Your Password'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'customer'], // Updated enum
    default: 'customer', // Updated default
  },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, select: false }, // Don't return secret by default
  mfaRecoveryCodes: { type: [String], select: false }, // Store hashed recovery codes
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
userSchema.index({ role: 1 }); // Add index for role if queried often
userSchema.index({ 'address.city': 1 }); // Index for city searches
userSchema.index({ skills: 1 }); // Index for staff skills searches

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