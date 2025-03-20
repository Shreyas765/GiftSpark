// models/GiftProfile.js
const mongoose = require('mongoose');

const GiftProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  relationship: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
  },
  interests: [{
    type: String,
  }],
  occasionTypes: [{
    type: String, // e.g., "birthday", "anniversary", "christmas"
  }],
  budget: {
    min: {
      type: Number,
    },
    max: {
      type: Number,
    },
  },
  previousGifts: [{
    description: String,
    occasion: String,
    date: Date,
    liked: Boolean,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
GiftProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('GiftProfile', GiftProfileSchema);