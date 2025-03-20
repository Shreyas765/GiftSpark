// routes/giftProfiles.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const GiftProfile = require('../models/GiftProfile');

// Get all gift profiles for a user
router.get('/', auth, async (req, res) => {
  try {
    const giftProfiles = await GiftProfile.find({ userId: req.user.id });
    res.json(giftProfiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get a specific gift profile
router.get('/:id', auth, async (req, res) => {
  try {
    const giftProfile = await GiftProfile.findById(req.params.id);
    
    // Check if gift profile exists
    if (!giftProfile) {
      return res.status(404).json({ msg: 'Gift profile not found' });
    }
    
    // Check if user owns the gift profile
    if (giftProfile.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    res.json(giftProfile);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gift profile not found' });
    }
    res.status(500).send('Server error');
  }
});

// Create a new gift profile
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      relationship,
      age,
      gender,
      interests,
      occasionTypes,
      budget,
      previousGifts,
    } = req.body;
    
    // Create new gift profile
    const newGiftProfile = new GiftProfile({
      userId: req.user.id,
      name,
      relationship,
      age,
      gender,
      interests,
      occasionTypes,
      budget,
      previousGifts,
    });
    
    const giftProfile = await newGiftProfile.save();
    
    // Add gift profile to user's giftProfiles array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { giftProfiles: giftProfile._id } }
    );
    
    res.json(giftProfile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update a gift profile
router.put('/:id', auth, async (req, res) => {
  try {
    const giftProfile = await GiftProfile.findById(req.params.id);
    
    // Check if gift profile exists
    if (!giftProfile) {
      return res.status(404).json({ msg: 'Gift profile not found' });
    }
    
    // Check if user owns the gift profile
    if (giftProfile.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Update gift profile
    const updatedGiftProfile = await GiftProfile.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(updatedGiftProfile);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gift profile not found' });
    }
    res.status(500).send('Server error');
  }
});

// Delete a gift profile
router.delete('/:id', auth, async (req, res) => {
  try {
    const giftProfile = await GiftProfile.findById(req.params.id);
    
    // Check if gift profile exists
    if (!giftProfile) {
      return res.status(404).json({ msg: 'Gift profile not found' });
    }
    
    // Check if user owns the gift profile
    if (giftProfile.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Delete gift profile
    await GiftProfile.findByIdAndDelete(req.params.id);
    
    // Remove gift profile from user's giftProfiles array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { giftProfiles: req.params.id } }
    );
    
    res.json({ msg: 'Gift profile removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gift profile not found' });
    }
    res.status(500).send('Server error');
  }
});

// Add a previous gift to a profile
router.post('/:id/gifts', auth, async (req, res) => {
  try {
    const giftProfile = await GiftProfile.findById(req.params.id);
    
    // Check if gift profile exists
    if (!giftProfile) {
      return res.status(404).json({ msg: 'Gift profile not found' });
    }
    
    // Check if user owns the gift profile
    if (giftProfile.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    const { description, occasion, date, liked } = req.body;
    
    // Add gift to previousGifts array
    giftProfile.previousGifts.push({
      description,
      occasion,
      date,
      liked,
    });
    
    await giftProfile.save();
    
    res.json(giftProfile);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gift profile not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;