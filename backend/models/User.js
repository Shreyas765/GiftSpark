const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Stores gift profiles created by the user (friend shopping notes)
  friendProfiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile', // <-- Corrected reference (not 'Profiles')
  }],
  // Stores gifts liked by the user
  likedGifts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gift', // NOTE: I DONT HAVE A GIFT MODEL YET (so replace or implement this later)
  }],
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
