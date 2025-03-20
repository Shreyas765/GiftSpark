// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Only required if not using Google Auth
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined values
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // References to gift profiles created by this user
  giftProfiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GiftProfile',
  }],
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);