const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  recipientName: {
    type: String,
    required: true,
  },
  recipientDetails: {
    age: Number,
    gender: String,
    interests: [String],
    hobbies: [String],
    preferences: [String],
  },
  previousGifts: [{
    giftName: String,
    dateGiven: Date,
    successRating: Number,
    notes: String,
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

module.exports = mongoose.model('UserProfile', userProfileSchema); 